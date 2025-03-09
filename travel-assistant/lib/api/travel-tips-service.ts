// Dummy travel tips data
const travelTips = {
  NYC: {
    bestTimeToVisit: "April to June and September to November",
    mustSeeAttractions: [
      "Statue of Liberty",
      "Central Park",
      "Empire State Building",
      "Times Square",
      "Metropolitan Museum of Art",
    ],
    localCuisine: ["New York-style pizza", "Bagels", "Cheesecake", "Pastrami sandwiches"],
    transportationTips: "The subway is the fastest way to get around. Consider getting a MetroCard for your stay.",
    safetyTips: "Stay aware of your surroundings, especially in crowded tourist areas. Keep valuables secure.",
  },
  LAX: {
    bestTimeToVisit: "March to May and September to November",
    mustSeeAttractions: [
      "Hollywood Walk of Fame",
      "Universal Studios",
      "Griffith Observatory",
      "Santa Monica Pier",
      "The Getty Center",
    ],
    localCuisine: ["Fish tacos", "Korean BBQ", "In-N-Out Burger", "Farmers markets"],
    transportationTips:
      "Renting a car is recommended as public transportation is limited. Ride-sharing services are widely available.",
    safetyTips:
      "Be cautious in tourist areas and keep valuables out of sight. Lock your car and don't leave belongings visible.",
  },
  LHR: {
    bestTimeToVisit: "May to September",
    mustSeeAttractions: ["Buckingham Palace", "Tower of London", "British Museum", "London Eye", "Westminster Abbey"],
    localCuisine: ["Fish and chips", "Full English breakfast", "Sunday roast", "Afternoon tea"],
    transportationTips:
      "The London Underground (Tube) is efficient and covers most of the city. Consider getting an Oyster card.",
    safetyTips: "London is generally safe, but be aware of pickpockets in tourist areas and on public transport.",
  },
  default: {
    bestTimeToVisit: "Research the specific destination for optimal visiting times",
    mustSeeAttractions: [
      "Research local attractions before your trip",
      "Check travel guides for up-to-date information",
    ],
    localCuisine: ["Try local specialties", "Ask locals for restaurant recommendations"],
    transportationTips:
      "Research local transportation options before your trip. Public transportation is often more economical than taxis.",
    safetyTips:
      "Research the safety situation of your destination. Keep copies of important documents. Register with your embassy if traveling to high-risk areas.",
  },
}

export async function getTravelTips(destination: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const tips = travelTips[destination.toUpperCase()] || travelTips["default"]

  return {
    destination,
    tips,
  }
}

