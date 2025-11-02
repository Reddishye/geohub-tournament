import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AppLogo } from '@components/AppLogo'
import { Button, Input } from '@components/system'
import StyledAuthPage from '@styles/AuthPage.Styled'
import { PageType } from '@types'
import { showToast } from '@utils/helpers'

const AdminSetupPage: PageType = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showBtnSpinner, setShowBtnSpinner] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    // Check if setup is required
    const checkSetup = async () => {
      try {
        const res = await fetch('/api/admin/check-setup')
        const data = await res.json()
        
        if (!data.setupRequired) {
          // Setup already completed, redirect to admin login
          showToast('error', 'Setup already completed')
          router.replace('/admin')
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking setup:', error)
        setLoading(false)
      }
    }

    checkSetup()
  }, [router])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username) {
      return showToast('error', 'Please enter a username')
    }

    if (!email) {
      return showToast('error', 'Please enter an email address')
    }

    if (!password) {
      return showToast('error', 'Please enter a password')
    }

    if (!confirmPassword) {
      return showToast('error', 'Please confirm your password')
    }

    if (password !== confirmPassword) {
      return showToast('error', 'Passwords do not match')
    }

    setShowBtnSpinner(true)

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast('error', data.error || 'Setup failed')
        setShowBtnSpinner(false)
        return
      }

      showToast('success', 'Admin account created! Redirecting to login...')
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (error) {
      console.error('Setup error:', error)
      showToast('error', 'An error occurred during setup')
      setShowBtnSpinner(false)
    }
  }

  if (loading) {
    return (
      <StyledAuthPage>
        <div className="logoWrapper">
          <AppLogo />
        </div>
        <section className="authContainer">
          <h1 className="title">Loading...</h1>
        </section>
      </StyledAuthPage>
    )
  }

  return (
    <StyledAuthPage>
      <div className="logoWrapper">
        <AppLogo />
      </div>

      <section className="authContainer">
        <h1 className="title">Admin Setup</h1>
        <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Create the first administrator account
        </p>

        <form className="form-container" onSubmit={(e) => handleSetup(e)}>
          <div className="inputGroup">
            <Input
              id="username"
              type="text"
              label="Username"
              value={username}
              callback={setUsername}
              autoComplete="username"
              autoFocus
              placeholder="3-20 alphanumeric characters"
            />
          </div>

          <div className="inputGroup">
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={email}
              callback={setEmail}
              autoComplete="email"
              placeholder="admin@example.com"
            />
          </div>

          <div className="inputGroup">
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              callback={setPassword}
              autoComplete="new-password"
              placeholder="Min 8 chars with uppercase, lowercase & numbers"
            />
          </div>

          <div className="inputGroup">
            <Input
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              callback={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />
          </div>

          <Button isLoading={showBtnSpinner} width="100%">
            Create Admin Account
          </Button>
        </form>
      </section>
    </StyledAuthPage>
  )
}

AdminSetupPage.noNav = true

export default AdminSetupPage
