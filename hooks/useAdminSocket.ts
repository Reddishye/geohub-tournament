import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type AdminSocketData = {
  connected: boolean
  error: string | null
}

export function useAdminSocket(tournamentId: string | null) {
  const [data, setData] = useState<AdminSocketData>({
    connected: false,
    error: null
  })
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect to admin namespace
    const socket = io('/admin')

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Admin connected to WebSocket')
      setData({ connected: true, error: null })

      // Join tournament monitoring room
      if (tournamentId) {
        socket.emit('monitor:tournament', tournamentId)
      }
    })

    socket.on('connect_error', (error) => {
      console.error('Admin connection error:', error.message)
      setData({ connected: false, error: error.message })
    })

    socket.on('disconnect', () => {
      console.log('Admin disconnected from WebSocket')
      setData({ connected: false, error: null })
    })

    return () => {
      if (tournamentId) {
        socket.emit('leave:tournament', tournamentId)
      }
      socket.disconnect()
    }
  }, [tournamentId])

  // Participant connected event
  const onParticipantConnected = (callback: (data: any) => void) => {
    socketRef.current?.on('participant:connected', callback)
    return () => {
      socketRef.current?.off('participant:connected', callback)
    }
  }

  // Participant disconnected event
  const onParticipantDisconnected = (callback: (data: any) => void) => {
    socketRef.current?.on('participant:disconnected', callback)
    return () => {
      socketRef.current?.off('participant:disconnected', callback)
    }
  }

  // Participant status changed event
  const onParticipantStatusChanged = (callback: (data: any) => void) => {
    socketRef.current?.on('participant:status_changed', callback)
    return () => {
      socketRef.current?.off('participant:status_changed', callback)
    }
  }

  // Guess received event
  const onGuessReceived = (callback: (data: any) => void) => {
    socketRef.current?.on('guess:received', callback)
    return () => {
      socketRef.current?.off('guess:received', callback)
    }
  }

  // Scoreboard updated event
  const onScoreboardUpdated = (callback: (data: any) => void) => {
    socketRef.current?.on('scoreboard:updated', callback)
    return () => {
      socketRef.current?.off('scoreboard:updated', callback)
    }
  }

  // Tournament status changed event
  const onTournamentStatusChanged = (callback: (data: any) => void) => {
    socketRef.current?.on('tournament:status_changed', callback)
    return () => {
      socketRef.current?.off('tournament:status_changed', callback)
    }
  }

  // Error event
  const onError = (callback: (data: any) => void) => {
    socketRef.current?.on('error', callback)
    return () => {
      socketRef.current?.off('error', callback)
    }
  }

  // Start tournament
  const startTournament = (tournamentId: string) => {
    socketRef.current?.emit('tournament:start', tournamentId)
  }

  // Pause tournament
  const pauseTournament = (tournamentId: string) => {
    socketRef.current?.emit('tournament:pause', tournamentId)
  }

  // Resume tournament
  const resumeTournament = (tournamentId: string) => {
    socketRef.current?.emit('tournament:resume', tournamentId)
  }

  // End tournament
  const endTournament = (tournamentId: string) => {
    socketRef.current?.emit('tournament:end', tournamentId)
  }

  // Pause participant
  const pauseParticipant = (data: {
    tournamentId: string
    participantId: string
    reason?: string
  }) => {
    socketRef.current?.emit('participant:pause', data)
  }

  // Resume participant
  const resumeParticipant = (data: { tournamentId: string; participantId: string }) => {
    socketRef.current?.emit('participant:resume', data)
  }

  return {
    ...data,
    socket: socketRef.current,
    onParticipantConnected,
    onParticipantDisconnected,
    onParticipantStatusChanged,
    onGuessReceived,
    onScoreboardUpdated,
    onTournamentStatusChanged,
    onError,
    startTournament,
    pauseTournament,
    resumeTournament,
    endTournament,
    pauseParticipant,
    resumeParticipant
  }
}
