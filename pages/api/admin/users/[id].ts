import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { ObjectId } from 'mongodb'
import { collections, dbConnect } from '@backend/utils'

/**
 * API Route: DELETE /api/admin/users/[id]
 * Deletes an admin user (requires admin authentication)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authentication
    const session = await getSession({ req })
    
    if (!session || (session.user?.role !== 'ADMIN' && !session.user?.isAdmin)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    await dbConnect()

    // Check total number of admin users
    const adminCount = await collections.users?.countDocuments({
      $or: [
        { role: 'ADMIN' },
        { isAdmin: true }
      ]
    })

    if (adminCount && adminCount <= 1) {
      return res.status(400).json({ 
        error: 'Cannot delete the last administrator user' 
      })
    }

    // Prevent deleting yourself (optional safety check)
    if (session.user?.id === id) {
      return res.status(400).json({ 
        error: 'You cannot delete your own account' 
      })
    }

    // Delete the user
    const result = await collections.users?.deleteOne({ 
      _id: new ObjectId(id) 
    })

    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({ 
      success: true,
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
