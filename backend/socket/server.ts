import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import Redis from 'ioredis'
import { ObjectId } from 'mongodb'
import { collections } from '@backend/utils'
import { generateTournamentRounds } from '@backend/utils/generateTournamentRounds'

const pubClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
const subClient = pubClient.duplicate()

export function setupWebSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    }
  })

  // Set up Redis adapter for scaling
  io.adapter(createAdapter(pubClient, subClient))

  // PARTICIPANT NAMESPACE - for tournament participants
  const tournamentNS = io.of('/tournament')

  tournamentNS.use(async (socket, next) => {
    try {
      const { accessCode } = socket.handshake.auth

      if (!accessCode) {
        return next(new Error('Access code required'))
      }

      // Validate access code and get participant
      const participant = await collections.tournamentParticipants?.findOne({
        accessCode: accessCode
      })

      if (!participant) {
        return next(new Error('Invalid access code'))
      }

      // Get tournament details
      const tournament = await collections.tournaments?.findOne({
        _id: participant.tournamentId
      })

      if (!tournament) {
        return next(new Error('Tournament not found'))
      }

      if (tournament.status === 'CANCELLED') {
        return next(new Error('Tournament cancelled'))
      }

      if (tournament.status === 'FINISHED') {
        return next(new Error('Tournament already finished'))
      }

      // Attach participant and tournament data to socket
      socket.data.participant = participant
      socket.data.tournamentId = participant.tournamentId.toString()
      socket.data.participantId = participant._id?.toString() || participant.id?.toString()

      next()
    } catch (error) {
      console.error('Tournament auth error:', error)
      next(new Error('Authentication failed'))
    }
  })

  tournamentNS.on('connection', async (socket) => {
    const { tournamentId, participantId } = socket.data

    console.log(`Participant ${participantId} connected to tournament ${tournamentId}`)

    // Join tournament room
    socket.join(`tournament:${tournamentId}`)

    // Update participant status
    await collections.tournamentParticipants?.findOneAndUpdate(
      { _id: new ObjectId(participantId) },
      {
        $set: {
          status: 'CONNECTED',
          connectedAt: new Date(),
          lastHeartbeat: new Date()
        }
      }
    )

    // Notify admin of connection
    io.of('/admin').to(`tournament:${tournamentId}`).emit('participant:connected', {
      participantId,
      timestamp: new Date()
    })

    // Heartbeat mechanism
    socket.on('heartbeat', async () => {
      await collections.tournamentParticipants?.findOneAndUpdate(
        { _id: new ObjectId(participantId) },
        {
          $set: {
            lastHeartbeat: new Date()
          }
        }
      )
    })

    // Handle guess submission
    socket.on('guess:submit', async (data) => {
      try {
        const { roundId, guessLatitude, guessLongitude, timeSeconds } = data

        // Get round details
        const round = await collections.rounds?.findOne({
          _id: new ObjectId(roundId)
        })

        if (!round) {
          socket.emit('error', { message: 'Round not found' })
          return
        }

        // Calculate distance (using existing utility)
        const { default: calculateDistance } = await import('@backend/utils/calculateDistance')
        const distanceKm = calculateDistance(
          { lat: round.latitude, lng: round.longitude },
          { lat: guessLatitude, lng: guessLongitude },
          'metric'
        )

        // Calculate score
        const { default: calculateTournamentScore } = await import(
          '@backend/utils/calculateTournamentScore'
        )
        const score = calculateTournamentScore(distanceKm)

        // Save guess
        const guess = {
          _id: new ObjectId(),
          roundId: new ObjectId(roundId),
          tournamentParticipantId: new ObjectId(participantId),
          guessLatitude,
          guessLongitude,
          distanceKm,
          score,
          timeSeconds,
          createdAt: new Date()
        }

        await collections.tournamentGuesses?.insertOne(guess as any)

        // Update participant stats
        const allGuesses = await collections.tournamentGuesses
          ?.find({ tournamentParticipantId: new ObjectId(participantId) })
          .toArray()

        const totalScore = allGuesses?.reduce((sum, g) => sum + g.score, 0) || 0
        const avgDistance =
          (allGuesses?.reduce((sum, g) => sum + g.distanceKm, 0) || 0) / (allGuesses?.length || 1)

        await collections.tournamentParticipants?.findOneAndUpdate(
          { _id: new ObjectId(participantId) },
          {
            $set: {
              totalScore,
              averageDistance: avgDistance,
              currentRound: (socket.data.participant.currentRound || 0) + 1
            }
          }
        )

        // Emit guess result to participant
        socket.emit('guess:result', {
          score,
          distanceKm,
          totalScore
        })

        // Notify admin of new guess
        io.of('/admin').to(`tournament:${tournamentId}`).emit('guess:received', {
          participantId,
          roundId,
          score,
          distanceKm,
          timestamp: new Date()
        })

        // Update scoreboard
        await emitScoreboardUpdate(io, tournamentId)
      } catch (error) {
        console.error('Error submitting guess:', error)
        socket.emit('error', { message: 'Failed to submit guess' })
      }
    })

    // Handle participant ready
    socket.on('participant:ready', async () => {
      await collections.tournamentParticipants?.findOneAndUpdate(
        { _id: new ObjectId(participantId) },
        {
          $set: {
            status: 'PLAYING'
          }
        }
      )

      io.of('/admin').to(`tournament:${tournamentId}`).emit('participant:status_changed', {
        participantId,
        status: 'PLAYING'
      })
    })

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`Participant ${participantId} disconnected`)

      await collections.tournamentParticipants?.findOneAndUpdate(
        { _id: new ObjectId(participantId) },
        {
          $set: {
            status: 'NOT_CONNECTED'
          }
        }
      )

      io.of('/admin').to(`tournament:${tournamentId}`).emit('participant:disconnected', {
        participantId,
        timestamp: new Date()
      })
    })
  })

  // ADMIN NAMESPACE - for tournament management
  const adminNS = io.of('/admin')

  adminNS.use(async (socket, next) => {
    try {
      // In production, validate admin session here
      // For now, we'll accept connections
      next()
    } catch (error) {
      next(new Error('Admin authentication failed'))
    }
  })

  adminNS.on('connection', (socket) => {
    console.log('Admin connected')

    // Join tournament room for monitoring
    socket.on('monitor:tournament', (tournamentId) => {
      socket.join(`tournament:${tournamentId}`)
      console.log(`Admin monitoring tournament ${tournamentId}`)
    })

    // Leave tournament room
    socket.on('leave:tournament', (tournamentId) => {
      socket.leave(`tournament:${tournamentId}`)
    })

    // Start tournament
    socket.on('tournament:start', async (tournamentId) => {
      try {
        // Generate rounds based on fairness mode
        await generateTournamentRounds(new ObjectId(tournamentId))

        await collections.tournaments?.findOneAndUpdate(
          { _id: new ObjectId(tournamentId) },
          {
            $set: {
              status: 'IN_PROGRESS',
              startedAt: new Date()
            }
          }
        )

        // Notify all participants
        tournamentNS.to(`tournament:${tournamentId}`).emit('tournament:started', {
          tournamentId,
          timestamp: new Date()
        })

        // Notify admin clients
        adminNS.to(`tournament:${tournamentId}`).emit('tournament:status_changed', {
          tournamentId,
          status: 'IN_PROGRESS'
        })
      } catch (error) {
        console.error('Error starting tournament:', error)
        socket.emit('error', { message: 'Failed to start tournament' })
      }
    })

    // Pause tournament
    socket.on('tournament:pause', async (tournamentId) => {
      try {
        await collections.tournaments?.findOneAndUpdate(
          { _id: new ObjectId(tournamentId) },
          {
            $set: {
              status: 'PAUSED'
            }
          }
        )

        tournamentNS.to(`tournament:${tournamentId}`).emit('tournament:paused', {
          reason: 'Paused by gamemaster'
        })

        adminNS.to(`tournament:${tournamentId}`).emit('tournament:status_changed', {
          tournamentId,
          status: 'PAUSED'
        })
      } catch (error) {
        console.error('Error pausing tournament:', error)
      }
    })

    // Resume tournament
    socket.on('tournament:resume', async (tournamentId) => {
      try {
        await collections.tournaments?.findOneAndUpdate(
          { _id: new ObjectId(tournamentId) },
          {
            $set: {
              status: 'IN_PROGRESS'
            }
          }
        )

        tournamentNS.to(`tournament:${tournamentId}`).emit('tournament:resumed', {})

        adminNS.to(`tournament:${tournamentId}`).emit('tournament:status_changed', {
          tournamentId,
          status: 'IN_PROGRESS'
        })
      } catch (error) {
        console.error('Error resuming tournament:', error)
      }
    })

    // End tournament
    socket.on('tournament:end', async (tournamentId) => {
      try {
        await collections.tournaments?.findOneAndUpdate(
          { _id: new ObjectId(tournamentId) },
          {
            $set: {
              status: 'FINISHED',
              finishedAt: new Date()
            }
          }
        )

        // Get final scoreboard
        const scoreboard = await getScoreboard(tournamentId)

        tournamentNS.to(`tournament:${tournamentId}`).emit('tournament:ended', {
          scoreboard
        })

        adminNS.to(`tournament:${tournamentId}`).emit('tournament:status_changed', {
          tournamentId,
          status: 'FINISHED'
        })
      } catch (error) {
        console.error('Error ending tournament:', error)
      }
    })

    // Pause individual participant
    socket.on('participant:pause', async ({ tournamentId, participantId, reason }) => {
      try {
        await collections.tournamentParticipants?.findOneAndUpdate(
          { _id: new ObjectId(participantId) },
          {
            $set: {
              isPaused: true,
              pausedAt: new Date(),
              pausedBy: 'GAMEMASTER',
              pauseReason: reason || 'Paused by gamemaster'
            }
          }
        )

        // Find participant's socket and emit pause
        const participantSockets = await tournamentNS
          .in(`tournament:${tournamentId}`)
          .fetchSockets()
        const targetSocket = participantSockets.find(
          (s) => s.data.participantId === participantId
        )

        if (targetSocket) {
          targetSocket.emit('participant:paused', {
            reason: reason || 'Paused by gamemaster'
          })
        }

        adminNS.to(`tournament:${tournamentId}`).emit('participant:status_changed', {
          participantId,
          isPaused: true
        })
      } catch (error) {
        console.error('Error pausing participant:', error)
      }
    })

    // Resume individual participant
    socket.on('participant:resume', async ({ tournamentId, participantId }) => {
      try {
        await collections.tournamentParticipants?.findOneAndUpdate(
          { _id: new ObjectId(participantId) },
          {
            $set: {
              isPaused: false,
              pausedAt: null,
              pausedBy: null,
              pauseReason: null
            }
          }
        )

        const participantSockets = await tournamentNS
          .in(`tournament:${tournamentId}`)
          .fetchSockets()
        const targetSocket = participantSockets.find(
          (s) => s.data.participantId === participantId
        )

        if (targetSocket) {
          targetSocket.emit('participant:resumed', {})
        }

        adminNS.to(`tournament:${tournamentId}`).emit('participant:status_changed', {
          participantId,
          isPaused: false
        })
      } catch (error) {
        console.error('Error resuming participant:', error)
      }
    })

    socket.on('disconnect', () => {
      console.log('Admin disconnected')
    })
  })

  return io
}

// Helper function to get scoreboard
async function getScoreboard(tournamentId: string) {
  const participants = await collections.tournamentParticipants
    ?.find({ tournamentId: new ObjectId(tournamentId) })
    .toArray()

  if (!participants) return []

  const scoreboard = await Promise.all(
    participants.map(async (p) => {
      const participantDetails = await collections.participants?.findOne({
        _id: p.participantId
      })

      return {
        participantId: p._id?.toString() || p.id?.toString() || '',
        name: participantDetails
          ? `${participantDetails.name} ${participantDetails.surname}`
          : 'Unknown',
        totalScore: p.totalScore || 0,
        averageDistance: p.averageDistance || 0,
        currentRound: p.currentRound || 0,
        status: p.status
      }
    })
  )

  return scoreboard.sort((a, b) => b.totalScore - a.totalScore)
}

// Helper function to emit scoreboard updates
async function emitScoreboardUpdate(io: Server, tournamentId: string) {
  const scoreboard = await getScoreboard(tournamentId)

  io.of('/admin').to(`tournament:${tournamentId}`).emit('scoreboard:updated', {
    scoreboard,
    timestamp: new Date()
  })
}

export default setupWebSocket
