"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, Hotel, Globe, Send, Search, Mic, MicOff, Volume2, VolumeX, Pause, X, Keyboard } from "lucide-react"
import { format } from "date-fns"
import { useVoiceChat } from "@/lib/hooks/use-voice-chat"
import { cacheService } from "@/lib/services/cache-service"

// Simple function to format message content with basic markdown-like styling
function formatMessageContent(content: string) {
  // Replace markdown headings with styled divs
  let formattedContent = content
    .replace(/## (.*?)$/gm, '<h2 class="text-lg font-bold text-primary mt-4 mb-2">$1</h2>')
    .replace(/### (.*?)$/gm, '<h3 class="text-md font-semibold text-primary-foreground mt-3 mb-1">$1</h3>')
    // Replace markdown lists with styled lists
    .replace(/- (.*?)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    // Replace markdown bold with styled spans
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-primary">$1</span>')
    // Replace newlines with <br> tags
    .replace(/\n/g, '<br />');
  
  return formattedContent;
}

export default function TravelAssistant() {
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  
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
  } = useVoiceChat({
    api: "/api/chat",
    onVoiceSubmit: () => {
      // Automatically switch to chat mode when voice input is submitted
      setIsVoiceMode(false);
    }
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showTranscript, setShowTranscript] = useState(false)

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

  const handleSuggestionClick = (suggestion: string) => {
    const chatForm = document.getElementById("chat-form") as HTMLFormElement
    if (chatForm) {
      handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>)
      setTimeout(() => {
        chatForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }, 100)
    }
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

  const VoiceFirstView = () => (
    <div className="flex flex-col min-h-screen p-4">
      <header className="mb-12 flex justify-center items-center">
        <div className="relative w-48 h-48">
          {/* Circle background */}
          <div className="absolute inset-0 rounded-full bg-gray-200/10 backdrop-blur-sm border border-white/10"></div>
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="w-full h-full logo-animation rounded-full"></div>
            <div className="logo-shine"></div>
          </div>
          
          {/* Logo or icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="h-20 w-20 text-white drop-shadow-lg" />
          </div>
        </div>
      </header>

      {/* Video/Animation Section */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {voiceSupported ? (
          <>
            <button 
              onClick={toggleListening}
              className="w-full max-w-md aspect-video bg-black/20 rounded-2xl mb-8 backdrop-blur-sm border border-white/10 hover:bg-black/30 transition-colors duration-200 relative overflow-hidden group"
            >
              {/* Placeholder for animation/video */}
              <div className="w-full h-full flex items-center justify-center">
                {isListening ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-75"></div>
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-150"></div>
                    </div>
                    <p className="text-white/60">Listening...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Mic className="h-12 w-12 text-white/60 group-hover:scale-110 transition-transform" />
                    <p className="text-white/60">Tap to start talking</p>
                  </div>
                )}
              </div>

              {/* Ripple effect on click */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-primary/10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
              </div>
            </button>

            {/* Voice Controls */}
            <div className="flex flex-col items-center gap-6">
              <Button
                size="lg"
                className={`w-16 h-16 rounded-full ${isListening ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} listening-indicator`}
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
              
              <p className="text-xl text-white/90 text-center">
                {isListening ? "Tap to stop" : "Hello, Tap on the screen to start talking"}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg max-w-md text-center">
                <p>{error.message}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 bg-black/20 rounded-2xl backdrop-blur-sm border border-white/10 max-w-md">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Voice Input Not Available</h3>
            <p className="text-white/60 mb-4">{voiceError || "Your browser doesn't support voice input."}</p>
            <Button
              variant="outline"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setIsVoiceMode(false)}
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Switch to Text Chat
            </Button>
          </div>
        )}
      </div>

      {/* Transcript Overlay with Auto-Submit */}
      {showTranscript && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-black/60 border border-purple-900/30 rounded-lg shadow-lg p-4 max-w-md w-full backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Listening...</h3>
          </div>
          <p className="text-sm">{transcript}</p>
          {transcript.trim() && (
            <div className="flex gap-2 mt-2">
              <Button 
                className="flex-1" 
                size="sm" 
                onClick={() => {
                  submitWithVoice();
                  // Stop listening after submitting
                  if (isListening) {
                    toggleListening();
                  }
                }}
                variant="default"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button 
                className="flex-1" 
                size="sm" 
                onClick={() => {
                  toggleListening();
                  setShowTranscript(false);
                }}
                variant="outline"
              >
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Switch to Chat Button */}
      {voiceSupported && (
        <div className="flex justify-center mt-8 mb-4">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => setIsVoiceMode(false)}
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Switch to Chat
          </Button>
        </div>
      )}
    </div>
  )

  const ChatView = () => (
    <div className="flex flex-col min-h-screen p-4">
      <Card className="flex-1 max-w-3xl w-full mx-auto bg-black/30 border-purple-900/30 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Travel Assistant
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSpeaking}
                className={isSpeaking ? "text-primary" : "text-muted-foreground"}
                title={isSpeaking ? "Disable voice responses" : "Enable voice responses"}
              >
                {isSpeaking ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVoiceMode(true)}
                className="text-muted-foreground"
                title="Switch to voice mode"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 h-[60vh] overflow-y-auto relative">
          {messages.length === 0 && showSuggestions && (
            <div className="flex flex-col gap-6 items-center justify-center h-full text-center">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col items-center p-4 bg-primary/10 rounded-lg">
                  <Plane className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm">Flight Info</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-primary/10 rounded-lg">
                  <Hotel className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm">Hotel Bookings</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-primary/10 rounded-lg">
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm">Travel Tips</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">Ask me anything about flights, hotels, or travel tips!</p>

              <div className="w-full space-y-2">
                <p className="text-sm font-medium text-left">Try asking:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto py-2 px-3 border-purple-900/30 hover:bg-primary/20"
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
            <div key={message.id} className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg px-4 py-2 max-w-[90%] ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-black/40 border border-purple-900/30"
                }`}
              >
                {message.role === "user" ? (
                  <div>{message.content}</div>
                ) : (
                  <div 
                    className="prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                  />
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="rounded-lg px-4 py-2 max-w-[80%] bg-black/40 border border-purple-900/30 relative">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce delay-150"></div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/40"
                  onClick={interrupt}
                  title="Interrupt response"
                >
                  <Pause className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 flex justify-center">
              <div className="rounded-lg px-4 py-2 bg-destructive/10 text-destructive text-sm">
                Error: {error.message || "Something went wrong. Please try again."}
              </div>
            </div>
          )}

          {showTranscript && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-black/60 border border-purple-900/30 rounded-lg shadow-lg p-4 max-w-md w-full backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Listening...</h3>
              </div>
              <p className="text-sm">{transcript}</p>
              {transcript.trim() && (
                <div className="flex gap-2 mt-2">
                  <Button 
                    className="flex-1" 
                    size="sm" 
                    onClick={submitWithVoice}
                    variant="default"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                  <Button 
                    className="flex-1" 
                    size="sm" 
                    onClick={toggleListening}
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="border-t border-purple-900/30 p-4">
          <form id="chat-form" onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about flights, hotels, or travel tips..."
              className="flex-1 bg-black/40 border-purple-900/30 focus-visible:ring-purple-500"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="px-3">
              <Send className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={toggleListening}
              className={`px-3 border-purple-900/30 ${isListening ? "bg-primary/20" : ""}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )

  return isVoiceMode ? <VoiceFirstView /> : <ChatView />
}

