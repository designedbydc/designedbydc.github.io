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

        // Create the assistant message
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

        // Auto-speak the response if speaking is enabled
        if (isSpeaking && !isInterrupted) {
          speakMessage(assistantMessage.content)
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
    [api, input, isLoading, messages, onFinish, isSpeaking, isInterrupted]
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
      )
      setIsListening(true)
    }
  }, [isListening, voiceSupported, voiceError])

  // Toggle voice speaking
  const toggleSpeaking = useCallback(() => {
    setIsSpeaking(!isSpeaking)

    if (isSpeaking && voiceService) {
      voiceService.stopSpeaking()
    }
  }, [isSpeaking])

  // Speak a message
  const speakMessage = useCallback(
    (text: string) => {
      if (!voiceService || !isSpeaking) return

      voiceService.speak(
        text,
        () => {
          // On end
        },
        () => {
          // On interrupt
          setIsInterrupted(true)
        },
      )
    },
    [isSpeaking],
  )

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

