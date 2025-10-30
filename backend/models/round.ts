import { ObjectId } from 'mongodb'

type Round = {
  id?: ObjectId
  _id?: ObjectId
  tournamentId: ObjectId // Tournament ID
  roundNumber: number
  latitude: number
  longitude: number
  createdAt?: Date
}

export default Round
