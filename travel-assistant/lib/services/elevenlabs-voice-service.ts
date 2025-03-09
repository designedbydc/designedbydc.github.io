import { VoiceService as BaseVoiceService } from './voice-service';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  language: string;
}

export class ElevenLabsVoiceService extends BaseVoiceService {
  private apiKey: string;
  private voiceId: string;
  private audio: HTMLAudioElement | null = null;
  private audioQueue: { text: string; onEnd?: () => void; onInterrupt?: () => void }[] = [];
  private isProcessing: boolean = false;
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 250; // Minimum time between requests in ms
  
  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
    // Default to Hindi voice
    this.voiceId = 'ThT5KcBeYPX3keUQqHPh'; // Indira - Natural female voice for Hindi
  }

  private async waitForBuffer(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve) => {
      const checkBuffer = () => {
        // Check if we have enough data buffered
        if (audio.readyState >= 3) {
          resolve();
        } else {
          // Check again in 100ms
          setTimeout(checkBuffer, 100);
        }
      };
      checkBuffer();
    });
  }

  private cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.audioQueue.length === 0) return;

    this.isProcessing = true;
    const { text, onEnd, onInterrupt } = this.audioQueue[0];

    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();

      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + this.voiceId, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech: ' + response.statusText);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.cleanup(); // Clean up previous audio
      
      this.audio = new Audio();
      this.audio.src = audioUrl;

      // Wait for enough data to be buffered
      await this.waitForBuffer(this.audio);
      
      await this.audio.play();

      // Set up event listeners
      this.audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.cleanup();
        if (onEnd) onEnd();
        this.audioQueue.shift(); // Remove the processed item
        this.isProcessing = false;
        this.processQueue(); // Process next item if any
      };

      this.audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        this.cleanup();
        if (onInterrupt) onInterrupt();
        this.audioQueue.shift();
        this.isProcessing = false;
        this.processQueue();
      };

    } catch (error) {
      console.error('ElevenLabs speech error:', error);
      this.cleanup();
      if (onInterrupt) onInterrupt();
      this.audioQueue.shift();
      this.isProcessing = false;
      this.processQueue();
    }
  }

  public async speak(text: string, onEnd?: () => void, onInterrupt?: () => void): Promise<void> {
    // Add to queue
    this.audioQueue.push({ text, onEnd, onInterrupt });
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  public stopSpeaking(): void {
    this.cleanup();
    // Clear the queue
    this.audioQueue = [];
    this.isProcessing = false;
  }

  public setLanguage(lang: 'en' | 'hi'): void {
    super.setLanguage(lang);
    this.voiceId = lang === 'en' 
      ? 'EXAVITQu4vr4xnSDxMaL' // Rachel - Professional female voice for English
      : 'ThT5KcBeYPX3keUQqHPh'; // Indira - Natural female voice for Hindi
  }

  public isCurrentlySpeaking(): boolean {
    return this.audio !== null && !this.audio.paused;
  }
} 