import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PageType } from '@types'

const AdminDashboard: PageType = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // Redirect to admin login if not authenticated
    if (!session) {
      router.replace('/admin')
      return
    }

    // Redirect to home if not admin
    if (session.user?.role !== 'ADMIN' && !session.user?.isAdmin) {
      router.replace('/')
      return
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h2>Loading...</h2>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user?.name}!</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Tournament Management System</h2>
        <p>Coming soon: Users, Participants, and Tournaments sections</p>
      </div>
    </div>
  )
}

AdminDashboard.noNav = true

export default AdminDashboard
