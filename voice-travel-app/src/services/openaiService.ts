import axios from 'axios';

interface TranscriptionResponse {
  text: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OpenAI API key is not set. Please set it in the .env file.');
}

const openaiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
});

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Log the blob details for debugging
    console.log('Audio blob type:', audioBlob.type);
    console.log('Audio blob size:', audioBlob.size);

    // Validate audio blob
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Audio blob is empty or invalid');
    }

    // Make sure we have a supported format - OpenAI accepts: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
    // Create a file with explicit mp3 extension since that's widely supported
    const audioFile = new File([audioBlob], 'audio.mp3', { 
      type: 'audio/mp3' // Force the MIME type to be audio/mp3
    });
    
    console.log('Created file with name:', audioFile.name);
    console.log('Created file with type:', audioFile.type);
    console.log('Created file with size:', audioFile.size);
    
    if (audioFile.size < 100) {
      console.warn('Warning: Audio file is very small, may not contain audible speech');
    }
    
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json'); // Change to json format to get a proper JSON response

    // Log the FormData for debugging
    console.log('Sending FormData to OpenAI API');

    const response = await openaiApi.post('/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });

    // Log the raw response for debugging
    console.log('OpenAI API response:', response.data);
    
    // Handle both text and JSON response formats
    let transcribedText = '';
    if (typeof response.data === 'string') {
      // If the response is a string (text format)
      transcribedText = response.data.trim();
    } else if (response.data && typeof response.data === 'object') {
      // If the response is a JSON object with a text property
      const jsonResponse = response.data as TranscriptionResponse;
      transcribedText = jsonResponse.text ? jsonResponse.text.trim() : '';
    }
    
    console.log('Transcription received:', transcribedText || '(empty transcription)');
    
    return transcribedText;
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    console.error('Error response data:', error?.response?.data);
    throw new Error(`Failed to transcribe audio: ${error?.response?.data?.error?.message || error?.message || 'Unknown error'}`);
  }
};

export const analyzeText = async (text: string): Promise<string> => {
  try {
    // Validate the input text
    if (!text || text.trim() === '') {
      return "I couldn't detect any speech. Please try recording again and speak clearly.";
    }
    
    // Add debug logging
    console.log('Sending text for analysis:', text);
    
    const response = await openaiApi.post<ChatCompletionResponse>('/chat/completions', {
      model: 'gpt-3.5-turbo-0125', // Update to a current model version
      messages: [
        {
          role: 'system',
          content: 'You are a travel assistant. Analyze the user\'s request and provide relevant travel information.'
        },
        {
          role: 'user',
          content: text.trim() // Ensure the text is trimmed
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    // Log successful response
    console.log('Analysis completed successfully');
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error analyzing text:', error);
    console.error('Error details:', error?.response?.data);
    throw new Error(`Failed to analyze text: ${error?.response?.data?.error?.message || error?.message || 'Unknown error'}`);
  }
}; 