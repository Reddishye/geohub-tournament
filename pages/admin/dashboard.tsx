import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
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

    // Redirect to users page by default
    router.replace('/admin/dashboard/users')
  }, [session, status, router])

  return null
}

AdminDashboard.noNav = true

export default AdminDashboard
