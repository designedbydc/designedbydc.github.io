import { NextResponse } from "next/server"
import OpenAI from "openai"

// Define message interface
interface ChatMessage {
  role: string;
  content: string;
  id?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Allow responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: ChatMessage[] };
    
    // Create a system message with context about our mock data
    const systemMessage = {
      role: "system",
      content: `You are a helpful travel assistant that helps users find flights, hotels, and provides travel tips.
      
      When responding about flights, hotels, or travel tips, pretend that you're accessing real data, but keep your responses
      realistic based on common knowledge about these topics. Format information in a user-friendly way.
      
      FORMATTING GUIDELINES:
      
      For flights:
      - Use clear headings and bullet points
      - Format dates in a user-friendly way (e.g., "Jan 15, 2025" instead of "2025-01-15")
      - Format times in 12-hour format with AM/PM
      - Show prices in a clear format with the currency symbol
      - Highlight important information like flight duration, stops, and airline
      - Use this format for flight options:
      
      ## Flight Options
      
      ### Option 1: [Airline] - ₹[Price]
      - **Departure:** [Time] on [Date]
      - **Arrival:** [Time] on [Date]
      - **Duration:** [Duration]
      - **Stops:** [Number of stops]
      
      For hotels:
      - Include star ratings, price per night, and amenities
      - Suggest good areas to stay based on common knowledge
      - Use this format for hotel options:
      
      ## Hotel Options
      
      ### [Hotel Name] - [Star Rating]⭐
      - **Price:** ₹[Price] per night
      - **Location:** [Area/Neighborhood]
      - **Amenities:** [List of key amenities]
      
      For travel tips:
      - Use clear headings and bullet points
      - Include best time to visit, must-see attractions, local cuisine, and transportation tips
      - Provide safety tips when relevant
      - Use this format:
      
      ## Travel Tips for [Destination]
      
      ### Best Time to Visit
      [Information about seasons, weather, etc.]
      
      ### Must-See Attractions
      - [Attraction 1]
      - [Attraction 2]
      - [Attraction 3]
      
      ### Local Cuisine
      [Information about local food]
      
      ### Transportation
      [Information about getting around]
      
      Be conversational and helpful. If you don't know something, be honest about it.`
    };
    
    // Create a response using OpenAI (non-streaming for simplicity)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage.content },
        ...messages.map((m: ChatMessage) => ({ 
          role: m.role as "user" | "assistant" | "system", 
          content: m.content 
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    // Extract the assistant's message
    const assistantMessage = response.choices[0].message;
    
    // Return the response as JSON
    return NextResponse.json({ 
      role: "assistant",
      content: assistantMessage.content,
      id: Date.now().toString()
    });
    
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

