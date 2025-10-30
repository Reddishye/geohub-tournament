import { useState, useEffect } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
import { Button } from '@components/system'
import { PageType } from '@types'
import { showToast } from '@utils/helpers'
import styled from 'styled-components'

const UsersContainer = styled.div`
  .actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }
  }

  .users-table {
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

            .role-badge {
              display: inline-block;
              padding: 0.25rem 0.75rem;
              background-color: var(--blue-500);
              color: white;
              border-radius: 12px;
              font-size: 0.75rem;
              font-weight: 600;
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

type User = {
  _id: string
  name: string
  email: string
  role?: string
  createdAt: string
}

const UsersPage: PageType = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users || [])
      } else {
        showToast('error', data.error || 'Failed to load users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showToast('error', 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        showToast('success', 'User deleted successfully')
        fetchUsers() // Refresh list
      } else {
        showToast('error', data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showToast('error', 'Failed to delete user')
    }
  }

  return (
    <AdminLayout title="Users Management">
      <UsersContainer>
        <div className="actions-bar">
          <h2>Admin Users</h2>
          <Button onClick={() => showToast('error', 'Coming soon')}>
            Add User
          </Button>
        </div>

        {loading ? (
          <div className="empty-state">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            No users found. Click &quot;Add User&quot; to create one.
          </div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="role-badge">
                        {user.role || 'ADMIN'}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="actions">
                        <Button 
                          size="sm" 
                          variant="solidGray"
                          onClick={() => showToast('error', 'Coming soon')}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destroy"
                          onClick={() => handleDelete(user._id)}
                          disabled={users.length === 1}
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
        )}
      </UsersContainer>
    </AdminLayout>
  )
}

UsersPage.noNav = true

export default UsersPage
