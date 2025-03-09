"use client"

import type React from "react"
import type { Message } from "ai"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, Hotel, Globe, Send, Search, Mic, MicOff, Volume2, VolumeX, Pause, X, Keyboard, Home } from "lucide-react"
import { format } from "date-fns"
import { useVoiceChat } from "@/lib/hooks/use-voice-chat"
import { cacheService } from "@/lib/services/cache-service"
import { voiceService } from "@/lib/services/voice-service"

// Language specific UI text
const uiText = {
  en: {
    initialGreetings: [
      "Hi! I'm your AI travel assistant. Tell me about your travel plans and I'll help you find the best options.",
      "Hello! Ready to plan your next adventure? I'm here to help you discover amazing travel opportunities.",
      "Welcome! Looking for the perfect trip? I can help you find flights, hotels, and travel tips.",
      "Greetings! I'm your personal travel companion. Where would you like to explore today?",
      "Hey there! Need help planning your journey? I'm here to make your travel dreams come true."
    ],
    loading: "Loading...",
    thinking: "Thinking...",
    tryAgain: "Click to try again",
    clickToStart: "Click to start",
    listening: "Listening...",
    tapToTalk: "Tap anywhere to start talking",
    voiceNotAvailable: "Voice Input Not Available",
    browserNotSupported: "Your browser doesn't support voice input.",
    switchToText: "Switch to Text Chat",
    tryAsking: "Try asking:",
    send: "Send",
    dismiss: "Dismiss"
  },
  hi: {
    initialGreetings: [
      "नमस्ते! मैं आपकी AI यात्रा सहायिका हूं। मुझे अपनी यात्रा योजनाओं के बारे में बताएं और मैं आपको सर्वोत्तम विकल्प खोजने में मदद करूंगी।",
      "नमस्कार! क्या आप अपनी अगली यात्रा की योजना बना रहे हैं? मैं आपकी मदद करने के लिए यहां हूं।",
      "स्वागत है! क्या आप सर्वोत्तम यात्रा की तलाश में हैं? मैं आपको उड़ानें, होटल और यात्रा टिप्स खोजने में मदद करूंगी।",
      "शुभ दिन! मैं आपकी व्यक्तिगत यात्रा साथी हूं। आज आप कहां की यात्रा करना चाहेंगे?",
      "हैलो! क्या आपको यात्रा की योजना बनाने में मदद चाहिए? मैं आपके यात्रा सपनों को साकार करने में मदद करूंगी।"
    ],
    loading: "लोड हो रहा है...",
    thinking: "सोच रहा हूं...",
    tryAgain: "पुनः प्रयास करने के लिए क्लिक करें",
    clickToStart: "शुरू करने के लिए क्लिक करें",
    listening: "सुन रहा हूं...",
    tapToTalk: "बात करने के लिए कहीं भी टैप करें",
    voiceNotAvailable: "वॉइस इनपुट उपलब्ध नहीं है",
    browserNotSupported: "आपका ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता है।",
    switchToText: "टेक्स्ट चैट में जाएं",
    tryAsking: "ये प्रश्न पूछें:",
    send: "भेजें",
    dismiss: "रद्द करें"
  }
};

// Function to get a random greeting
const getRandomGreeting = (language: 'en' | 'hi'): string => {
  const greetings = uiText[language].initialGreetings;
  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
};

// Simple function to format message content with basic markdown-like styling
function formatMessageContent(content: string) {
  // First, check if this is a hotel-related response
  if (content.toLowerCase().includes('hotel') || content.toLowerCase().includes('resort') || content.toLowerCase().includes('stay')) {
    try {
      // Try to structure the content into hotel listings
      const sections = content.split(/(?=##\s)/);
      const hotelSections = sections.filter(section => 
        section.toLowerCase().includes('hotel') || section.toLowerCase().includes('resort')
      );
      
      if (hotelSections.length > 0) {
        // Create carousel container
        let carouselHtml = `
          <div class="relative w-full mb-6">
            <div class="overflow-x-auto pb-4 hide-scrollbar">
              <div class="flex gap-4 px-2">
        `;
        
        // Add hotel cards to carousel
        hotelSections.forEach((section, index) => {
          // Extract hotel information
          const hotelName = section.match(/##\s*(.*?)(?:\n|$)/)?.[1] || 'Hotel Name';
          const priceMatch = section.match(/(?:₹|INR|₨|Rs\.|Rs|$)\s*[\d,]+/i);
          const price = priceMatch ? priceMatch[0] : 'Price on request';
          const ratingMatch = section.match(/(\d(?:\.\d)?)\s*(?:\/\s*5|\s*stars?)/i);
          const rating = ratingMatch ? ratingMatch[1] : '4.5';
          const locationMatch = section.match(/(?:located|location|address).*?([^\.]+)\./i);
          const location = locationMatch ? locationMatch[1].trim() : 'Location available on request';
          
          carouselHtml += `
            <div class="flex-none w-[300px]">
              <div class="hotel-card bg-black/40 rounded-lg overflow-hidden border border-purple-900/30">
                <div class="aspect-[16/9] relative bg-gradient-to-br from-purple-900/20 to-black/20">
                  <img 
                    src="${getHotelImage(index)}"
                    alt="${hotelName}"
                    class="w-full h-full object-cover opacity-90"
                  />
                  <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white/90 flex items-center">
                    <svg class="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    ${rating}
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-white/90 mb-2">${hotelName}</h3>
                  <p class="text-sm text-white/60 mb-3">${location}</p>
                  <div class="flex justify-between items-center">
                    <div class="text-primary font-semibold">${price}</div>
                    <button class="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
        
        // Close carousel container
        carouselHtml += `
              </div>
            </div>
            <style>
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            </style>
          </div>
        `;
        
        // Add non-hotel sections if any
        const nonHotelSections = sections.filter(section => 
          !section.toLowerCase().includes('hotel') && !section.toLowerCase().includes('resort')
        );
        
        const formattedNonHotelContent = nonHotelSections
          .map(section => section
            .replace(/## (.*?)$/gm, '<h2 class="text-lg font-bold text-primary mt-4 mb-2">$1</h2>')
            .replace(/### (.*?)$/gm, '<h3 class="text-md font-semibold text-primary-foreground mt-3 mb-1">$1</h3>')
            .replace(/- (.*?)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-primary">$1</span>')
            .replace(/\n/g, '<br />'))
          .join('');
        
        return carouselHtml + formattedNonHotelContent;
      }
    } catch (error) {
      console.error('Error formatting hotel content:', error);
    }
  }

  // Default formatting for non-hotel content
  return content
    .replace(/## (.*?)$/gm, '<h2 class="text-lg font-bold text-primary mt-4 mb-2">$1</h2>')
    .replace(/### (.*?)$/gm, '<h3 class="text-md font-semibold text-primary-foreground mt-3 mb-1">$1</h3>')
    .replace(/- (.*?)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-primary">$1</span>')
    .replace(/\n/g, '<br />');
}

// Function to create a natural acknowledgment from user input
const createNaturalAcknowledgment = (transcript: string, language: 'en' | 'hi'): string => {
  const cleanTranscript = transcript.trim().toLowerCase();
  
  if (language === 'en') {
    // Check for common patterns and create appropriate responses
    if (cleanTranscript.startsWith('find') || cleanTranscript.includes('search')) {
      return "I'll look that up for you right away.";
    }
    if (cleanTranscript.startsWith('what') || cleanTranscript.startsWith('how') || cleanTranscript.startsWith('when')) {
      return "Let me find that information for you.";
    }
    if (cleanTranscript.includes('book') || cleanTranscript.includes('reserve')) {
      return "I'll help you with that booking.";
    }
    if (cleanTranscript.includes('recommend') || cleanTranscript.includes('suggest')) {
      return "I'll share some recommendations with you.";
    }
    // Default response if no pattern matches
    return "I'll help you with that right away.";
  } else {
    // Hindi acknowledgments with feminine gender
    if (cleanTranscript.includes('ढूंढ') || cleanTranscript.includes('खोज')) {
      return "मैं तुरंत खोज रही हूं।";
    }
    if (cleanTranscript.startsWith('क्या') || cleanTranscript.startsWith('कैसे') || cleanTranscript.startsWith('कब')) {
      return "मैं यह जानकारी खोज रही हूं।";
    }
    if (cleanTranscript.includes('बुक') || cleanTranscript.includes('रिजर्व')) {
      return "मैं आपकी बुकिंग में मदद करूंगी।";
    }
    if (cleanTranscript.includes('सुझाव') || cleanTranscript.includes('बताएं')) {
      return "मैं कुछ सुझाव देने जा रही हूं।";
    }
    // Default response in Hindi
    return "मैं आपकी मदद करने जा रही हूं।";
  }
};

// Add this helper function at the top of the file, after the imports
const getHotelImage = (index: number): string => {
  // Array of free, properly licensed hotel images from Unsplash
  const hotelImages = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop"
  ];
  
  // Return image URL based on index, cycling through the array if needed
  return hotelImages[index % hotelImages.length];
};

export default function TravelAssistant() {
  const [language, setLanguage] = useState<'en' | 'hi'>('hi')
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [showVoiceError, setShowVoiceError] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasInitialGreeting, setHasInitialGreeting] = useState(false)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [speakingError, setSpeakingError] = useState<string | null>(null)
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true)
  const [pageLoaded, setPageLoaded] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(Date.now())
  const [idlePromptIndex, setIdlePromptIndex] = useState<number>(0)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    isListening,
    isSpeaking,
    transcript,
    toggleListening,
    toggleSpeaking,
    interrupt,
    submitWithVoice,
    voiceSupported,
    voiceError,
    speakMessage
  } = useVoiceChat({
    api: "/api/chat",
    onFinish: (message) => {
      // After AI responds, summarize results and speak them
      if (isVoiceMode) {
        const summarizeResponse = (content: string) => {
          // Extract key information based on content type
          if (content.toLowerCase().includes('hotel') || content.toLowerCase().includes('resort')) {
            return "I've found some hotel options for you. You can view the details in the chat.";
          }
          if (content.toLowerCase().includes('flight')) {
            return "I've found flight information for your route. Check the chat for details.";
          }
          if (content.toLowerCase().includes('weather') || content.toLowerCase().includes('season')) {
            return "I've provided information about the weather and best times to visit. See the chat for details.";
          }
          if (content.toLowerCase().includes('attraction') || content.toLowerCase().includes('place') || content.toLowerCase().includes('visit')) {
            return "I've listed some interesting places to visit. You can find the full list in the chat.";
          }
          
          // Default summary for other types of content
          let summary = content.split('.')[0];
          if (summary.length > 100) {
            summary = summary.substring(0, 97) + '...';
          }
          return summary + ". Check the chat for complete details.";
        };

        const summary = summarizeResponse(message.content);
        speakMessage(summary, () => {
          // After speaking summary, wait a moment then activate mic
          const timer = setTimeout(() => {
            if (!isListening && !isSpeaking) {
              toggleListening();
            }
          }, 1000);
          return () => clearTimeout(timer);
        });
      }
    }
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Idle detection configuration
  const IDLE_TIMEOUT = 10000; // 10 seconds
  const idlePrompts = {
    en: [
      "Is there anything else you'd like to know?",
      "Would you like me to help with something else for your trip?",
      "I can also help with flight information or local attractions. What would you like to explore?",
      "Feel free to ask about hotels, flights, or local recommendations.",
      "I'm here to help plan your perfect trip. What would you like to know?"
    ],
    hi: [
      "क्या आप कुछ और जानना चाहेंगे?",
      "क्या मैं आपकी यात्रा के लिए कुछ और मदद कर सकती हूं?",
      "मैं उड़ानों या स्थानीय आकर्षणों के बारे में भी मदद कर सकती हूं। आप क्या जानना चाहेंगे?",
      "होटल, उड़ानों या स्थानीय सिफारिशों के बारे में पूछें।",
      "मैं आपकी सही यात्रा की योजना बनाने में मदद करने के लिए यहां हूं। आप क्या जानना चाहेंगे?"
    ]
  };

  // Function to update last interaction time
  const updateLastInteraction = () => {
    setLastInteractionTime(Date.now());
  };

  // Function to get next idle prompt
  const getNextIdlePrompt = () => {
    const prompts = idlePrompts[language];
    const prompt = prompts[idlePromptIndex % prompts.length];
    setIdlePromptIndex(prev => (prev + 1) % prompts.length);
    return prompt;
  };

  // Handle initial interaction
  const handleInitialInteraction = async () => {
    if (!voiceSupported || !isVoiceMode || hasInitialGreeting) return;
    
    try {
      setNeedsUserInteraction(false);
      updateLastInteraction();
      
      const initialGreeting = getRandomGreeting(language);
      
      // Add greeting to messages first
      const greetingMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: initialGreeting
      };
      setLocalMessages((prev: Message[]) => [...prev, greetingMessage]);
      
      // Ensure we're not already listening before starting
      if (isListening) {
        await new Promise<void>((resolve) => {
          toggleListening();
          setTimeout(resolve, 300); // Give time for cleanup
        });
      }

      // Speak greeting and wait for completion
      await new Promise<void>((resolve) => {
        speakMessage(initialGreeting, resolve);
      });
      
      // Start listening after greeting if not already listening
      if (!isListening && !isSpeaking && !isProcessingVoice) {
        try {
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              toggleListening();
              resolve();
            }, 500); // Add slight delay before starting listening
          });
        } catch (error) {
          console.error("Error activating mic:", error);
          setSpeakingError("Failed to activate microphone. Please try again.");
          setIsVoiceMode(false);
        }
      }
      
      setHasInitialGreeting(true);
    } catch (error) {
      console.error("Error during initial greeting:", error);
      setSpeakingError(error instanceof Error ? error.message : "Failed to start voice interaction");
      setIsVoiceMode(false);
    }
  };

  // Enhanced voice processing with acknowledgment
  const processVoiceInput = async (transcript: string) => {
    if (!transcript || isProcessingVoice) return;
    
    try {
      setIsProcessingVoice(true);
      updateLastInteraction();

      // Ensure we stop listening before processing
      if (isListening) {
        toggleListening();
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Create acknowledgment
      const acknowledgment = createNaturalAcknowledgment(transcript, language);
      
      // Add acknowledgment to messages and speak it
      const ackMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: acknowledgment
      };
      setLocalMessages(prev => [...prev, ackMessage]);
      
      // Speak acknowledgment then process the request
      await new Promise<void>((resolve) => {
        speakMessage(acknowledgment, resolve);
      });

      // Wait a moment before processing
      await new Promise(resolve => setTimeout(resolve, 300));

      // Process the actual request first
      const formEvent = new Event('submit', { cancelable: true, bubbles: true }) as unknown as React.FormEvent<HTMLFormElement>;
      handleInputChange({ target: { value: transcript.trim() } } as React.ChangeEvent<HTMLInputElement>);
      
      // Switch to chat view after setting up the input but before submitting
      setIsVoiceMode(false);
      
      // Small delay to ensure state updates before submission
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now submit the form
      await handleSubmit(formEvent);
      
    } catch (error) {
      console.error('Error processing voice input:', error);
      setSpeakingError(language === 'en' 
        ? 'Failed to process your request. Please try again.'
        : 'आपका अनुरोध प्रोसेस करने में विफल। कृपया पुनः प्रयास करें।'
      );
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Idle detection effect
  useEffect(() => {
    if (needsUserInteraction || isProcessingVoice || isLoading || isSpeaking) return;

    const checkIdle = () => {
      const now = Date.now();
      if (now - lastInteractionTime >= IDLE_TIMEOUT && !isLoading && !isSpeaking) {
        const idlePrompt = getNextIdlePrompt();
        
        if (isVoiceMode) {
          // In voice mode, speak the prompt and start listening
          speakMessage(idlePrompt, () => {
            if (!isListening && !isSpeaking) {
              toggleListening();
            }
          });
        } else {
          // In chat mode, speak the prompt and show the input
          speakMessage(idlePrompt, () => {
            setShowInput(true);
          });
          
          // Add the prompt as an assistant message
          const promptMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: idlePrompt
          };
          setLocalMessages(prev => [...prev, promptMessage]);
        }
        
        updateLastInteraction();
      }
    };

    const idleTimer = setInterval(checkIdle, IDLE_TIMEOUT);
    return () => clearInterval(idleTimer);
  }, [lastInteractionTime, isVoiceMode, needsUserInteraction, isProcessingVoice, isLoading, isSpeaking, language]);

  // Update interaction time on more events
  useEffect(() => {
    if (isListening || isSpeaking || isLoading || showInput) {
      updateLastInteraction();
    }
  }, [isListening, isSpeaking, isLoading, showInput]);

  // Remove the auto-start effect and replace with user interaction requirement
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Update the video container to show start button when needed
  const VideoContainer = () => (
    <div 
      className="relative w-48 h-48 cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation();
        if (needsUserInteraction) {
          handleInitialInteraction();
        } else if (!isListening && !speakingError) {
          toggleListening();
        }
      }}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <video 
          src="/jarvis.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );

  // Update the status text display
  const getStatusText = () => {
    if (isLoading) return "Thinking...";
    if (!pageLoaded) return "Loading...";
    if (speakingError) return "Click to try again";
    if (needsUserInteraction) return "Click anywhere to start";
    if (isListening) return transcript || "Listening...";
    return "Tap anywhere to start talking";
  };

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Hide suggestions when user starts chatting
  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false)
    }
  }, [messages])

  // Show transcript when listening
  useEffect(() => {
    setShowTranscript(isListening && transcript.length > 0)
  }, [isListening, transcript])

  // Show error message if speech synthesis fails
  useEffect(() => {
    if (speakingError) {
      const timer = setTimeout(() => {
        setSpeakingError(null);
      }, 5000); // Clear error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [speakingError]);

  // Handle language change
  const handleLanguageChange = (newLang: 'en' | 'hi') => {
    setLanguage(newLang);
    if (voiceService) {
      voiceService.setLanguage(newLang);
    }
  };

  // Update the header to include language toggle
  const Header = () => (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex justify-between items-center bg-black/30 backdrop-blur-sm border-b border-purple-900/30 global-header">
      {/* Home Button */}
      <button 
        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A181F] via-[#654ED8] to-[#1E1B2C] border border-white/20 flex items-center justify-center header-home-btn"
        onClick={() => setIsVoiceMode(true)}
      >
        <Home className="h-4 w-4 text-white" />
      </button>

      {/* Language Toggle */}
      <div className="h-8 bg-black border border-[#363636] rounded-full flex items-center header-language-toggle">
        <button
          className={`h-8 px-4 rounded-full flex items-center transition-all ${
            language === 'en' 
              ? 'bg-gradient-to-br from-[#622A99] to-[#2C1252] border border-[#AE54C5]' 
              : ''
          }`}
          onClick={() => handleLanguageChange('en')}
        >
          <span className={`text-sm ${language === 'en' ? 'text-white' : 'text-[#A3A3A3]'}`}>
            English
          </span>
        </button>
        <button
          className={`h-8 px-4 rounded-full flex items-center transition-all ${
            language === 'hi'
              ? 'bg-gradient-to-br from-[#622A99] to-[#2C1252] border border-[#AE54C5]'
              : ''
          }`}
          onClick={() => handleLanguageChange('hi')}
        >
          <span className={`text-sm ${language === 'hi' ? 'text-white' : 'text-[#A3A3A3]'}`}>
            हिंदी
          </span>
        </button>
      </div>
    </div>
  );

  // Update handleVoiceSubmit to handle states properly
  const handleVoiceSubmit = async () => {
    if (!transcript) return;
    
    setShowTranscript(false);
    if (isListening) {
      toggleListening();
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    await processVoiceInput(transcript);
  };

  const handleDismiss = () => {
    toggleListening();
    setShowTranscript(false);
  }

  const clearCache = () => {
    if (cacheService) {
      cacheService.clear()
      alert("Cache cleared successfully!")
    }
  }

  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const formattedToday = format(today, "yyyy-MM-dd")
  const formattedNextWeek = format(nextWeek, "yyyy-MM-dd")

  const suggestions = [
    `Find flights from Delhi to Mumbai for tomorrow`,
    `What are the best hotels in Goa?`,
    `Tell me about travel tips for London`,
    `Find round trip flights from Delhi to Mumbai from ${formattedToday} to ${formattedNextWeek}`,
    `What's the best time to visit Japan?`,
  ]

  const handleSuggestionClick = (suggestion: string) => {
    const chatForm = document.getElementById("chat-form") as HTMLFormElement
    if (chatForm) {
      handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>)
      setTimeout(() => {
        chatForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }, 100)
    }
  }

  const VoiceFirstView = () => (
    <div className="flex flex-col min-h-screen voice-first-container">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 voice-main-content mt-[72px]">
        <VideoContainer />
        
        {/* Main content area */}
        {!showVoiceError ? (
          <div className="text-center voice-interaction-area">
            <div className="flex flex-col items-center gap-4 voice-status-container">
              {speakingError && (
                <div className="text-destructive text-sm bg-destructive/10 px-4 py-2 rounded-lg mb-4 voice-error-message">
                  {speakingError}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-xs voice-mode-switch-btn"
                    onClick={() => {
                      setSpeakingError(null);
                      setIsVoiceMode(false);
                    }}
                  >
                    Switch to Text Mode
                  </Button>
                </div>
              )}
              {isListening ? (
                <div className="flex flex-col items-center gap-4 voice-listening-container">
                  <div className="relative voice-transcript-area">
                    <p className="text-white/60 min-h-[24px] voice-transcript-text">
                      {transcript || "Listening..."}
                    </p>
                    {transcript && (
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 voice-progress-indicator">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <circle
                            className="text-gray-700"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="transparent"
                            r="10"
                            cx="12"
                            cy="12"
                          />
                          <circle
                            className="text-primary transition-all duration-300"
                            strokeWidth="2"
                            strokeDasharray={62.83} // 2 * π * 10 (radius)
                            strokeDashoffset={62.83} // Start empty
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="10"
                            cx="12"
                            cy="12"
                            style={{
                              animation: "countdown 1.5s linear infinite",
                            }}
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {transcript && (
                    <div className="flex gap-2 voice-action-buttons">
                      <Button 
                        size="sm" 
                        onClick={handleVoiceSubmit}
                        variant="default"
                        className="voice-submit-btn"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleDismiss}
                        variant="outline"
                        className="voice-dismiss-btn"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xl text-white/90 pulsing-text voice-status-text">
                  {getStatusText()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-black/20 rounded-2xl backdrop-blur-sm border border-white/10 max-w-md voice-error-container">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 voice-error-title">Voice Input Not Available</h3>
            <p className="text-white/60 mb-4 voice-error-description">{voiceError || "Your browser doesn't support voice input."}</p>
            <Button
              variant="outline"
              className="text-white/60 hover:text-white hover:bg-white/10 voice-fallback-btn"
              onClick={() => setIsVoiceMode(false)}
              data-switch-chat
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Switch to Text Chat
            </Button>
          </div>
        )}
      </div>

      {/* Switch to Chat Button */}
      {voiceSupported && (
        <div className="flex justify-center mt-8 mb-4 voice-mode-toggle">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 voice-to-chat-btn"
            onClick={() => setIsVoiceMode(false)}
            data-switch-chat
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Switch to Chat
          </Button>
        </div>
      )}

      {/* Add keyframe animation for countdown */}
      <style jsx global>{`
        @keyframes countdown {
          from {
            stroke-dashoffset: 62.83;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )

  const ChatView = () => (
    <div className="flex flex-col h-screen overflow-hidden chat-view-container">
      <Header />
      <div className="flex-1 p-4 overflow-y-auto chat-main-content mt-[72px]">
        <Card className="flex-1 max-w-3xl w-full mx-auto bg-black/30 border-purple-900/30 backdrop-blur-sm chat-card mb-[200px]">
          <CardContent className="p-4 chat-messages-container">
            {messages.length === 0 && showSuggestions && (
              <div className="flex flex-col h-full chat-suggestions">
                <div className="w-full space-y-2 pt-4 suggestions-content">
                  <p className="text-sm font-medium text-left suggestions-title">Try asking:</p>
                  <div className="grid grid-cols-1 gap-2 suggestions-grid">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start text-left h-auto py-2 px-3 border-purple-900/30 hover:bg-primary/20 suggestion-btn"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`mb-4 flex ${message.role === "user" ? "justify-end chat-message-user" : "justify-start chat-message-assistant"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[90%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-black/40 border border-purple-900/30"
                  } message-bubble`}
                >
                  {message.role === "user" ? (
                    <div className="message-content-user">{message.content}</div>
                  ) : (
                    <div 
                      className="prose prose-sm dark:prose-invert message-content-assistant"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-4 flex justify-start chat-loading">
                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-black/40 border border-purple-900/30 relative loading-bubble">
                  <div className="flex gap-1 loading-dots">
                    <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce delay-75"></div>
                    <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce delay-150"></div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/40 loading-interrupt-btn"
                    onClick={interrupt}
                    title="Interrupt response"
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 flex justify-center chat-error">
                <div className="rounded-lg px-4 py-2 bg-destructive/10 text-destructive text-sm error-message">
                  Error: {error.message || "Something went wrong. Please try again."}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="messages-end-ref" />
          </CardContent>

          {/* Input form with slide animation */}
          <div className={`transform transition-all duration-300 ease-in-out chat-input-container ${showInput ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <form id="chat-form" onSubmit={handleSubmit} className="p-4 border-t border-purple-900/30 chat-form">
              <div className="flex gap-2 input-wrapper">
                <Input
                  id="chat-input"
                  placeholder={language === 'en' ? "Type your message..." : "अपना संदेश लिखें..."}
                  value={input}
                  onChange={handleInputChange}
                  className="bg-black/40 border-purple-900/30 chat-input-field"
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="chat-submit-btn">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Floating Video Player - Fixed to bottom edge */}
        <div className={`fixed left-1/2 -translate-x-1/2 w-[376px] transition-all duration-300 ease-in-out bottom-0 floating-player-container`}>
          <div className="relative px-4 pb-4 pt-4 floating-player-wrapper">
            {/* Video Container */}
            <div 
              className="mx-auto w-[129px] h-[126px] relative cursor-pointer floating-video-container"
              onClick={() => {
                setIsVoiceMode(true);
                if (voiceSupported) {
                  handleInitialInteraction();
                }
              }}
            >
              <div className="absolute inset-0 video-circle-wrapper">
                <div className="w-[100px] h-[100px] rounded-full bg-[#D9D9D9] mx-auto overflow-hidden video-circle">
                  <video 
                    src="/jarvis.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover floating-video"
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 floating-controls">
                {/* Keyboard Button */}
                <button 
                  className={`absolute -left-16 w-12 h-12 rounded-full backdrop-blur-[10px] shadow-lg flex items-center justify-center transition-colors floating-keyboard-btn ${
                    showInput ? 'bg-primary/30 hover:bg-primary/50' : 'bg-white/27 hover:bg-white/40'
                  }`}
                  style={{
                    boxShadow: '0px 1.08px 14.3px 0px rgba(0, 0, 0, 0.10), 0px 0px 2.8px 0px rgba(255, 255, 255, 0.79) inset'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInput(!showInput);
                    if (!showInput) {
                      setTimeout(() => {
                        const inputElement = document.getElementById('chat-input');
                        if (inputElement) {
                          inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          inputElement.focus();
                        }
                      }, 300);
                    }
                  }}
                  title={showInput ? "Hide keyboard input" : "Show keyboard input"}
                >
                  <Keyboard className={`w-6 h-6 ${showInput ? 'text-primary-foreground' : 'text-white'}`} />
                </button>
                
                {/* Cancel Button */}
                <button 
                  className={`absolute -right-16 w-12 h-12 rounded-full backdrop-blur-[10px] shadow-lg flex items-center justify-center transition-colors floating-cancel-btn ${
                    isLoading ? 'bg-red-500/30 hover:bg-red-500/50' : 'bg-white/27 hover:bg-white/40'
                  }`}
                  style={{
                    boxShadow: '0px 1.08px 14.3px 0px rgba(0, 0, 0, 0.10), 0px 0px 2.8px 0px rgba(255, 255, 255, 0.79) inset'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isLoading) {
                      interrupt();
                    }
                  }}
                  title={isLoading ? "Cancel current response" : "Cancel"}
                >
                  <X className={`w-6 h-6 ${isLoading ? 'text-red-200' : 'text-white'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Cleanup effect for voice states
  useEffect(() => {
    return () => {
      if (isListening) {
        toggleListening();
      }
      if (isSpeaking) {
        toggleSpeaking();
      }
    };
  }, []);

  return isVoiceMode ? <VoiceFirstView /> : <ChatView />
}

