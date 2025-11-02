import { collections } from './dbConnect'

/**
 * Creates indexes for tournament collections to optimize queries
 */
export async function createTournamentIndexes(): Promise<void> {
  try {
    // TournamentParticipant indexes
    await collections.tournamentParticipants?.createIndex(
      { tournamentId: 1, accessCode: 1 },
      { unique: true }
    )
    await collections.tournamentParticipants?.createIndex(
      { tournamentId: 1, participantId: 1 }
    )
    await collections.tournamentParticipants?.createIndex(
      { accessCode: 1 }
    )

    // TournamentGuess indexes
    await collections.tournamentGuesses?.createIndex(
      { roundId: 1, tournamentParticipantId: 1, createdAt: -1 }
    )

    // Round indexes
    await collections.rounds?.createIndex(
      { tournamentId: 1, roundNumber: 1 },
      { unique: true }
    )

    // Tournament indexes
    await collections.tournaments?.createIndex(
      { status: 1, date: -1 }
    )
    await collections.tournaments?.createIndex(
      { createdBy: 1, createdAt: -1 }
    )

    // Participant indexes
    await collections.participants?.createIndex(
      { participantId: 1 },
      { unique: true }
    )
    await collections.participants?.createIndex(
      { name: 1, surname: 1 }
    )

    console.log('✅ Tournament indexes created successfully')
  } catch (error) {
    console.error('❌ Error creating tournament indexes:', error)
    // Don't throw - indexes might already exist
  }
}

export default createTournamentIndexes
