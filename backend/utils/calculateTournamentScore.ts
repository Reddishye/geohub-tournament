/**
 * Calculates score based on distance using GeoGuessr's scoring formula
 * @param distanceKm - Distance in kilometers between guess and actual location
 * @returns Score between 0 and 5000
 */
export default function calculateTournamentScore(distanceKm: number): number {
  const maxScore = 5000
  const maxDistance = 20000 // km
  
  if (distanceKm === 0) return maxScore
  if (distanceKm >= maxDistance) return 0
  
  // Logarithmic formula
  const score = maxScore * Math.pow(0.99866017, distanceKm)
  return Math.round(score)
}
