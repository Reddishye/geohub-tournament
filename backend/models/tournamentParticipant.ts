import { ObjectId } from 'mongodb'

type TournamentParticipant = {
  id?: ObjectId
  _id?: ObjectId
  tournamentId: ObjectId // Tournament ID
  participantId: ObjectId // Participant ID
  accessCode: string // 8 chars unique per tournament
  status: 'NOT_CONNECTED' | 'CONNECTED' | 'PAUSED' | 'PLAYING' | 'FINISHED'
  isPaused: boolean
  lastActivity?: Date | null
  connectedAt?: Date | null
  finishedAt?: Date | null
  currentRound?: number
  totalScore?: number
  averageDistance?: number
}

export default TournamentParticipant
