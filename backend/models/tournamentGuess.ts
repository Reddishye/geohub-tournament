import { ObjectId } from 'mongodb'

type TournamentGuess = {
  id?: ObjectId
  _id?: ObjectId
  roundId: ObjectId // Round ID
  tournamentParticipantId: ObjectId // TournamentParticipant ID
  guessLatitude: number
  guessLongitude: number
  distanceKm: number
  score: number
  timeSeconds: number
  createdAt?: Date
}

export default TournamentGuess
