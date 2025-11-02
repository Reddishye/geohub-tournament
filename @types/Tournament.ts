type Tournament = {
  id: string
  _id?: string
  name: string
  date: Date
  fairnessMode: 'total_random' | 'sync_random' | 'synchronized'
  mapPool: string
  numberOfRounds: number
  notes?: string
  status: 'WAITING' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED' | 'CANCELLED'
  createdBy: string // User ID
  createdAt?: Date
  startedAt?: Date | null
  finishedAt?: Date | null
  updatedAt?: Date
  gamemasterNotes?: string
}

export default Tournament
