// Dummy flight data
const flights = [
  {
    id: "fl-001",
    flightNumber: "AA123",
    airline: "American Airlines",
    origin: "NYC",
    destination: "LAX",
    departureTime: "2023-07-15T08:00:00",
    arrivalTime: "2023-07-15T11:30:00",
    price: 350,
    duration: "3h 30m",
    stops: 0,
  },
  {
    id: "fl-002",
    flightNumber: "DL456",
    airline: "Delta Airlines",
    origin: "NYC",
    destination: "LAX",
    departureTime: "2023-07-15T10:15:00",
    arrivalTime: "2023-07-15T13:45:00",
    price: 320,
    duration: "3h 30m",
    stops: 0,
  },
  {
    id: "fl-003",
    flightNumber: "UA789",
    airline: "United Airlines",
    origin: "NYC",
    destination: "LAX",
    departureTime: "2023-07-15T13:30:00",
    arrivalTime: "2023-07-15T17:00:00",
    price: 290,
    duration: "3h 30m",
    stops: 0,
  },
  {
    id: "fl-004",
    flightNumber: "BA101",
    airline: "British Airways",
    origin: "LHR",
    destination: "JFK",
    departureTime: "2023-07-15T10:00:00",
    arrivalTime: "2023-07-15T13:00:00",
    price: 650,
    duration: "7h 00m",
    stops: 0,
  },
  {
    id: "fl-005",
    flightNumber: "LH202",
    airline: "Lufthansa",
    origin: "FRA",
    destination: "SFO",
    departureTime: "2023-07-15T12:30:00",
    arrivalTime: "2023-07-15T15:30:00",
    price: 720,
    duration: "11h 00m",
    stops: 0,
  },
]

export async function searchFlights(origin: string, destination: string, date: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filter flights based on origin and destination
  const matchedFlights = flights.filter(
    (flight) =>
      flight.origin.toLowerCase() === origin.toLowerCase() &&
      flight.destination.toLowerCase() === destination.toLowerCase(),
  )

  if (matchedFlights.length === 0) {
    return {
      message: `No flights found from ${origin} to ${destination} on ${date}`,
      flights: [],
    }
  }

  return {
    message: `Found ${matchedFlights.length} flights from ${origin} to ${destination} on ${date}`,
    flights: matchedFlights,
  }
}

export async function getFlightDetails(flightNumber: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const flight = flights.find((f) => f.flightNumber.toLowerCase() === flightNumber.toLowerCase())

  if (!flight) {
    return {
      message: `Flight ${flightNumber} not found`,
      flight: null,
    }
  }

  return {
    message: `Details for flight ${flightNumber}`,
    flight,
  }
}

