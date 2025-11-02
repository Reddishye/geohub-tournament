import { ObjectId } from 'mongodb'

type User = {
  id: ObjectId
  name: string
  bio?: string
  email: string
  password: string
  avatar: { emoji: string; color: string }
  createdAt?: Date
  isAdmin?: boolean
  role?: 'ADMIN' // New role field for tournament system
}

export default User
