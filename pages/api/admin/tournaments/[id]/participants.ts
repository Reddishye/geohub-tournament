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

    // Get tournament participants with their access codes and stats
    const tournamentParticipants = await collections.tournamentParticipants
      ?.find({ tournamentId: new ObjectId(id as string) })
      .toArray()

    if (!tournamentParticipants) {
      return res.status(404).json({ error: 'Tournament not found' })
    }

    // Get participant details
    const enrichedParticipants = await Promise.all(
      tournamentParticipants.map(async (tp) => {
        const participant = await collections.participants?.findOne({
          _id: tp.participantId
        })

        return {
          _id: tp._id,
          participantId: tp.participantId,
          name: participant ? `${participant.name} ${participant.surname}` : 'Unknown',
          accessCode: tp.accessCode,
          status: tp.status || 'NOT_CONNECTED',
          isPaused: tp.isPaused || false,
          pausedAt: tp.pausedAt,
          pausedBy: tp.pausedBy,
          pauseReason: tp.pauseReason,
          connectedAt: tp.connectedAt,
          lastHeartbeat: tp.lastHeartbeat,
          currentRound: tp.currentRound || 0,
          totalScore: tp.totalScore || 0,
          averageDistance: tp.averageDistance || 0
        }
      })
    )

    res.status(200).json(enrichedParticipants)
  } catch (error) {
    console.error('Error fetching tournament participants:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
