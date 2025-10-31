import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { ObjectId } from 'mongodb'
import { collections, dbConnect } from '@backend/utils'
import generateParticipantId from '@backend/utils/generateParticipantId'
import { participantSchema } from '@backend/validations/schemas'

/**
 * API Route: /api/admin/participants
 * GET: List all participants with optional search and pagination
 * POST: Create a new participant
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
      const { search, page = '1', limit = '50' } = req.query
      
      const pageNum = parseInt(page as string)
      const limitNum = parseInt(limit as string)
      const skip = (pageNum - 1) * limitNum

      // Build search query
      let query = {}
      if (search && typeof search === 'string') {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { surname: { $regex: search, $options: 'i' } },
            { participantId: { $regex: search, $options: 'i' } }
          ]
        }
      }

      const [participants, total] = await Promise.all([
        collections.participants
          ?.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray() || [],
        collections.participants?.countDocuments(query) || 0
      ])

      return res.status(200).json({
        participants,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      })
    }

    if (req.method === 'POST') {
      // Validate input
      const validation = participantSchema.safeParse(req.body)
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: validation.error.errors[0].message 
        })
      }

      const { name, surname, notes } = validation.data

      // Generate unique participant ID
      const participantId = generateParticipantId()

      // Create participant
      const newParticipant = {
        _id: new ObjectId(),
        participantId,
        name,
        surname,
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await collections.participants?.insertOne(newParticipant)

      return res.status(201).json({
        success: true,
        participant: newParticipant
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Participants API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
