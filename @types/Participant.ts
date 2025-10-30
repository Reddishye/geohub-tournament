type Participant = {
  id: string
  _id?: string
  participantId: string // Format: PART-{timestamp}-{random4digits}
  name: string
  surname: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export default Participant
