import { useState, useEffect } from 'react'
import styled from 'styled-components'

const ScoreboardCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #111827;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const RefreshIndicator = styled.span<{ active: boolean }>`
  font-size: 0.875rem;
  color: ${(props) => (props.active ? '#10b981' : '#6b7280')};
  font-weight: 400;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
`

const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
`

const Rank = styled.span<{ rank: number }>`
  font-weight: 700;
  font-size: 1.125rem;
  color: ${(props) => {
    if (props.rank === 1) return '#f59e0b'
    if (props.rank === 2) return '#9ca3af'
    if (props.rank === 3) return '#cd7f32'
    return '#374151'
  }};

  &::before {
    content: '${(props) => {
      if (props.rank === 1) return '🥇 '
      if (props.rank === 2) return '🥈 '
      if (props.rank === 3) return '🥉 '
      return ''
    }}';
  }
`

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
    switch (props.status) {
      case 'PLAYING':
        return '#d1fae5'
      case 'PAUSED':
        return '#fed7aa'
      case 'WAITING':
        return '#e5e7eb'
      case 'FINISHED':
        return '#dbeafe'
      default:
        return '#f3f4f6'
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'PLAYING':
        return '#065f46'
      case 'PAUSED':
        return '#9a3412'
      case 'WAITING':
        return '#374151'
      case 'FINISHED':
        return '#1e40af'
      default:
        return '#6b7280'
    }
  }};
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-style: italic;
`

const ExportButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`

interface LiveScoreboardProps {
  tournamentId: string
  socket: any
}

export default function LiveScoreboard({ tournamentId, socket }: LiveScoreboardProps) {
  const [scoreboard, setScoreboard] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Fetch initial scoreboard
    fetchScoreboard()

    // Set up auto-refresh every 2 seconds
    const interval = setInterval(() => {
      fetchScoreboard()
    }, 2000)

    return () => clearInterval(interval)
  }, [tournamentId])

  // Listen for scoreboard updates via WebSocket
  useEffect(() => {
    if (!socket.connected) return

    const cleanup = socket.onScoreboardUpdated((data: any) => {
      setScoreboard(data.scoreboard)
      setLastUpdate(new Date())
      setIsRefreshing(true)
      setTimeout(() => setIsRefreshing(false), 500)
    })

    return cleanup
  }, [socket.connected, socket])

  const fetchScoreboard = async () => {
    try {
      const res = await fetch(`/api/admin/tournaments/${tournamentId}/scoreboard`)
      if (res.ok) {
        const data = await res.json()
        setScoreboard(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch scoreboard:', error)
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Rank',
      'Participant',
      'Total Score',
      'Avg Distance (km)',
      'Current Round',
      'Status'
    ]
    const rows = scoreboard.map((entry, index) => [
      index + 1,
      entry.name,
      entry.totalScore,
      entry.averageDistance.toFixed(2),
      entry.currentRound,
      entry.status
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scoreboard-${tournamentId}-${Date.now()}.csv`
    a.click()
  }

  return (
    <ScoreboardCard>
      <Title>
        Live Scoreboard
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <RefreshIndicator active={isRefreshing}>
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
          </RefreshIndicator>
          <ExportButton onClick={exportToCSV}>Export CSV</ExportButton>
        </div>
      </Title>

      {scoreboard.length === 0 ? (
        <EmptyState>No participants have started yet</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Rank</Th>
              <Th>Participant</Th>
              <Th>Current Round</Th>
              <Th>Total Score</Th>
              <Th>Avg Distance (km)</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {scoreboard.map((entry, index) => (
              <tr key={entry.participantId}>
                <Td>
                  <Rank rank={index + 1}>{index + 1}</Rank>
                </Td>
                <Td style={{ fontWeight: 600 }}>{entry.name}</Td>
                <Td>
                  {entry.currentRound} / {entry.totalRounds || '?'}
                </Td>
                <Td style={{ fontWeight: 700, color: '#3b82f6' }}>
                  {entry.totalScore.toLocaleString()}
                </Td>
                <Td>{entry.averageDistance.toFixed(2)}</Td>
                <Td>
                  <StatusBadge status={entry.status}>{entry.status}</StatusBadge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ScoreboardCard>
  )
}
