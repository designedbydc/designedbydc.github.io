// Dummy hotel data for now - would be replaced with actual API integration
const hotels = [
  {
    id: "htl-001",
    name: "Grand Plaza Hotel",
    location: "NYC",
    address: "123 Broadway, New York, NY 10001",
    price: 250,
    rating: 4.5,
    amenities: ["Free WiFi", "Pool", "Gym", "Restaurant", "Bar"],
    images: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "htl-002",
    name: "Seaside Resort",
    location: "MIA",
    address: "456 Ocean Drive, Miami, FL 33139",
    price: 320,
    rating: 4.7,
    amenities: ["Free WiFi", "Beach Access", "Pool", "Spa", "Restaurant"],
    images: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "htl-003",
    name: "Downtown Suites",
    location: "LAX",
    address: "789 Main St, Los Angeles, CA 90001",
    price: 180,
    rating: 4.2,
    amenities: ["Free WiFi", "Gym", "Restaurant"],
    images: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "htl-004",
    name: "Luxury Palace",
    location: "LHR",
    address: "10 Regent Street, London, UK",
    price: 450,
    rating: 4.8,
    amenities: ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar"],
    images: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "htl-005",
    name: "City Center Inn",
    location: "NYC",
    address: "456 5th Avenue, New York, NY 10018",
    price: 200,
    rating: 4.0,
    amenities: ["Free WiFi", "Restaurant"],
    images: ["/placeholder.svg?height=200&width=300"],
  },
]

export async function searchHotels(location: string, checkIn: string, checkOut: string, guests: number) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filter hotels based on location
  const matchedHotels = hotels.filter((hotel) => hotel.location.toLowerCase() === location.toLowerCase())

  if (matchedHotels.length === 0) {
    return {
      message: `No hotels found in ${location} for ${guests} guests from ${checkIn} to ${checkOut}`,
      hotels: [],
    }
  }

  return {
    message: `Found ${matchedHotels.length} hotels in ${location} for ${guests} guests from ${checkIn} to ${checkOut}`,
    hotels: matchedHotels,
  }
}

export async function getHotelDetails(hotelId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const hotel = hotels.find((h) => h.id === hotelId)

  if (!hotel) {
    return {
      message: `Hotel with ID ${hotelId} not found`,
      hotel: null,
    }
  }

  return {
    message: `Details for ${hotel.name}`,
    hotel,
  }
}

