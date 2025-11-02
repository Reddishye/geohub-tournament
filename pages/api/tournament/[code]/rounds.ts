import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@backend/utils/dbConnect';
import { getTournamentRounds } from '@backend/utils/generateTournamentRounds';
import TournamentParticipant from '@backend/models/tournamentParticipant';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Access code is required' });
    }

    // Find tournament participant
    const tournamentParticipant = await TournamentParticipant.findOne({ accessCode: code });

    if (!tournamentParticipant) {
      return res.status(404).json({ error: 'Invalid access code' });
    }

    // Get tournament rounds
    const rounds = await getTournamentRounds(
      tournamentParticipant.tournamentId as ObjectId,
      tournamentParticipant.participantId as ObjectId
    );

    return res.status(200).json({ rounds });
  } catch (error) {
    console.error('Get rounds error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
