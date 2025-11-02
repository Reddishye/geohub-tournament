import bcrypt from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import { collections, dbConnect } from '@backend/utils'

/**
 * API Route: POST /api/admin/setup
 * Creates the initial admin user if no users exist in the database
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await dbConnect()

    // Check if any users exist
    const userCount = await collections.users?.countDocuments()

    if (userCount && userCount > 0) {
      return res.status(400).json({ error: 'Setup already completed' })
    }

    const { username, email, password, confirmPassword } = req.body

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Username validation (3-20 alphanumeric characters)
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      return res.status(400).json({ 
        error: 'Username must be 3-20 alphanumeric characters' 
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Password validation (min 8 chars, must include uppercase, lowercase, and numbers)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers' 
      })
    }

    // Confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    // Check if email already exists (redundant check but safe)
    const existingEmail = await collections.users?.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const newUser = {
      _id: new ObjectId(),
      name: username,
      email,
      password: hashedPassword,
      role: 'ADMIN' as const,
      isAdmin: true,
      avatar: { emoji: '🔑', color: '#3B82F6' }, // Admin avatar
      createdAt: new Date(),
    }

    await collections.users?.insertOne(newUser)

    return res.status(201).json({ 
      success: true, 
      message: 'Admin user created successfully' 
    })
  } catch (error) {
    console.error('Admin setup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
