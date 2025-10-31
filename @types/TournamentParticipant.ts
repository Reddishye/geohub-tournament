type TournamentParticipant = {
  id: string
  _id?: string
  tournamentId: string // Tournament ID
  participantId: string // Participant ID
  accessCode: string // 8 chars unique per tournament
  status: 'NOT_CONNECTED' | 'CONNECTED' | 'PAUSED' | 'PLAYING' | 'FINISHED'
  isPaused: boolean
  pausedAt?: Date | null
  pausedBy?: 'GAMEMASTER' | 'SYSTEM' | 'SELF' | null
  pauseReason?: string | null
  version: number // For optimistic locking
  lastHeartbeat?: Date | null
  lastActivity?: Date | null
  connectedAt?: Date | null
  finishedAt?: Date | null
  currentRound?: number
  totalScore?: number
  averageDistance?: number
}

export default TournamentParticipant
