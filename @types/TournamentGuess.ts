type TournamentGuess = {
  id: string
  _id?: string
  roundId: string // Round ID
  tournamentParticipantId: string // TournamentParticipant ID
  guessLatitude: number
  guessLongitude: number
  distanceKm: number
  score: number
  timeSeconds: number
  createdAt?: Date
}

export default TournamentGuess
