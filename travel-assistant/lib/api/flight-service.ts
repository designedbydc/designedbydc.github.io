// Mock flight data service
import { cacheService } from "../services/cache-service"

// Mock airport data
const airports = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", country: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India" },
  { code: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "India" },
  { code: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", country: "India" },
  { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India" },
  { code: "GOI", name: "Goa International Airport", city: "Goa", country: "India" },
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA" },
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "UK" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
  { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia" },
  { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
];

// Mock flight data
const flights = [
  {
    id: "FL001",
    airline: "Air India",
    flightNumber: "AI101",
    origin: "DEL",
    destination: "BOM",
    departureTime: "08:00",
    arrivalTime: "10:00",
    duration: "2h 00m",
    price: 5000,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL002",
    airline: "IndiGo",
    flightNumber: "6E201",
    origin: "DEL",
    destination: "BOM",
    departureTime: "10:30",
    arrivalTime: "12:30",
    duration: "2h 00m",
    price: 4500,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL003",
    airline: "Vistara",
    flightNumber: "UK301",
    origin: "DEL",
    destination: "BOM",
    departureTime: "14:00",
    arrivalTime: "16:15",
    duration: "2h 15m",
    price: 6000,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL004",
    airline: "SpiceJet",
    flightNumber: "SG401",
    origin: "DEL",
    destination: "BOM",
    departureTime: "18:30",
    arrivalTime: "20:45",
    duration: "2h 15m",
    price: 4200,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL005",
    airline: "Air India",
    flightNumber: "AI102",
    origin: "BOM",
    destination: "DEL",
    departureTime: "07:00",
    arrivalTime: "09:00",
    duration: "2h 00m",
    price: 5200,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL006",
    airline: "IndiGo",
    flightNumber: "6E202",
    origin: "BOM",
    destination: "DEL",
    departureTime: "11:00",
    arrivalTime: "13:00",
    duration: "2h 00m",
    price: 4700,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL007",
    airline: "Air India",
    flightNumber: "AI201",
    origin: "DEL",
    destination: "BLR",
    departureTime: "09:30",
    arrivalTime: "12:15",
    duration: "2h 45m",
    price: 6500,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL008",
    airline: "IndiGo",
    flightNumber: "6E301",
    origin: "DEL",
    destination: "BLR",
    departureTime: "13:00",
    arrivalTime: "15:45",
    duration: "2h 45m",
    price: 5800,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL009",
    airline: "Air India",
    flightNumber: "AI301",
    origin: "DEL",
    destination: "MAA",
    departureTime: "10:00",
    arrivalTime: "13:00",
    duration: "3h 00m",
    price: 7000,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL010",
    airline: "IndiGo",
    flightNumber: "6E401",
    origin: "DEL",
    destination: "MAA",
    departureTime: "14:30",
    arrivalTime: "17:30",
    duration: "3h 00m",
    price: 6200,
    stops: 0,
    class: "Economy"
  },
  {
    id: "FL011",
    airline: "Air India",
    flightNumber: "AI501",
    origin: "DEL",
    destination: "JFK",
    departureTime: "01:30",
    arrivalTime: "07:00",
    duration: "15h 30m",
    price: 75000,
    stops: 1,
    class: "Economy"
  },
  {
    id: "FL012",
    airline: "United Airlines",
    flightNumber: "UA802",
    origin: "DEL",
    destination: "JFK",
    departureTime: "11:00",
    arrivalTime: "17:30",
    duration: "16h 30m",
    price: 82000,
    stops: 1,
    class: "Economy"
  }
];

// Helper to generate cache key from endpoint and params
const generateCacheKey = (endpoint: string, params: any): string => {
  return `${endpoint}:${JSON.stringify(params)}`;
};

// Search for airports with caching
export async function searchAirports(query: string) {
  const cacheKey = generateCacheKey("airports", { query });

  // Check cache first
  if (cacheService?.has(cacheKey)) {
    return cacheService.get(cacheKey);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Filter airports based on query
  const filteredAirports = airports.filter(airport => 
    airport.code.toLowerCase().includes(query.toLowerCase()) ||
    airport.city.toLowerCase().includes(query.toLowerCase()) ||
    airport.name.toLowerCase().includes(query.toLowerCase())
  );

  const result = {
    status: "SUCCESS",
    data: {
      airports: filteredAirports
    }
  };

  // Cache the result
  cacheService?.set(cacheKey, result);

  return result;
}

// Get top airports with caching
export async function getTopAirports(destination?: string) {
  const cacheKey = generateCacheKey("topAirports", { destination });

  // Check cache first
  if (cacheService?.has(cacheKey)) {
    return cacheService.get(cacheKey);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return top airports (first 5 in our mock data)
  const topAirports = airports.slice(0, 5);

  const result = {
    status: "SUCCESS",
    data: {
      airports: topAirports
    }
  };

  // Cache the result
  cacheService?.set(cacheKey, result);

  return result;
}

// Search flights with caching
export async function searchFlights(params: {
  origin: string;
  destination: string;
  departureDate: string; // Format: YYYYMMDD
  adults?: string;
  children?: string;
  infants?: string;
  class?: string;
}) {
  const cacheKey = generateCacheKey("searchFlights", params);

  // Check cache first
  if (cacheService?.has(cacheKey)) {
    return cacheService.get(cacheKey);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const { origin, destination } = params;

  // Filter flights based on origin and destination
  const filteredFlights = flights.filter(flight => 
    flight.origin.toLowerCase() === origin.toLowerCase() && 
    flight.destination.toLowerCase() === destination.toLowerCase()
  );

  // Create a mock response structure
  const result = {
    status: "SUCCESS",
    data: {
      requestId: "mock-request-" + Math.random().toString(36).substring(7),
      solutions: filteredFlights.map(flight => ({
        id: flight.id,
        provider: "MOCK",
        fare: {
          totalFare: flight.price,
          baseFare: flight.price * 0.8,
          taxes: flight.price * 0.2,
          currency: "INR"
        },
        segments: [
          {
            id: flight.id + "-SEG",
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            origin: flight.origin,
            destination: flight.destination,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            stops: flight.stops,
            class: flight.class
          }
        ]
      }))
    }
  };

  // If no flights found
  if (filteredFlights.length === 0) {
    result.data.solutions = [];
  }

  // Cache the result
  cacheService?.set(cacheKey, result);

  return result;
}

// Get round trip fares with caching
export async function getRoundTripFares(params: {
  source: string;
  destination: string;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  adults?: string;
  children?: string;
  infants?: string;
  class?: string;
}) {
  const cacheKey = generateCacheKey("roundTripFares", params);

  // Check cache first
  if (cacheService?.has(cacheKey)) {
    return cacheService.get(cacheKey);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { source, destination } = params;

  // Get outbound flights
  const outboundFlights = flights.filter(flight => 
    flight.origin.toLowerCase() === source.toLowerCase() && 
    flight.destination.toLowerCase() === destination.toLowerCase()
  );

  // Get inbound flights
  const inboundFlights = flights.filter(flight => 
    flight.origin.toLowerCase() === destination.toLowerCase() && 
    flight.destination.toLowerCase() === source.toLowerCase()
  );

  // Create combinations of outbound and inbound flights
  const combinations = [];
  for (const outbound of outboundFlights) {
    for (const inbound of inboundFlights) {
      combinations.push({
        outbound,
        inbound,
        totalPrice: outbound.price + inbound.price
      });
    }
  }

  // Sort by total price
  combinations.sort((a, b) => a.totalPrice - b.totalPrice);

  // Take top 5 combinations
  const topCombinations = combinations.slice(0, 5);

  const result = {
    status: "SUCCESS",
    data: {
      combinations: topCombinations.map((combo, index) => ({
        id: `COMBO-${index}`,
        outbound: {
          id: combo.outbound.id,
          airline: combo.outbound.airline,
          flightNumber: combo.outbound.flightNumber,
          origin: combo.outbound.origin,
          destination: combo.outbound.destination,
          departureTime: combo.outbound.departureTime,
          arrivalTime: combo.outbound.arrivalTime,
          duration: combo.outbound.duration
        },
        inbound: {
          id: combo.inbound.id,
          airline: combo.inbound.airline,
          flightNumber: combo.inbound.flightNumber,
          origin: combo.inbound.origin,
          destination: combo.inbound.destination,
          departureTime: combo.inbound.departureTime,
          arrivalTime: combo.inbound.arrivalTime,
          duration: combo.inbound.duration
        },
        totalFare: combo.totalPrice,
        currency: "INR"
      }))
    }
  };

  // Cache the result
  cacheService?.set(cacheKey, result);

  return result;
}

// Get fare upsell options with caching
export async function getFareUpsell(solutionId: string, requestId: string) {
  const cacheKey = generateCacheKey("fareUpsell", { solutionId, requestId });

  // Check cache first
  if (cacheService?.has(cacheKey)) {
    return cacheService.get(cacheKey);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock fare upsell options
  const result = {
    status: "SUCCESS",
    data: {
      options: [
        {
          id: "ECONOMY",
          name: "Economy",
          price: 0,
          benefits: ["Standard seat", "Cabin baggage"]
        },
        {
          id: "ECONOMY_PLUS",
          name: "Economy Plus",
          price: 1500,
          benefits: ["Extra legroom", "Priority boarding", "Cabin baggage", "Checked baggage"]
        },
        {
          id: "BUSINESS",
          name: "Business",
          price: 8000,
          benefits: ["Premium seat", "Lounge access", "Priority boarding", "Extra baggage allowance"]
        }
      ]
    }
  };

  // Cache the result
  cacheService?.set(cacheKey, result);

  return result;
}

// Get mini rules with caching
export async function getMiniRules(flightId: string, provider: string, requestId: string) {
  const cacheKey = generateCacheKey("miniRules", { flightId, provider, requestId });

  // Check cache first
  if (cacheService?.has(cacheKey)) {
    return cacheService.get(cacheKey);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock mini rules
  const result = {
    status: "SUCCESS",
    data: {
      rules: {
        cancellation: {
          allowed: true,
          fee: 3000,
          currency: "INR",
          description: "Cancellation allowed with fee"
        },
        dateChange: {
          allowed: true,
          fee: 2500,
          currency: "INR",
          description: "Date change allowed with fee"
        },
        baggage: {
          cabin: "7 kg",
          checked: "15 kg",
          description: "Standard baggage allowance"
        }
      }
    }
  };

  // Cache the result
  cacheService?.set(cacheKey, result);

  return result;
}

// Get search filters with caching
export async function getSearchFilters(origin: string, destination: string) {
  const cacheKey = generateCacheKey("searchFilters", { origin, destination });

  // Check cache first
  if (cacheService?.has(cacheKey)) {
    return cacheService.get(cacheKey);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock search filters
  const result = {
    status: "SUCCESS",
    data: {
      airlines: [
        { code: "AI", name: "Air India" },
        { code: "6E", name: "IndiGo" },
        { code: "UK", name: "Vistara" },
        { code: "SG", name: "SpiceJet" }
      ],
      stops: [
        { count: 0, label: "Non-stop" },
        { count: 1, label: "1 Stop" }
      ],
      priceRange: {
        min: 4000,
        max: 85000,
        currency: "INR"
      },
      departureTimeSlots: [
        { label: "Morning (5:00 - 11:59)", value: "morning" },
        { label: "Afternoon (12:00 - 17:59)", value: "afternoon" },
        { label: "Evening (18:00 - 23:59)", value: "evening" }
      ]
    }
  };

  // Cache the result
  cacheService?.set(cacheKey, result);

  return result;
}

