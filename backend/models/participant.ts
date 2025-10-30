import { ObjectId } from 'mongodb'

type Participant = {
  id?: ObjectId
  _id?: ObjectId
  participantId: string // Format: PART-{timestamp}-{random4digits}
  name: string
  surname: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export default Participant
