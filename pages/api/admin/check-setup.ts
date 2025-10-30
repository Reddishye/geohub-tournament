import { NextApiRequest, NextApiResponse } from 'next'
import { collections, dbConnect } from '@backend/utils'

/**
 * API Route: GET /api/admin/check-setup
 * Checks if initial admin setup is required
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await dbConnect()

    // Check if any users exist
    const userCount = await collections.users?.countDocuments()

    return res.status(200).json({ 
      setupRequired: !userCount || userCount === 0 
    })
  } catch (error) {
    console.error('Check setup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
