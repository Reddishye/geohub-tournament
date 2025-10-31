import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { ObjectId } from 'mongodb'
import { collections, dbConnect } from '@backend/utils'
import { participantSchema } from '@backend/validations/schemas'

/**
 * API Route: /api/admin/participants/[id]
 * GET: Get a single participant
 * PUT: Update a participant
 * DELETE: Delete a participant
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const session = await getSession({ req })
    
    if (!session || (session.user?.role !== 'ADMIN' && !session.user?.isAdmin)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid participant ID' })
    }

    await dbConnect()

    if (req.method === 'GET') {
      const participant = await collections.participants?.findOne({
        _id: new ObjectId(id)
      })

      if (!participant) {
        return res.status(404).json({ error: 'Participant not found' })
      }

      return res.status(200).json({ participant })
    }

    if (req.method === 'PUT') {
      // Validate input
      const validation = participantSchema.safeParse(req.body)
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: validation.error.errors[0].message 
        })
      }

      const { name, surname, notes } = validation.data

      const result = await collections.participants?.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            name,
            surname,
            notes: notes || '',
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      if (!result || !result.value) {
        return res.status(404).json({ error: 'Participant not found' })
      }

      return res.status(200).json({
        success: true,
        participant: result.value
      })
    }

    if (req.method === 'DELETE') {
      // Check if participant is in any active tournaments
      const activeTournamentCount = await collections.tournamentParticipants?.countDocuments({
        participantId: new ObjectId(id),
        $or: [
          { status: 'CONNECTED' },
          { status: 'PLAYING' }
        ]
      })

      if (activeTournamentCount && activeTournamentCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete participant assigned to active tournaments'
        })
      }

      const result = await collections.participants?.deleteOne({
        _id: new ObjectId(id)
      })

      if (!result || result.deletedCount === 0) {
        return res.status(404).json({ error: 'Participant not found' })
      }

      return res.status(200).json({
        success: true,
        message: 'Participant deleted successfully'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Participant API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
