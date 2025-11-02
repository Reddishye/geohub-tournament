type Round = {
  id: string
  _id?: string
  tournamentId: string // Tournament ID
  roundNumber: number
  latitude: number
  longitude: number
  createdAt?: Date
}

export default Round
