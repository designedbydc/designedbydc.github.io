import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a readable stream from a string, simulating a streaming response
 * by sending chunks of text with delays to mimic typing
 */
export function createReadableStream(text: string): ReadableStream<Uint8Array> {
  // Split the text into chunks (words or small phrases)
  const chunks = text.match(/[^\s]+|\s+/g) || []
  
  return new ReadableStream({
    async start(controller) {
      // Add chunks to the stream with small delays to simulate typing
      for (const chunk of chunks) {
        const encoder = new TextEncoder()
        const encoded = encoder.encode(chunk)
        controller.enqueue(encoded)
        
        // Random delay between 10-50ms to simulate natural typing speed
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 40) + 10))
      }
      
      controller.close()
    }
  })
}
