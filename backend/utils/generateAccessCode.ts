import { ObjectId } from 'mongodb'
import { collections } from './dbConnect'

/**
 * Generates a unique 8-character alphanumeric access code for tournament participants
 * Format: 8 uppercase letters and numbers (e.g., "XK7M2P9R")
 * Recursively generates a new code if the generated one already exists in the tournament
 */
export default async function generateAccessCode(tournamentId: ObjectId): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Check if code already exists for this tournament
  const existing = await collections.tournamentParticipants?.findOne({
    tournamentId: tournamentId,
    accessCode: code,
  })
  
  // If exists, recursively generate a new one
  if (existing) {
    return generateAccessCode(tournamentId)
  }
  
  return code
}
