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

class VoiceService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesisUtterance | null = null
  private isListening = false
  private isSpeaking = false
  private interruptCallback: (() => void) | null = null
  private isInitialized = false
  private initError: string | null = null

  constructor() {
    if (isBrowser()) {
      try {
        // Check speech recognition support
        if (!isSpeechRecognitionSupported()) {
          this.initError = "Speech recognition is not supported in this browser";
          return;
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = "en-US"

        // Check speech synthesis support
        if (!isSpeechSynthesisSupported()) {
          this.initError = "Speech synthesis is not supported in this browser";
          return;
        }

        // Initialize speech synthesis
        this.synthesis = new SpeechSynthesisUtterance()
        this.synthesis.lang = "en-US"
        this.synthesis.rate = 1.0
        this.synthesis.pitch = 1.0

        this.isInitialized = true;
      } catch (error) {
        console.error("Error initializing voice service:", error)
        this.initError = error instanceof Error ? error.message : "Failed to initialize voice service";
      }
    }
  }

  // Get initialization status
  getInitializationStatus(): { isInitialized: boolean; error: string | null } {
    return {
      isInitialized: this.isInitialized,
      error: this.initError
    };
  }

  // Start listening for voice input
  startListening(onResult: (text: string, isFinal: boolean) => void, onError: (error: any) => void): void {
    if (!this.isInitialized || !this.recognition) {
      onError(this.initError || "Speech recognition not available");
      return;
    }

    if (this.isListening) return;

    try {
      this.isListening = true;

      this.recognition.onresult = (event) => {
        try {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("")

          const isFinal = event.results[event.results.length - 1].isFinal
          onResult(transcript, isFinal)
        } catch (error) {
          console.error("Error processing speech result:", error);
          onError("Failed to process speech input");
        }
      }

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        onError(event.error);
        this.isListening = false;
      }

      this.recognition.onend = () => {
        this.isListening = false;
      }

      this.recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      onError(error);
      this.isListening = false;
    }
  }

  // Stop listening for voice input
  stopListening(): void {
    if (!this.recognition || !this.isListening) return

    try {
      this.recognition.stop()
      this.isListening = false
    } catch (error) {
      console.error("Error stopping speech recognition:", error)
    }
  }

  // Speak text aloud
  speak(text: string, onEnd?: () => void, onInterrupt?: () => void): void {
    if (!this.synthesis || !isBrowser() || !window.speechSynthesis) return

    // Cancel any ongoing speech
    this.stopSpeaking()

    this.isSpeaking = true
    this.interruptCallback = onInterrupt || null

    this.synthesis.text = text

    this.synthesis.onend = () => {
      this.isSpeaking = false
      if (onEnd) onEnd()
    }

    window.speechSynthesis.speak(this.synthesis)
  }

  // Stop speaking
  stopSpeaking(): void {
    if (!isBrowser() || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    this.isSpeaking = false

    if (this.interruptCallback) {
      this.interruptCallback()
      this.interruptCallback = null
    }
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    return this.isListening
  }

  // Check if currently speaking
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking
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
  voiceServiceInstance = new VoiceService();
} else {
  voiceServiceInstance = new DummyVoiceService();
}

export const voiceService = voiceServiceInstance;

