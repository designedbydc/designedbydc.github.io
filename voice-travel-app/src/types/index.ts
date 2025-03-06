// Types for flight data
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  cabinClass: string;
}

// Types for hotel data
export interface Hotel {
  id: string;
  name: string;
  location: string;
  starRating: number;
  price: number;
  currency: string;
  perNight: boolean;
  amenities: string[];
  roomTypes: string[];
  images: string[];
  description: string;
}

// Types for search results
export interface SearchResult {
  type: 'flight' | 'hotel';
  data: Flight[] | Hotel[];
}

// Types for search parameters
export interface SearchParams {
  destination?: string;
  origin?: string;
  checkIn?: string;
  checkOut?: string;
  travelers?: number;
  searchType: 'flight' | 'hotel' | 'unknown';
}

// Types for voice recording state
export interface RecordingState {
  isRecording: boolean;
  audioBlob?: Blob;
  transcription?: string;
  isProcessing: boolean;
  error?: string;
} 