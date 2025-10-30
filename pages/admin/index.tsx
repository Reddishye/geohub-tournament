import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AppLogo } from '@components/AppLogo'
import { Button, Input } from '@components/system'
import StyledAuthPage from '@styles/AuthPage.Styled'
import { PageType } from '@types'
import { showToast } from '@utils/helpers'

const AdminLoginPage: PageType = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showBtnSpinner, setShowBtnSpinner] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)

  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    // If user is logged in and is admin, redirect to admin panel
    if (session?.user?.role === 'ADMIN' || session?.user?.isAdmin) {
      router.replace('/admin/dashboard')
    }
  }, [session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      return showToast('error', 'Please enter your email address')
    }

    if (!password) {
      return showToast('error', 'Please enter your password')
    }

    // Simple client-side rate limiting (5 attempts)
    if (attemptCount >= 5) {
      return showToast('error', 'Too many login attempts. Please wait 15 minutes.')
    }

    setShowBtnSpinner(true)

    const res = await signIn('credentials', { 
      redirect: false, 
      email, 
      password 
    })

    if (!res || res.error) {
      showToast('error', 'Incorrect email or password')
      setShowBtnSpinner(false)
      setAttemptCount(prev => prev + 1)
      
      // Reset attempt count after 15 minutes
      setTimeout(() => {
        setAttemptCount(0)
      }, 15 * 60 * 1000)
    } else {
      // Success - NextAuth will handle redirect through useEffect
      showToast('success', 'Login successful!')
    }
  }

  return (
    <StyledAuthPage>
      <div className="logoWrapper">
        <AppLogo />
      </div>

      <section className="authContainer">
        <h1 className="title">Admin Login</h1>
        <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Access the tournament management panel
        </p>

        <form className="form-container" onSubmit={(e) => handleLogin(e)}>
          <div className="inputGroup">
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={email}
              callback={setEmail}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="inputGroup">
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              callback={setPassword}
              autoComplete="current-password"
            />
          </div>

          {attemptCount >= 3 && attemptCount < 5 && (
            <p style={{ color: 'var(--red-500)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Warning: {5 - attemptCount} attempts remaining
            </p>
          )}

          <Button 
            isLoading={showBtnSpinner} 
            width="100%"
            disabled={attemptCount >= 5}
          >
            {attemptCount >= 5 ? 'Too Many Attempts' : 'Login'}
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/">
            <a style={{ color: 'var(--blue-500)', fontSize: '0.875rem' }}>
              ← Back to Home
            </a>
          </Link>
        </div>
      </section>
    </StyledAuthPage>
  )
}

AdminLoginPage.noNav = true

export default AdminLoginPage
