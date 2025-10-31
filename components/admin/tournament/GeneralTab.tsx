import { useState, useEffect } from 'react'
import styled from 'styled-components'
import LiveScoreboard from './LiveScoreboard'

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div<{ span?: number }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  grid-column: span ${(props) => props.span || 1};
`

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
`

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.25rem;
  background: ${(props) => {
    switch (props.status) {
      case 'WAITING':
        return '#fef3c7'
      case 'IN_PROGRESS':
        return '#d1fae5'
      case 'PAUSED':
        return '#fed7aa'
      case 'FINISHED':
        return '#dbeafe'
      case 'CANCELLED':
        return '#fee2e2'
      default:
        return '#f3f4f6'
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'WAITING':
        return '#92400e'
      case 'IN_PROGRESS':
        return '#065f46'
      case 'PAUSED':
        return '#9a3412'
      case 'FINISHED':
        return '#1e40af'
      case 'CANCELLED':
        return '#991b1b'
      default:
        return '#374151'
    }
  }};
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'warning' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;

  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #10b981;
          color: white;
          &:hover { background: #059669; }
        `
      case 'warning':
        return `
          background: #f59e0b;
          color: white;
          &:hover { background: #d97706; }
        `
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `
      default:
        return `
          background: #6b7280;
          color: white;
          &:hover { background: #4b5563; }
        `
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`

const InfoLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`

const InfoValue = styled.span`
  color: #111827;
  font-weight: 600;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const SaveStatus = styled.div<{ show: boolean }>`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #10b981;
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: opacity 0.3s;
`

const CodesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`

const TableHeader = styled.th`
  text-align: left;
  padding: 0.75rem;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
`

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`

const CopyButton = styled.button`
  padding: 0.25rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`

const ActionButton = styled(CopyButton)`
  background: #6b7280;
  margin-left: 0.5rem;

  &:hover {
    background: #4b5563;
  }
`

interface GeneralTabProps {
  tournament: any
  socket: any
}

export default function GeneralTab({ tournament, socket }: GeneralTabProps) {
  const [notes, setNotes] = useState(tournament?.notes || '')
  const [participants, setParticipants] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [connectedCount, setConnectedCount] = useState(0)

  useEffect(() => {
    if (!tournament) return

    // Fetch participants with access codes
    fetch(`/api/admin/tournaments/${tournament._id || tournament.id}/participants`)
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data)
        setConnectedCount(data.filter((p: any) => p.status === 'CONNECTED').length)
      })
      .catch(console.error)
  }, [tournament])

  // Listen for participant connection changes
  useEffect(() => {
    if (!socket.connected) return

    const cleanupConnected = socket.onParticipantConnected(() => {
      setConnectedCount((prev) => prev + 1)
    })

    const cleanupDisconnected = socket.onParticipantDisconnected(() => {
      setConnectedCount((prev) => Math.max(0, prev - 1))
    })

    return () => {
      cleanupConnected()
      cleanupDisconnected()
    }
  }, [socket.connected, socket])

  const saveNotes = async () => {
    if (saving) return

    setSaving(true)
    try {
      await fetch(`/api/admin/tournaments/${tournament._id || tournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save notes:', error)
    } finally {
      setSaving(false)
    }
  }

  // Auto-save notes after 5 seconds of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== tournament?.notes) {
        saveNotes()
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [notes])

  const handleStart = () => {
    if (confirm('Start this tournament? All connected participants will be notified.')) {
      socket.startTournament(tournament._id || tournament.id)
    }
  }

  const handlePause = () => {
    if (confirm('Pause this tournament? All participants will be paused.')) {
      socket.pauseTournament(tournament._id || tournament.id)
    }
  }

  const handleResume = () => {
    socket.resumeTournament(tournament._id || tournament.id)
  }

  const handleEnd = () => {
    if (
      confirm(
        'End this tournament? This will finalize all scores and cannot be undone.'
      )
    ) {
      socket.endTournament(tournament._id || tournament.id)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const copyAllCodes = () => {
    const codes = participants.map((p) => `${p.name},${p.accessCode}`).join('\n')
    navigator.clipboard.writeText(codes)
  }

  const pauseParticipant = (participantId: string, name: string) => {
    const reason = prompt(`Pause ${name}? Enter reason (optional):`)
    if (reason !== null) {
      socket.pauseParticipant({
        tournamentId: tournament._id || tournament.id,
        participantId,
        reason: reason || 'Paused by gamemaster'
      })
    }
  }

  const resumeParticipant = (participantId: string) => {
    socket.resumeParticipant({
      tournamentId: tournament._id || tournament.id,
      participantId
    })
  }

  return (
    <>
      <BentoGrid>
        {/* Card 1: Tournament Controls */}
        <Card>
          <CardTitle>Tournament Controls</CardTitle>
          <div style={{ marginBottom: '1rem' }}>
            <StatusBadge status={tournament.status}>{tournament.status}</StatusBadge>
          </div>

          {tournament.status === 'WAITING' && (
            <Button variant="primary" onClick={handleStart}>
              Start Tournament
            </Button>
          )}

          {tournament.status === 'IN_PROGRESS' && (
            <>
              <Button variant="warning" onClick={handlePause}>
                Pause All
              </Button>
              <Button variant="danger" onClick={handleEnd}>
                End Tournament
              </Button>
            </>
          )}

          {tournament.status === 'PAUSED' && (
            <>
              <Button variant="primary" onClick={handleResume}>
                Resume All
              </Button>
              <Button variant="danger" onClick={handleEnd}>
                End Tournament
              </Button>
            </>
          )}

          {tournament.status === 'FINISHED' && (
            <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
              Tournament has ended
            </div>
          )}
        </Card>

        {/* Card 2: Tournament Info */}
        <Card>
          <CardTitle>Tournament Info</CardTitle>
          <InfoRow>
            <InfoLabel>Name:</InfoLabel>
            <InfoValue>{tournament.name}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Date:</InfoLabel>
            <InfoValue>
              {new Date(tournament.date).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Gamemode:</InfoLabel>
            <InfoValue>
              {tournament.fairnessMode} • {tournament.mapPool} • {tournament.numberOfRounds}R
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Connected:</InfoLabel>
            <InfoValue>
              {connectedCount} / {participants.length}
            </InfoValue>
          </InfoRow>
          {tournament.startedAt && (
            <InfoRow>
              <InfoLabel>Started:</InfoLabel>
              <InfoValue>{new Date(tournament.startedAt).toLocaleTimeString()}</InfoValue>
            </InfoRow>
          )}
        </Card>

        {/* Card 3: Notes */}
        <Card>
          <CardTitle>Gamemaster Notes</CardTitle>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this tournament..."
          />
          <SaveStatus show={showSaved}>✓ Saved</SaveStatus>
        </Card>

        {/* Card 4: Participant Access Codes */}
        <Card span={3}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <CardTitle style={{ margin: 0 }}>Participant Access Codes</CardTitle>
            <Button variant="secondary" onClick={copyAllCodes}>
              Copy All Codes
            </Button>
          </div>
          <CodesTable>
            <thead>
              <tr>
                <TableHeader>Participant</TableHeader>
                <TableHeader>Access Code</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p._id || p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>
                    <code style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                      {p.accessCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        color:
                          p.status === 'CONNECTED'
                            ? '#10b981'
                            : p.status === 'PLAYING'
                            ? '#3b82f6'
                            : '#6b7280'
                      }}
                    >
                      {p.status || 'NOT_CONNECTED'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CopyButton onClick={() => copyCode(p.accessCode)}>Copy</CopyButton>
                    {p.isPaused ? (
                      <ActionButton onClick={() => resumeParticipant(p._id || p.id)}>
                        Resume
                      </ActionButton>
                    ) : (
                      <ActionButton onClick={() => pauseParticipant(p._id || p.id, p.name)}>
                        Pause
                      </ActionButton>
                    )}
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </CodesTable>
        </Card>
      </BentoGrid>

      {/* Live Scoreboard */}
      <LiveScoreboard tournamentId={tournament._id || tournament.id} socket={socket} />
    </>
  )
}
