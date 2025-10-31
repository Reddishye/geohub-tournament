import { useState, useEffect } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
import { Button, Input } from '@components/system'
import { PageType } from '@types'
import { showToast } from '@utils/helpers'
import styled from 'styled-components'
import { useRouter } from 'next/router'

const TournamentsContainer = styled.div`
  .actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .table-container {
    background-color: var(--color-panel);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color);

    table {
      width: 100%;
      border-collapse: collapse;

      thead {
        background-color: var(--hover-overlay);

        th {
          text-align: left;
          padding: 1rem;
          font-weight: 600;
          color: var(--color-text);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }

      tbody {
        tr {
          border-top: 1px solid var(--border-color);
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--hover-overlay);
          }

          &.finished {
            opacity: 0.5;
            color: var(--color-text-secondary);
          }

          &.cancelled {
            text-decoration: line-through;
            color: var(--red-500);
          }

          td {
            padding: 1rem;
            color: var(--color-text);

            .status-badge {
              display: inline-block;
              padding: 0.25rem 0.75rem;
              border-radius: 12px;
              font-size: 0.75rem;
              font-weight: 600;

              &.waiting {
                background-color: var(--blue-100);
                color: var(--blue-600);
              }

              &.in_progress {
                background-color: var(--green-100);
                color: var(--green-600);
              }

              &.finished {
                background-color: var(--gray-100);
                color: var(--gray-600);
              }

              &.cancelled {
                background-color: var(--red-100);
                color: var(--red-600);
              }
            }

            .gamemode-badge {
              font-size: 0.875rem;
              color: var(--color-text-secondary);
            }

            .actions {
              display: flex;
              gap: 0.5rem;

              button {
                padding: 0.375rem 0.75rem;
                font-size: 0.875rem;
              }
            }
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--color-text-secondary);
  }
`

type Tournament = {
  _id: string
  name: string
  date: string
  fairnessMode: string
  mapPool: string
  numberOfRounds: number
  status: string
  participantCount?: number
}

const TournamentsPage: PageType = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tournaments')
      const data = await res.json()

      if (res.ok) {
        setTournaments(data.tournaments || [])
      } else {
        showToast('error', data.error || 'Failed to load tournaments')
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      showToast('error', 'Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        showToast('success', 'Tournament deleted')
        fetchTournaments()
      } else {
        showToast('error', data.error || 'Failed to delete tournament')
      }
    } catch (error) {
      console.error('Error deleting tournament:', error)
      showToast('error', 'Failed to delete tournament')
    }
  }

  const formatGamemode = (t: Tournament) => {
    const fairness = {
      total_random: 'Total Random',
      sync_random: 'Sync Random',
      synchronized: 'Synchronized'
    }[t.fairnessMode] || t.fairnessMode

    return `${fairness} • ${t.mapPool} • ${t.numberOfRounds}R`
  }

  const formatStatus = (status: string) => {
    return status.toLowerCase().replace('_', ' ')
  }

  const getStatusClass = (status: string) => {
    return status.toLowerCase().replace('_', '_')
  }

  return (
    <AdminLayout title="Tournaments Management">
      <TournamentsContainer>
        <div className="actions-bar">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Tournaments</h2>
          <Button onClick={() => router.push('/admin/tournaments/create')}>
            Create New Tournament
          </Button>
        </div>

        {loading ? (
          <div className="empty-state">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="empty-state">
            No tournaments yet. Click &quot;Create New Tournament&quot; to get started.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Participants</th>
                  <th>Gamemode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t) => (
                  <tr
                    key={t._id}
                    className={t.status === 'FINISHED' ? 'finished' : t.status === 'CANCELLED' ? 'cancelled' : ''}
                  >
                    <td>{t.name}</td>
                    <td>
                      {new Date(t.date).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>{t.participantCount || 0} selected</td>
                    <td>
                      <span className="gamemode-badge">{formatGamemode(t)}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(t.status)}`}>
                        {formatStatus(t.status)}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        {t.status === 'WAITING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/admin/tournaments/${t._id}/manage`)}
                            >
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="solidGray"
                              onClick={() => router.push(`/admin/tournaments/${t._id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destroy"
                              onClick={() => handleDelete(t._id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {(t.status === 'IN_PROGRESS' || t.status === 'PAUSED') && (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/admin/tournaments/${t._id}/manage`)}
                          >
                            Manage
                          </Button>
                        )}
                        {t.status === 'FINISHED' && (
                          <Button
                            size="sm"
                            variant="solidGray"
                            onClick={() => router.push(`/admin/tournaments/${t._id}/results`)}
                          >
                            View Results
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TournamentsContainer>
    </AdminLayout>
  )
}

TournamentsPage.noNav = true

export default TournamentsPage
