import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@pages/api/auth/[...nextauth]'
import dbConnect, { collections } from '@backend/utils/dbConnect'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await dbConnect()

    // Get tournament
    const tournament = await collections.tournaments?.findOne({
      _id: new ObjectId(id as string)
    })

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' })
    }

    // Get all tournament participants with their scores
    const tournamentParticipants = await collections.tournamentParticipants
      ?.find({ tournamentId: new ObjectId(id as string) })
      .toArray()

    if (!tournamentParticipants) {
      return res.status(200).json([])
    }

    // Build scoreboard
    const scoreboard = await Promise.all(
      tournamentParticipants.map(async (tp) => {
        const participant = await collections.participants?.findOne({
          _id: tp.participantId
        })

        return {
          participantId: tp._id?.toString() || '',
          name: participant ? `${participant.name} ${participant.surname}` : 'Unknown',
          totalScore: tp.totalScore || 0,
          averageDistance: tp.averageDistance || 0,
          currentRound: tp.currentRound || 0,
          totalRounds: tournament.numberOfRounds,
          status: tp.status || 'NOT_CONNECTED'
        }
      })
    )

    // Sort by total score descending
    scoreboard.sort((a, b) => b.totalScore - a.totalScore)

    res.status(200).json(scoreboard)
  } catch (error) {
    console.error('Error fetching scoreboard:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
