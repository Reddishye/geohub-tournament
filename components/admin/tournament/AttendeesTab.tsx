import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`

const ParticipantCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`

const ParticipantName = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
    switch (props.status) {
      case 'CONNECTED':
        return '#d1fae5'
      case 'PLAYING':
        return '#bfdbfe'
      case 'PAUSED':
        return '#fed7aa'
      case 'FINISHED':
        return '#e0e7ff'
      default:
        return '#e5e7eb'
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'CONNECTED':
        return '#065f46'
      case 'PLAYING':
        return '#1e40af'
      case 'PAUSED':
        return '#9a3412'
      case 'FINISHED':
        return '#4338ca'
      default:
        return '#374151'
    }
  }};
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
`

const InfoLabel = styled.span`
  color: #6b7280;
`

const InfoValue = styled.span`
  color: #111827;
  font-weight: 600;
`

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  font-size: 1.125rem;
  font-style: italic;
`

interface AttendeesTabProps {
  tournamentId: string
  socket: any
}

export default function AttendeesTab({ tournamentId, socket }: AttendeesTabProps) {
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParticipants()
  }, [tournamentId])

  // Listen for real-time updates
  useEffect(() => {
    if (!socket.connected) return

    const cleanupStatus = socket.onParticipantStatusChanged((data: any) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p._id === data.participantId || p.id === data.participantId
            ? { ...p, ...data }
            : p
        )
      )
    })

    const cleanupConnected = socket.onParticipantConnected((data: any) => {
      fetchParticipants() // Refresh to get latest connection status
    })

    const cleanupDisconnected = socket.onParticipantDisconnected((data: any) => {
      fetchParticipants() // Refresh to get latest connection status
    })

    return () => {
      cleanupStatus()
      cleanupConnected()
      cleanupDisconnected()
    }
  }, [socket.connected, socket])

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`/api/admin/tournaments/${tournamentId}/participants`)
      if (res.ok) {
        const data = await res.json()
        setParticipants(data)
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const pauseParticipant = (participantId: string, name: string) => {
    const reason = prompt(`Pause ${name}? Enter reason (optional):`)
    if (reason !== null) {
      socket.pauseParticipant({
        tournamentId,
        participantId,
        reason: reason || 'Paused by gamemaster'
      })
    }
  }

  const resumeParticipant = (participantId: string) => {
    socket.resumeParticipant({
      tournamentId,
      participantId
    })
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading participants...</div>
  }

  if (participants.length === 0) {
    return <EmptyState>No participants in this tournament</EmptyState>
  }

  return (
    <Grid>
      {participants.map((p) => (
        <ParticipantCard key={p._id || p.id}>
          <CardHeader>
            <ParticipantName>{p.name}</ParticipantName>
            <StatusBadge status={p.status || 'NOT_CONNECTED'}>
              {p.status || 'NOT_CONNECTED'}
            </StatusBadge>
          </CardHeader>

          <InfoRow>
            <InfoLabel>Access Code:</InfoLabel>
            <InfoValue style={{ fontFamily: 'monospace' }}>{p.accessCode}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Total Score:</InfoLabel>
            <InfoValue>{p.totalScore || 0}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Current Round:</InfoLabel>
            <InfoValue>{p.currentRound || 0}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Avg Distance:</InfoLabel>
            <InfoValue>{p.averageDistance ? p.averageDistance.toFixed(2) : 0} km</InfoValue>
          </InfoRow>

          {p.connectedAt && (
            <InfoRow>
              <InfoLabel>Connected At:</InfoLabel>
              <InfoValue>{new Date(p.connectedAt).toLocaleTimeString()}</InfoValue>
            </InfoRow>
          )}

          {p.lastHeartbeat && (
            <InfoRow>
              <InfoLabel>Last Heartbeat:</InfoLabel>
              <InfoValue>{new Date(p.lastHeartbeat).toLocaleTimeString()}</InfoValue>
            </InfoRow>
          )}

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            {p.isPaused ? (
              <>
                <ActionButton onClick={() => resumeParticipant(p._id || p.id)}>
                  Resume
                </ActionButton>
                {p.pauseReason && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#f59e0b' }}>
                    Paused: {p.pauseReason}
                  </div>
                )}
              </>
            ) : (
              <ActionButton onClick={() => pauseParticipant(p._id || p.id, p.name)}>
                Pause
              </ActionButton>
            )}
          </div>
        </ParticipantCard>
      ))}
    </Grid>
  )
}
