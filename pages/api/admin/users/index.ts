import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { collections, dbConnect } from '@backend/utils'

/**
 * API Route: GET /api/admin/users
 * Lists all admin users (requires admin authentication)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authentication
    const session = await getSession({ req })
    
    if (!session || (session.user?.role !== 'ADMIN' && !session.user?.isAdmin)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await dbConnect()

    // Get all users (admin users only)
    const users = await collections.users
      ?.find({ 
        $or: [
          { role: 'ADMIN' },
          { isAdmin: true }
        ]
      })
      .project({ password: 0 }) // Exclude password field
      .sort({ createdAt: -1 })
      .toArray()

    return res.status(200).json({ 
      users: users || [] 
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
