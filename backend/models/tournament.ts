import { ObjectId } from 'mongodb'

type Tournament = {
  id?: ObjectId
  _id?: ObjectId
  name: string
  date: Date
  fairnessMode: 'total_random' | 'sync_random' | 'synchronized'
  mapPool: string
  numberOfRounds: number
  notes?: string
  status: 'WAITING' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED' | 'CANCELLED'
  createdBy: ObjectId // User ID
  createdAt?: Date
  startedAt?: Date | null
  finishedAt?: Date | null
  updatedAt?: Date
  gamemasterNotes?: string
}

export default Tournament
