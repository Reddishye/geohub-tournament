import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { ObjectId } from 'mongodb'
import { collections, dbConnect } from '@backend/utils'

/**
 * API Route: /api/admin/tournaments/[id]
 * GET: Get tournament details with participants
 * PUT: Update tournament
 * DELETE: Delete tournament (only if not started)
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
      return res.status(400).json({ error: 'Invalid tournament ID' })
    }

    await dbConnect()

    if (req.method === 'GET') {
      const tournament = await collections.tournaments?.findOne({
        _id: new ObjectId(id)
      })

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' })
      }

      // Get tournament participants with participant details
      const tournamentParticipants = await collections.tournamentParticipants
        ?.find({ tournamentId: new ObjectId(id) })
        .toArray() || []

      const participantsWithDetails = await Promise.all(
        tournamentParticipants.map(async (tp) => {
          const participant = await collections.participants?.findOne({
            _id: tp.participantId
          })
          
          return {
            ...tp,
            participantDetails: participant
          }
        })
      )

      return res.status(200).json({
        tournament,
        participants: participantsWithDetails
      })
    }

    if (req.method === 'PUT') {
      const tournament = await collections.tournaments?.findOne({
        _id: new ObjectId(id)
      })

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' })
      }

      // Only allow updates if tournament hasn't started
      if (tournament.status !== 'WAITING') {
        return res.status(400).json({
          error: 'Cannot update tournament that has already started'
        })
      }

      const { name, date, fairnessMode, mapPool, numberOfRounds, notes } = req.body

      const result = await collections.tournaments?.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...(name && { name }),
            ...(date && { date: new Date(date) }),
            ...(fairnessMode && { fairnessMode }),
            ...(mapPool && { mapPool }),
            ...(numberOfRounds && { numberOfRounds }),
            ...(notes !== undefined && { notes }),
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      if (!result || !result.value) {
        return res.status(404).json({ error: 'Tournament not found' })
      }

      return res.status(200).json({
        success: true,
        tournament: result.value
      })
    }

    if (req.method === 'DELETE') {
      const tournament = await collections.tournaments?.findOne({
        _id: new ObjectId(id)
      })

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' })
      }

      // Only allow deletion if tournament hasn't started
      if (tournament.status !== 'WAITING') {
        return res.status(400).json({
          error: 'Cannot delete tournament that has already started. Cancel it instead.'
        })
      }

      // Delete tournament and related participants
      await Promise.all([
        collections.tournaments?.deleteOne({ _id: new ObjectId(id) }),
        collections.tournamentParticipants?.deleteMany({ tournamentId: new ObjectId(id) })
      ])

      return res.status(200).json({
        success: true,
        message: 'Tournament deleted successfully'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Tournament API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
