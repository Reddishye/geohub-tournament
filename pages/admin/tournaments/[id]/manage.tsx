import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import AdminLayout from '@components/admin/AdminLayout'
import GeneralTab from '@components/admin/tournament/GeneralTab'
import AttendeesTab from '@components/admin/tournament/AttendeesTab'
import { useAdminSocket } from '@hooks/useAdminSocket'
import styled from 'styled-components'

const TabContainer = styled.div`
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
  display: flex;
  gap: 0;
`

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 2rem;
  background: ${(props) => (props.active ? '#fff' : 'transparent')};
  border: none;
  border-bottom: 3px solid ${(props) => (props.active ? '#3b82f6' : 'transparent')};
  color: ${(props) => (props.active ? '#3b82f6' : '#6b7280')};
  font-weight: ${(props) => (props.active ? '600' : '400')};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #3b82f6;
    background: #f9fafb;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  font-size: 1.125rem;
  color: #6b7280;
`

const ErrorContainer = styled.div`
  padding: 2rem;
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 0.5rem;
  color: #991b1b;
  margin: 2rem 0;
`

export default function ManageTournament() {
  const router = useRouter()
  const { id } = router.query
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('general')
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const socket = useAdminSocket(id as string)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
    }
  }, [status, router])

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(null)

    fetch(`/api/admin/tournaments/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load tournament')
        }
        return res.json()
      })
      .then((data) => {
        setTournament(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  // Listen for tournament status changes via WebSocket
  useEffect(() => {
    if (!socket.connected) return

    const cleanup = socket.onTournamentStatusChanged((data) => {
      if (data.tournamentId === id) {
        setTournament((prev: any) => ({
          ...prev,
          status: data.status
        }))
      }
    })

    return cleanup
  }, [socket.connected, id, socket])

  if (status === 'loading' || loading) {
    return (
      <AdminLayout title="Manage Tournament">
        <LoadingContainer>Loading tournament...</LoadingContainer>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Manage Tournament">
        <ErrorContainer>
          <strong>Error:</strong> {error}
        </ErrorContainer>
      </AdminLayout>
    )
  }

  if (!tournament) {
    return (
      <AdminLayout title="Manage Tournament">
        <ErrorContainer>Tournament not found</ErrorContainer>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Manage: ${tournament.name}`}>
      <TabContainer>
        <Tab active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
          General
        </Tab>
        <Tab active={activeTab === 'attendees'} onClick={() => setActiveTab('attendees')}>
          Attendees
        </Tab>
      </TabContainer>

      {activeTab === 'general' && <GeneralTab tournament={tournament} socket={socket} />}
      {activeTab === 'attendees' && <AttendeesTab tournamentId={id as string} socket={socket} />}
    </AdminLayout>
  )
}
