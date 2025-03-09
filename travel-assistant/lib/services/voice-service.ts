"use client";

// Voice service for speech recognition and synthesis

// Helper to safely check if we're in a browser environment
const isBrowser = () => typeof window !== "undefined";

// Helper to check if speech recognition is supported
const isSpeechRecognitionSupported = () => {
  if (!isBrowser()) return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Helper to check if speech synthesis is supported
const isSpeechSynthesisSupported = () => {
  if (!isBrowser()) return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

export class VoiceService {
  private synthesis: SpeechSynthesis
  private recognition: SpeechRecognition | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isInitialized: boolean = false
  private initializationError: string | null = null
  private hasUserInteracted: boolean = false
  private currentLanguage: 'en' | 'hi' = 'hi'
  private silenceTimer: NodeJS.Timeout | null = null
  private readonly SILENCE_DURATION = 1500 // Time in ms to wait before auto-submitting

  constructor() {
    this.synthesis = window.speechSynthesis
    try {
      // Initialize speech recognition if available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = true
        this.recognition.lang = 'hi-IN'
        this.isInitialized = true
      } else {
        this.initializationError = "Speech recognition not supported in this browser"
      }
    } catch (error) {
      console.error("Error initializing speech recognition:", error)
      this.initializationError = "Failed to initialize speech recognition"
    }
  }

  // Set language for speech recognition and synthesis
  public setLanguage(lang: 'en' | 'hi') {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang === 'en' ? 'en-US' : 'hi-IN';
    }
  }

  // Method to handle user interaction
  public handleUserInteraction() {
    this.hasUserInteracted = true;
    // Create and immediately cancel a silent utterance to initialize speech synthesis
    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance('');
      this.synthesis.speak(utterance);
      this.synthesis.cancel();
    }
  }

  public speak(text: string, onEnd?: () => void, onInterrupt?: () => void) {
    if (!this.synthesis) {
      console.error("Speech synthesis not available");
      if (onInterrupt) onInterrupt();
      return;
    }

    if (!this.hasUserInteracted) {
      console.warn("Speech synthesis requires user interaction first");
      this.handleUserInteraction();
    }

    if (this.currentUtterance) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language for speech synthesis
    utterance.lang = this.currentLanguage === 'en' ? 'en-US' : 'hi-IN';
    
    try {
      // Find appropriate voice for the language
      const voices = this.synthesis.getVoices();
      const languageVoices = voices.filter(voice => 
        voice.lang.startsWith(this.currentLanguage === 'en' ? 'en' : 'hi')
      );
      if (languageVoices.length > 0) {
        utterance.voice = languageVoices[0];
      }
    } catch (error) {
      console.warn("Could not set voice for language:", error);
    }

    this.currentUtterance = utterance;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      this.currentUtterance = null;
      if (onInterrupt) onInterrupt();
    };

    this.synthesis.speak(utterance);
  }

  // Get initialization status
  getInitializationStatus(): { isInitialized: boolean; error: string | null } {
    return {
      isInitialized: this.isInitialized,
      error: this.initializationError
    };
  }

  // Start listening for voice input
  startListening(onResult: (text: string, isFinal: boolean) => void, onError: (error: any) => void, onAutoSubmit?: () => void): void {
    if (!this.isInitialized || !this.recognition) {
      onError(this.initializationError || "Speech recognition not available");
      return;
    }

    try {
      // Clear any existing silence timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      this.recognition.continuous = true;

      this.recognition.onresult = (event) => {
        try {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");

          const isFinal = event.results[event.results.length - 1].isFinal;
          onResult(transcript, isFinal);

          // Only start silence timer if we have a non-empty transcript
          if (transcript.trim()) {
            // Clear any existing silence timer
            if (this.silenceTimer) {
              clearTimeout(this.silenceTimer);
            }

            // Start a new silence timer
            this.silenceTimer = setTimeout(() => {
              if (onAutoSubmit) {
                this.stopListening();
                onAutoSubmit();
              }
            }, this.SILENCE_DURATION);
          }
        } catch (error) {
          console.error("Error processing speech result:", error);
          onError("Failed to process speech input");
        }
      };

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
        onError(event.error);
        if (this.recognition) {
          this.recognition.continuous = false;
        }
      };

      this.recognition.onend = () => {
        if (this.recognition) {
          this.recognition.continuous = false;
        }
        // Clear silence timer when recognition ends
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      };

      this.recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      onError(error);
      if (this.recognition) {
        this.recognition.continuous = false;
      }
    }
  }

  // Stop listening for voice input
  stopListening(): void {
    if (!this.recognition || !this.recognition.continuous) return;

    try {
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      this.recognition.stop();
      this.recognition.continuous = false;
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  }

  // Stop speaking
  stopSpeaking(): void {
    if (!this.synthesis || !this.currentUtterance) return;
    
    try {
      this.synthesis.cancel();
      this.currentUtterance = null;
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    return Boolean(this.recognition?.continuous);
  }

  // Check if currently speaking
  isCurrentlySpeaking(): boolean {
    return Boolean(this.currentUtterance);
  }
}

// Create a dummy service for server-side
class DummyVoiceService {
  getInitializationStatus(): { isInitialized: boolean; error: string | null } {
    return {
      isInitialized: false,
      error: "Voice service is not available on the server"
    };
  }

  setLanguage(_lang: 'en' | 'hi'): void {}

  startListening(_onResult: (text: string, isFinal: boolean) => void, onError: (error: any) => void): void {
    onError("Speech recognition not available on server")
  }
  
  stopListening(): void {}
  
  speak(_text: string, _onEnd?: () => void, _onInterrupt?: () => void): void {}
  
  stopSpeaking(): void {}
  
  isCurrentlyListening(): boolean {
    return false
  }
  
  isCurrentlySpeaking(): boolean {
    return false
  }
}

// Export as singleton - use dummy service on server, real service on client
let voiceServiceInstance: VoiceService | DummyVoiceService;

if (isBrowser()) {
  // Check for ElevenLabs API key
  const elevenLabsApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  
  if (elevenLabsApiKey) {
    // Use ElevenLabs service if API key is available
    const { ElevenLabsVoiceService } = require('./elevenlabs-voice-service');
    voiceServiceInstance = new ElevenLabsVoiceService(elevenLabsApiKey);
  } else {
    // Fallback to browser's built-in speech synthesis
    voiceServiceInstance = new VoiceService();
  }
} else {
  voiceServiceInstance = new DummyVoiceService();
}

export const voiceService = voiceServiceInstance;

