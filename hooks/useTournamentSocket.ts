import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type TournamentSocketData = {
  connected: boolean
  error: string | null
}

export function useTournamentSocket(accessCode: string | null) {
  const [data, setData] = useState<TournamentSocketData>({
    connected: false,
    error: null
  })
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!accessCode) return

    // Connect to tournament namespace
    const socket = io('/tournament', {
      auth: {
        accessCode
      }
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to tournament')
      setData({ connected: true, error: null })

      // Send heartbeat every 10 seconds
      const heartbeatInterval = setInterval(() => {
        socket.emit('heartbeat')
      }, 10000)

      socket.on('disconnect', () => {
        clearInterval(heartbeatInterval)
      })
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message)
      setData({ connected: false, error: error.message })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from tournament')
      setData({ connected: false, error: null })
    })

    return () => {
      socket.disconnect()
    }
  }, [accessCode])

  // Tournament started event
  const onTournamentStarted = (callback: (data: any) => void) => {
    socketRef.current?.on('tournament:started', callback)
    return () => {
      socketRef.current?.off('tournament:started', callback)
    }
  }

  // Tournament paused event
  const onTournamentPaused = (callback: (data: any) => void) => {
    socketRef.current?.on('tournament:paused', callback)
    return () => {
      socketRef.current?.off('tournament:paused', callback)
    }
  }

  // Tournament resumed event
  const onTournamentResumed = (callback: () => void) => {
    socketRef.current?.on('tournament:resumed', callback)
    return () => {
      socketRef.current?.off('tournament:resumed', callback)
    }
  }

  // Tournament ended event
  const onTournamentEnded = (callback: (data: any) => void) => {
    socketRef.current?.on('tournament:ended', callback)
    return () => {
      socketRef.current?.off('tournament:ended', callback)
    }
  }

  // Participant paused event
  const onParticipantPaused = (callback: (data: any) => void) => {
    socketRef.current?.on('participant:paused', callback)
    return () => {
      socketRef.current?.off('participant:paused', callback)
    }
  }

  // Participant resumed event
  const onParticipantResumed = (callback: () => void) => {
    socketRef.current?.on('participant:resumed', callback)
    return () => {
      socketRef.current?.off('participant:resumed', callback)
    }
  }

  // Guess result event
  const onGuessResult = (callback: (data: any) => void) => {
    socketRef.current?.on('guess:result', callback)
    return () => {
      socketRef.current?.off('guess:result', callback)
    }
  }

  // Error event
  const onError = (callback: (data: any) => void) => {
    socketRef.current?.on('error', callback)
    return () => {
      socketRef.current?.off('error', callback)
    }
  }

  // Emit ready signal
  const emitReady = () => {
    socketRef.current?.emit('participant:ready')
  }

  // Submit guess
  const submitGuess = (guessData: {
    roundId: string
    guessLatitude: number
    guessLongitude: number
    timeSeconds: number
  }) => {
    socketRef.current?.emit('guess:submit', guessData)
  }

  return {
    ...data,
    socket: socketRef.current,
    onTournamentStarted,
    onTournamentPaused,
    onTournamentResumed,
    onTournamentEnded,
    onParticipantPaused,
    onParticipantResumed,
    onGuessResult,
    onError,
    emitReady,
    submitGuess
  }
}
