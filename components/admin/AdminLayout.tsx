import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'
import { 
  AdminLayoutContainer, 
  Sidebar, 
  NavItem, 
  MainContent, 
  Header,
  LogoutButton 
} from './AdminLayout.Styled'

type AdminLayoutProps = {
  children: ReactNode
  title: string
}

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const currentPath = router.pathname

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

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin' })
  }

  return (
    <AdminLayoutContainer>
      <Sidebar>
        <div className="logo">
          🏆 GeoHub Admin
        </div>

        <div className="nav-section">
          <div className="section-title">Management</div>
          
          <Link href="/admin/dashboard/users" passHref>
            <NavItem active={currentPath.includes('/users')}>
              <span className="icon">👥</span>
              <span>Users</span>
            </NavItem>
          </Link>

          <Link href="/admin/dashboard/participants" passHref>
            <NavItem active={currentPath.includes('/participants')}>
              <span className="icon">👤</span>
              <span>Participants</span>
            </NavItem>
          </Link>

          <Link href="/admin/dashboard/tournaments" passHref>
            <NavItem active={currentPath.includes('/tournaments')}>
              <span className="icon">🎮</span>
              <span>Tournaments</span>
            </NavItem>
          </Link>
        </div>
      </Sidebar>

      <MainContent>
        <Header>
          <h1>{title}</h1>
          <div className="user-info">
            <span className="user-name">{session.user?.name}</span>
            <div 
              className="user-avatar" 
              style={{ backgroundColor: session.user?.avatar?.color }}
            >
              {session.user?.avatar?.emoji}
            </div>
            <LogoutButton onClick={handleLogout}>
              Logout
            </LogoutButton>
          </div>
        </Header>

        {children}
      </MainContent>
    </AdminLayoutContainer>
  )
}
