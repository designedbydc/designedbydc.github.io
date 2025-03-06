import React, { useState, useRef, useEffect } from 'react';
import { RecordingState } from '../types';
import { transcribeAudio, analyzeText } from '../services/openaiService';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onAnalysis: (analysis: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onAnalysis }) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
  });
  
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState<boolean>(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Check browser support and request microphone permission on component mount
  useEffect(() => {
    // Check if MediaRecorder is supported
    if (!window.MediaRecorder) {
      console.error('MediaRecorder is not supported in this browser');
      setBrowserSupported(false);
      setRecordingState(prev => ({ 
        ...prev, 
        error: 'Your browser does not support audio recording. Please try using Chrome, Firefox, or Edge.' 
      }));
      return;
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported in this browser');
      setBrowserSupported(false);
      setRecordingState(prev => ({ 
        ...prev, 
        error: 'Your browser does not support microphone access. Please try using Chrome, Firefox, or Edge.' 
      }));
      return;
    }

    const requestMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setPermissionGranted(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setPermissionGranted(false);
        setRecordingState(prev => ({ 
          ...prev, 
          error: 'Microphone access denied. Please grant permission to use this feature.' 
        }));
      }
    };

    requestMicrophonePermission();

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, []);

  const startRecording = () => {
    if (!streamRef.current) {
      console.error('No media stream available');
      setRecordingState(prev => ({ 
        ...prev, 
        error: 'Microphone not available. Please refresh and try again.' 
      }));
      return;
    }

    // Clear previous recording data
    audioChunksRef.current = [];
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }

    try {
      // Try to determine the best supported MIME type
      const mimeTypes = [
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
        'audio/wav'
      ];
      
      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      if (!mimeType) {
        console.warn('None of the preferred MIME types are supported, using default');
      }

      // Create MediaRecorder with options
      const options: MediaRecorderOptions = {};
      if (mimeType) {
        options.mimeType = mimeType;
      }
      
      console.log(`Creating MediaRecorder with MIME type: ${mimeType || 'default'}`);
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      
      mediaRecorderRef.current = mediaRecorder;

      // Event handler for when data is available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('chunk of real-time data is: ', event.data);
        }
      };

      // Event handler for when recording stops
      mediaRecorder.onstop = async () => {
        try {
          // Combine all audio chunks into a single blob
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType || 'audio/webm' 
          });
          console.log('Created audio blob with type:', audioBlob.type);
          console.log('Created audio blob with size:', audioBlob.size);

          // Create a URL for the audio blob (for playback if needed)
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          
          // Process the audio
          await processAudio(audioBlob);
        } catch (error) {
          console.error('Error processing recording:', error);
          setRecordingState(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error.message : 'Failed to process recording', 
            isProcessing: false 
          }));
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState({ ...recordingState, isRecording: true, error: undefined });
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start recording' 
      }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      setRecordingState({ ...recordingState, isRecording: false });
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('No audio data recorded');
    }

    setRecordingState(prev => ({ ...prev, isProcessing: true, error: undefined }));

    try {
      // Check if the audio blob is valid
      if (audioBlob.size < 100) {
        console.warn('Warning: Audio file is very small, may not contain audible speech');
      }

      // Transcribe the audio
      const transcription = await transcribeAudio(audioBlob);
      console.log('Transcription:', transcription);
      
      // Check if the transcription is empty or whitespace only
      if (!transcription || transcription.trim() === '') {
        throw new Error('No speech detected in the recording. Please try again and speak clearly.');
      }
      
      // Analyze the transcription
      const analysis = await analyzeText(transcription);
      console.log('Analysis:', analysis);
      onAnalysis(analysis);
      
      setRecordingState(prev => ({ ...prev, transcription, isProcessing: false }));
    } catch (error) {
      console.error('Error processing audio:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to process audio', 
        isProcessing: false 
      }));
    }
  };

  return (
    <div className="voice-recorder">
      {!browserSupported && (
        <div className="browser-error">
          <p>Your browser does not support audio recording.</p>
          <p>Please try using Chrome, Firefox, or Edge.</p>
        </div>
      )}
      
      {browserSupported && permissionGranted === false && (
        <div className="permission-error">
          <p>Microphone access is required for voice recording.</p>
          <p>Please allow microphone access in your browser settings and refresh the page.</p>
        </div>
      )}
      
      {browserSupported && permissionGranted && (
        <>
          <div className="recording-controls">
            <button 
              onClick={startRecording} 
              disabled={recordingState.isRecording || recordingState.isProcessing}
              className="record-button"
            >
              {recordingState.isRecording ? 'Recording...' : 'Start Recording'}
            </button>
            <button 
              onClick={stopRecording} 
              disabled={!recordingState.isRecording || recordingState.isProcessing}
              className="stop-button"
            >
              Stop Recording
            </button>
          </div>
          
          {recordingState.isRecording && (
            <div className="recording-indicator">
              <div className="recording-pulse"></div>
              <p>Recording in progress...</p>
            </div>
          )}
          
          {audioURL && !recordingState.isRecording && !recordingState.isProcessing && (
            <div className="audio-playback">
              <audio src={audioURL} controls />
            </div>
          )}
        </>
      )}
      
      {recordingState.transcription && (
        <div className="transcription">
          <h3>Transcription:</h3>
          <p>{recordingState.transcription}</p>
        </div>
      )}
      
      {recordingState.error && (
        <div className="error-message">
          <p>{recordingState.error}</p>
        </div>
      )}
      
      {recordingState.isProcessing && (
        <div className="processing">
          <p>Processing your audio...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder; 