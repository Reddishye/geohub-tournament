import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@backend/utils/dbConnect';
import TournamentParticipant from '@backend/models/tournamentParticipant';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { accessCode } = req.body;

    if (!accessCode || typeof accessCode !== 'string') {
      return res.status(400).json({ error: 'Access code is required' });
    }

    // Validate format (8 alphanumeric uppercase)
    if (!/^[A-Z0-9]{8}$/.test(accessCode)) {
      return res.status(400).json({ error: 'Invalid access code format' });
    }

    // Find tournament participant with access code
    const tournamentParticipant = await TournamentParticipant.findOne({ accessCode })
      .populate('tournamentId')
      .populate('participantId');

    if (!tournamentParticipant) {
      return res.status(404).json({ error: 'Invalid or expired tournament code' });
    }

    const tournament = tournamentParticipant.tournamentId as any;

    // Check tournament status
    if (tournament.status === 'CANCELLED') {
      return res.status(400).json({ error: 'This tournament has been cancelled' });
    }

    if (tournament.status === 'FINISHED') {
      return res.status(400).json({ error: 'This tournament has already ended' });
    }

    // Return tournament information
    return res.status(200).json({
      tournamentId: tournament._id.toString(),
      tournamentName: tournament.name,
      status: tournament.status,
      accessCode,
    });
  } catch (error) {
    console.error('Tournament validation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
