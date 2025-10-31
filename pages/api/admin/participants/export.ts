import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { collections, dbConnect } from '@backend/utils'

/**
 * API Route: /api/admin/participants/export
 * GET: Export all participants as CSV
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const session = await getSession({ req })
    
    if (!session || (session.user?.role !== 'ADMIN' && !session.user?.isAdmin)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    await dbConnect()

    const participants = await collections.participants
      ?.find({})
      .sort({ createdAt: -1 })
      .toArray() || []

    // Generate CSV
    const headers = ['Participant ID', 'Name', 'Surname', 'Notes', 'Created At']
    const csvRows = [headers.join(',')]

    participants.forEach(p => {
      const row = [
        p.participantId,
        `"${p.name}"`,
        `"${p.surname}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
        p.createdAt ? new Date(p.createdAt).toISOString() : ''
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=participants.csv')
    
    return res.status(200).send(csvContent)
  } catch (error) {
    console.error('Export participants error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
