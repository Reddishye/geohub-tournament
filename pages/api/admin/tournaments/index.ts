import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { ObjectId } from 'mongodb'
import { collections, dbConnect } from '@backend/utils'
import generateAccessCode from '@backend/utils/generateAccessCode'
import { tournamentSchema } from '@backend/validations/schemas'

/**
 * API Route: /api/admin/tournaments
 * GET: List all tournaments with optional filters
 * POST: Create a new tournament with participants and access codes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const session = await getSession({ req })
    
    if (!session || (session.user?.role !== 'ADMIN' && !session.user?.isAdmin)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await dbConnect()

    if (req.method === 'GET') {
      const { status, page = '1', limit = '50' } = req.query
      
      const pageNum = parseInt(page as string)
      const limitNum = parseInt(limit as string)
      const skip = (pageNum - 1) * limitNum

      // Build query
      let query: any = {}
      if (status && typeof status === 'string') {
        query.status = status
      }

      const [tournaments, total] = await Promise.all([
        collections.tournaments
          ?.find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray() || [],
        collections.tournaments?.countDocuments(query) || 0
      ])

      // Get participant counts for each tournament
      const tournamentsWithCounts = await Promise.all(
        tournaments.map(async (t) => {
          const participantCount = await collections.tournamentParticipants?.countDocuments({
            tournamentId: t._id
          }) || 0
          
          return {
            ...t,
            participantCount
          }
        })
      )

      return res.status(200).json({
        tournaments: tournamentsWithCounts,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      })
    }

    if (req.method === 'POST') {
      // Validate input
      const validation = tournamentSchema.safeParse(req.body)
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: validation.error.errors[0].message 
        })
      }

      const { name, date, fairnessMode, mapPool, numberOfRounds, notes, participantIds } = validation.data

      // Create tournament
      const tournamentId = new ObjectId()
      const newTournament = {
        _id: tournamentId,
        name,
        date: new Date(date),
        fairnessMode,
        mapPool,
        numberOfRounds,
        notes: notes || '',
        status: 'WAITING' as const,
        createdBy: new ObjectId(session.user.id),
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
        updatedAt: new Date(),
        gamemasterNotes: ''
      }

      await collections.tournaments?.insertOne(newTournament)

      // Create tournament participants with unique access codes
      const tournamentParticipants = await Promise.all(
        participantIds.map(async (participantId) => {
          const accessCode = await generateAccessCode(tournamentId)
          
          return {
            _id: new ObjectId(),
            tournamentId,
            participantId: new ObjectId(participantId),
            accessCode,
            status: 'NOT_CONNECTED' as const,
            isPaused: false,
            pausedAt: null,
            pausedBy: null,
            pauseReason: null,
            version: 0,
            lastHeartbeat: null,
            lastActivity: null,
            connectedAt: null,
            finishedAt: null,
            currentRound: 0,
            totalScore: 0,
            averageDistance: 0
          }
        })
      )

      if (tournamentParticipants.length > 0) {
        await collections.tournamentParticipants?.insertMany(tournamentParticipants)
      }

      return res.status(201).json({
        success: true,
        tournament: newTournament,
        participants: tournamentParticipants
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Tournaments API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
