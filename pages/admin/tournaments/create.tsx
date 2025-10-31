import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AdminLayout } from '@components/admin/AdminLayout'
import { Button, Input } from '@components/system'
import { PageType } from '@types'
import { showToast } from '@utils/helpers'
import styled from 'styled-components'

const FormContainer = styled.div`
  max-width: 800px;

  .form-section {
    background-color: var(--color-panel);
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 1px solid var(--border-color);

    h3 {
      margin-bottom: 1.5rem;
      color: var(--color-text);
      font-size: 1.25rem;
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-text);
        font-weight: 500;
      }

      select, textarea {
        width: 100%;
        padding: 0.75rem;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        background-color: var(--background);
        color: var(--color-text);
        font-family: inherit;
      }

      textarea {
        min-height: 100px;
        resize: vertical;
      }

      .description {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-top: 0.5rem;
      }
    }

    .participants-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.5rem;

      .participant-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--hover-overlay);
        }

        input[type="checkbox"] {
          margin-right: 1rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .participant-info {
          flex: 1;

          .name {
            color: var(--color-text);
            font-weight: 500;
          }

          .id {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
            font-family: monospace;
          }
        }
      }
    }

    .selected-count {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: var(--blue-100);
      color: var(--blue-600);
      border-radius: 6px;
      text-align: center;
      font-weight: 500;
    }
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;

    button {
      padding: 0.75rem 2rem;
    }
  }
`

type Participant = {
  _id: string
  participantId: string
  name: string
  surname: string
}

const fairnessModes = [
  {
    value: 'total_random',
    label: 'Total Randomization',
    description: 'Each participant gets completely different maps'
  },
  {
    value: 'sync_random',
    label: 'Synchronized Randomization',
    description: 'All participants get the same maps but in different order'
  },
  {
    value: 'synchronized',
    label: 'Fully Synchronized',
    description: 'All participants get the same maps in the same order'
  }
]

const mapPools = [
  { value: 'anywhere', label: 'Anywhere in the World' },
  { value: 'famous', label: 'Famous Places' },
  { value: 'urban', label: 'Urban Areas Only' },
  { value: 'rural', label: 'Rural Areas Only' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'americas', label: 'Americas' },
  { value: 'africa', label: 'Africa' },
  { value: 'oceania', label: 'Oceania' }
]

const CreateTournamentPage: PageType = () => {
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    fairnessMode: 'synchronized',
    mapPool: 'anywhere',
    numberOfRounds: 5,
    notes: ''
  })

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      const res = await fetch('/api/admin/participants?limit=1000')
      const data = await res.json()

      if (res.ok) {
        setParticipants(data.participants || [])
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showToast('error', 'Tournament name is required')
      return
    }

    if (!formData.date) {
      showToast('error', 'Tournament date is required')
      return
    }

    if (selectedParticipants.length === 0) {
      showToast('error', 'Please select at least one participant')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          participantIds: selectedParticipants
        })
      })

      const data = await res.json()

      if (res.ok) {
        showToast('success', 'Tournament created successfully')
        router.push('/admin/dashboard/tournaments')
      } else {
        showToast('error', data.error || 'Failed to create tournament')
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
      showToast('error', 'Failed to create tournament')
    } finally {
      setLoading(false)
    }
  }

  const selectedMode = fairnessModes.find(m => m.value === formData.fairnessMode)
  const selectedPool = mapPools.find(p => p.value === formData.mapPool)

  return (
    <AdminLayout title="Create Tournament">
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Tournament Name *</label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                callback={(val) => setFormData({ ...formData, name: val })}
                maxLength={100}
                placeholder="e.g., World Championship 2024"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date & Time *</label>
              <input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                maxLength={1000}
                placeholder="Additional information about this tournament..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Participants Selection</h3>
            
            <div className="participants-list">
              {participants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                  No participants available. Create participants first.
                </div>
              ) : (
                participants.map((p) => (
                  <div key={p._id} className="participant-item">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(p._id)}
                      onChange={() => toggleParticipant(p._id)}
                    />
                    <div className="participant-info">
                      <div className="name">{p.name} {p.surname}</div>
                      <div className="id">{p.participantId}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedParticipants.length > 0 && (
              <div className="selected-count">
                {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Gamemode Configuration</h3>
            
            <div className="form-group">
              <label htmlFor="fairnessMode">Fairness Mode *</label>
              <select
                id="fairnessMode"
                value={formData.fairnessMode}
                onChange={(e) => setFormData({ ...formData, fairnessMode: e.target.value })}
              >
                {fairnessModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
              {selectedMode && (
                <div className="description">{selectedMode.description}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="mapPool">Map Pool *</label>
              <select
                id="mapPool"
                value={formData.mapPool}
                onChange={(e) => setFormData({ ...formData, mapPool: e.target.value })}
              >
                {mapPools.map((pool) => (
                  <option key={pool.value} value={pool.value}>
                    {pool.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="numberOfRounds">Number of Rounds *</label>
              <input
                id="numberOfRounds"
                type="number"
                min="1"
                max="50"
                value={formData.numberOfRounds}
                onChange={(e) => setFormData({ ...formData, numberOfRounds: parseInt(e.target.value) || 1 })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--color-text)'
                }}
              />
              <div className="description">Between 1 and 50 rounds</div>
            </div>

            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--blue-100)', 
              borderRadius: '6px',
              color: 'var(--blue-600)',
              fontWeight: 500
            }}>
              {selectedMode?.label} • {selectedPool?.label} • {formData.numberOfRounds} Rounds
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="solidGray"
              onClick={() => router.push('/admin/dashboard/tournaments')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Create Tournament
            </Button>
          </div>
        </form>
      </FormContainer>
    </AdminLayout>
  )
}

CreateTournamentPage.noNav = true

export default CreateTournamentPage
