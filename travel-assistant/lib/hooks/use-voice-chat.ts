"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useChat, type Message } from "ai/react"
import { voiceService } from "../services/voice-service"

interface UseVoiceChatOptions {
  api: string
  id?: string
  initialMessages?: Message[]
  initialInput?: string
  onResponse?: (message: Message) => void
  onFinish?: (message: Message) => void
  onVoiceSubmit?: () => void
}

// Custom implementation of useChat that works with our non-streaming API
export function useVoiceChat({
  api,
  id,
  initialMessages = [],
  initialInput = "",
  onResponse,
  onFinish,
  onVoiceSubmit,
}: UseVoiceChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState(initialInput)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isInterrupted, setIsInterrupted] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState<boolean>(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Queue for managing speech
  const speechQueue = useRef<{ text: string; onEnd?: () => void; onInterrupt?: () => void }[]>([]);
  const isSpeechProcessing = useRef(false);

  // Process speech queue
  const processSpeechQueue = useCallback(async () => {
    if (isSpeechProcessing.current || speechQueue.current.length === 0) return;

    isSpeechProcessing.current = true;
    const { text, onEnd, onInterrupt } = speechQueue.current[0];

    try {
      await new Promise<void>((resolve, reject) => {
        if (!voiceService) {
          reject(new Error("Voice service not available"));
          return;
        }

        voiceService.speak(
          text,
          () => {
            resolve();
            if (onEnd) onEnd();
          },
          () => {
            reject(new Error("Speech interrupted"));
            if (onInterrupt) onInterrupt();
          }
        );
      });
    } catch (error) {
      console.error("Error in speech processing:", error);
    } finally {
      speechQueue.current.shift();
      isSpeechProcessing.current = false;
      processSpeechQueue();
    }
  }, []);

  // Enhanced speak message function that uses queue
  const speakMessage = useCallback((text: string, onEnd?: () => void, onInterrupt?: () => void) => {
    speechQueue.current.push({ text, onEnd, onInterrupt });
    processSpeechQueue();
  }, [processSpeechQueue]);

  // Check voice service initialization on mount
  useEffect(() => {
    if (voiceService) {
      const status = voiceService.getInitializationStatus();
      setVoiceSupported(status.isInitialized);
      if (!status.isInitialized && status.error) {
        setVoiceError(status.error);
        console.warn("Voice service initialization failed:", status.error);
      }
    }
  }, []);

  // Function to summarize response for voice output
  const summarizeForVoice = useCallback((content: string) => {
    // Extract the first section before any detailed listings
    const firstSection = content.split(/(?=##|\n-)/)[0].trim();
    
    // If the first section is too short, include a bit more context
    if (firstSection.length < 100) {
      const sections = content.split(/(?=##)/).slice(0, 2);
      return sections.join(' ').replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
    }
    
    return firstSection.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim() || isLoading) return

      // Add user message to the list
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      }

      setMessages((messages) => [...messages, userMessage])
      setInput("")
      setIsLoading(true)
      setError(null)

      try {
        // Create a new abort controller for this request
        abortControllerRef.current = new AbortController()

        // Send the request to the API
        const response = await fetch(api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Parse the response
        const data = await response.json()

        // Create the assistant message with full response
        const assistantMessage: Message = {
          id: data.id || Date.now().toString(),
          role: "assistant",
          content: data.content,
        }

        // Add the assistant message to the list
        setMessages((messages) => [...messages, assistantMessage])

        // Call the onFinish callback
        if (onFinish) {
          onFinish(assistantMessage)
        }

        // Auto-speak the summarized response if speaking is enabled
        if (isSpeaking && !isInterrupted) {
          const summary = summarizeForVoice(data.content)
          speakMessage(summary)
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error in chat request:", error)
          setError(error)
        }
      } finally {
        setIsLoading(false)
        setIsInterrupted(false)
      }
    },
    [api, input, isLoading, messages, onFinish, isSpeaking, isInterrupted, summarizeForVoice]
  )

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  // Stop the current request
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  // Submit with voice
  const submitWithVoice = useCallback(() => {
    if (transcript.trim()) {
      setInput(transcript)

      // Small delay to ensure input is updated
      setTimeout(() => {
        const form = document.getElementById("chat-form") as HTMLFormElement
        if (form) {
          form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
        }
      }, 100)

      setTranscript("")
      setIsListening(false)

      if (voiceService) {
        voiceService.stopListening()
      }

      // Call the onVoiceSubmit callback if provided
      if (onVoiceSubmit) {
        onVoiceSubmit()
      }
    }
  }, [transcript, onVoiceSubmit])

  // Toggle voice listening
  const toggleListening = useCallback(() => {
    if (!voiceService || !voiceSupported) {
      setError(new Error(voiceError || "Voice input is not available"));
      return;
    }

    if (isListening) {
      voiceService.stopListening()
      setIsListening(false)
      setTranscript("")
    } else {
      setError(null) // Clear any previous errors
      voiceService.startListening(
        (text, isFinal) => {
          setTranscript(text)
          if (isFinal) {
            setInput(text)
          }
        },
        (error) => {
          console.error("Speech recognition error:", error)
          setError(new Error(typeof error === 'string' ? error : 'Failed to start voice input'))
          setIsListening(false)
        },
        // Add auto-submit handler
        () => {
          if (transcript.trim()) {
            submitWithVoice();
          }
        }
      )
      setIsListening(true)
    }
  }, [isListening, voiceSupported, voiceError, transcript, submitWithVoice])

  // Toggle voice speaking
  const toggleSpeaking = useCallback(() => {
    if (voiceService) {
      if (isSpeaking) {
        voiceService.stopSpeaking();
      }
      setIsSpeaking(!isSpeaking);
    }
  }, [isSpeaking]);

  // Interrupt the current response
  const interrupt = useCallback(() => {
    if (isLoading) {
      stop()

      if (voiceService && voiceService.isCurrentlySpeaking()) {
        voiceService.stopSpeaking()
      }

      setIsInterrupted(true)
    }
  }, [isLoading, stop])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (voiceService) {
        if (voiceService.isCurrentlyListening()) {
          voiceService.stopListening()
        }

        if (voiceService.isCurrentlySpeaking()) {
          voiceService.stopSpeaking()
        }
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    isListening,
    isSpeaking,
    transcript,
    isInterrupted,
    toggleListening,
    toggleSpeaking,
    speakMessage,
    interrupt,
    submitWithVoice,
    voiceSupported,
    voiceError,
  }
}

