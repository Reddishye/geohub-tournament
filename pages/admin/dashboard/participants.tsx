import { useState, useEffect } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
import { Button, Input } from '@components/system'
import { PageType } from '@types'
import { showToast } from '@utils/helpers'
import styled from 'styled-components'

const ParticipantsContainer = styled.div`
  .actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;

    .search-export {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex: 1;

      .search-input {
        max-width: 400px;
      }
    }
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

          td {
            padding: 1rem;
            color: var(--color-text);

            .participant-id {
              font-family: monospace;
              font-size: 0.875rem;
              color: var(--color-text-secondary);
            }

            .notes {
              max-width: 300px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
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

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;

    button {
      padding: 0.5rem 1rem;
    }

    span {
      color: var(--color-text);
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--color-text-secondary);
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background-color: var(--color-panel);
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;

  h2 {
    margin-bottom: 1.5rem;
    color: var(--color-text);
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--color-text);
      font-weight: 500;
    }

    textarea {
      width: 100%;
      min-height: 100px;
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background-color: var(--background);
      color: var(--color-text);
      font-family: inherit;
      resize: vertical;
    }
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;

    button {
      padding: 0.75rem 1.5rem;
    }
  }
`

type Participant = {
  _id: string
  participantId: string
  name: string
  surname: string
  notes?: string
  createdAt: string
}

const ParticipantsPage: PageType = () => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    notes: ''
  })

  useEffect(() => {
    fetchParticipants()
  }, [search, page])

  const fetchParticipants = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search })
      })

      const res = await fetch(`/api/admin/participants?${params}`)
      const data = await res.json()

      if (res.ok) {
        setParticipants(data.participants || [])
        setTotalPages(data.totalPages || 1)
      } else {
        showToast('error', data.error || 'Failed to load participants')
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      showToast('error', 'Failed to load participants')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (participant?: Participant) => {
    if (participant) {
      setEditingParticipant(participant)
      setFormData({
        name: participant.name,
        surname: participant.surname,
        notes: participant.notes || ''
      })
    } else {
      setEditingParticipant(null)
      setFormData({ name: '', surname: '', notes: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingParticipant(null)
    setFormData({ name: '', surname: '', notes: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!formData.name.trim()) {
      showToast('error', 'Name is required')
      return
    }
    if (!formData.surname.trim()) {
      showToast('error', 'Surname is required')
      return
    }

    try {
      const url = editingParticipant
        ? `/api/admin/participants/${editingParticipant._id}`
        : '/api/admin/participants'

      const res = await fetch(url, {
        method: editingParticipant ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        showToast('success', editingParticipant ? 'Participant updated' : 'Participant created')
        handleCloseModal()
        fetchParticipants()
      } else {
        showToast('error', data.error || 'Operation failed')
      }
    } catch (error) {
      console.error('Error saving participant:', error)
      showToast('error', 'Failed to save participant')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this participant?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/participants/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        showToast('success', 'Participant deleted')
        fetchParticipants()
      } else {
        showToast('error', data.error || 'Failed to delete participant')
      }
    } catch (error) {
      console.error('Error deleting participant:', error)
      showToast('error', 'Failed to delete participant')
    }
  }

  const handleExport = async () => {
    try {
      window.open('/api/admin/participants/export', '_blank')
    } catch (error) {
      console.error('Error exporting:', error)
      showToast('error', 'Failed to export participants')
    }
  }

  return (
    <AdminLayout title="Participants Management">
      <ParticipantsContainer>
        <div className="actions-bar">
          <div className="search-export">
            <div className="search-input">
              <Input
                id="search"
                type="text"
                placeholder="Search by name, surname or ID..."
                value={search}
                callback={setSearch}
              />
            </div>
            <Button variant="solidGray" onClick={handleExport}>
              Export CSV
            </Button>
          </div>
          <Button onClick={() => handleOpenModal()}>
            Add Participant
          </Button>
        </div>

        {loading ? (
          <div className="empty-state">Loading participants...</div>
        ) : participants.length === 0 ? (
          <div className="empty-state">
            {search ? 'No participants found matching your search.' : 'No participants yet. Click &quot;Add Participant&quot; to create one.'}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Participant ID</th>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Notes</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <span className="participant-id">{p.participantId}</span>
                      </td>
                      <td>{p.name}</td>
                      <td>{p.surname}</td>
                      <td>
                        <span className="notes">{p.notes || '-'}</span>
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="actions">
                          <Button
                            size="sm"
                            variant="solidGray"
                            onClick={() => handleOpenModal(p)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destroy"
                            onClick={() => handleDelete(p._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span>Page {page} of {totalPages}</span>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {showModal && (
          <ModalOverlay onClick={handleCloseModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <h2>{editingParticipant ? 'Edit Participant' : 'Add Participant'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    callback={(val) => setFormData({ ...formData, name: val })}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="surname">Surname *</label>
                  <Input
                    id="surname"
                    type="text"
                    value={formData.surname}
                    callback={(val) => setFormData({ ...formData, surname: val })}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes (optional)</label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    maxLength={500}
                    placeholder="Additional notes about the participant..."
                  />
                </div>

                <div className="modal-actions">
                  <Button
                    type="button"
                    variant="solidGray"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingParticipant ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </ParticipantsContainer>
    </AdminLayout>
  )
}

ParticipantsPage.noNav = true

export default ParticipantsPage
