/**
 * Generates a unique participant ID in the format: PART-{timestamp}-{random4digits}
 * Example: PART-1730329800-4729
 */
export default function generateParticipantId(): string {
  const timestamp = Math.floor(Date.now() / 1000) // Unix timestamp in seconds
  const random4digits = Math.floor(1000 + Math.random() * 9000) // Random 4-digit number
  return `PART-${timestamp}-${random4digits}`
}
