import React, { useState } from 'react'
import {
  TextInput,
  PasswordInput,
  Box,
} from '@mantine/core'
import {
  IconUser,
  IconMail,
  IconLock,
  IconArrowRight,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react'
import { GoogleIcon, GitHubIcon } from './SocialButtons'
import { IsometricCube } from './IsometricCube'
import { OAuthModal } from './OAuthModal'
import { registerApi } from '../services/authApi'

export function RegisterForm({
  onNavigateLogin,
  onRegisterSuccess,
  onLoginSuccess,
}: {
  onNavigateLogin: () => void
  onRegisterSuccess?: (res?: any) => void
  onLoginSuccess?: (session?: any) => void
}) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  // OAuth SSO state
  const [oauthModalOpen, setOauthModalOpen] = useState(false)
  const [oauthProvider, setOauthProvider] = useState('GOOGLE')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessInfo(null)

    if (!email) {
      setError('Email address is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const result = await registerApi({
        email,
        username: username || email.split('@')[0],
        password,
      })
      setSuccessInfo('Account created successfully! Redirecting to login...')
      if (onRegisterSuccess) {
        setTimeout(() => {
          onRegisterSuccess(result)
        }, 1200)
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header: Logo + Version */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Box className="tech-logo-box">R&amp;D</Box>
        <span className="tech-version-tag">v 1.0.0</span>
      </Box>

      {/* Kicker + Headline with Isometric Cube */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <Box style={{ flex: 1, paddingRight: 10 }}>
          <Box className="tech-kicker" style={{ marginBottom: 8 }}>
            02 / GET STARTED
          </Box>
          <h1 className="tech-headline">
            CREATE AN <br />
            ACCOUNT<span className="tech-headline-dot">.</span>
          </h1>
          <p className="tech-subtitle" style={{ marginTop: 8 }}>
            Join our R&amp;D engineering workspace and start building.
          </p>
        </Box>

        {/* Isometric Cube Graphic */}
        <Box style={{ flexShrink: 0, marginTop: -6 }}>
          <IsometricCube size={96} />
        </Box>
      </Box>

      {/* Error / Alert feedback */}
      {error && (
        <Box
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.82rem',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconAlertCircle size={16} />
          <span>{error}</span>
        </Box>
      )}

      {successInfo && (
        <Box
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.82rem',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconCheck size={16} />
          <span>{successInfo}</span>
        </Box>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* USERNAME Field */}
        <Box>
          <label className="tech-mono-label" htmlFor="reg-username">
            USERNAME
          </label>
          <TextInput
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            placeholder="e.g. alex_dev"
            leftSection={<IconUser size={16} color="#6b7280" />}
            styles={{
              input: {
                height: 44,
                borderRadius: 9,
                borderColor: '#e5e7eb',
                fontSize: '0.82rem',
              },
            }}
          />
        </Box>

        {/* EMAIL Field */}
        <Box>
          <label className="tech-mono-label" htmlFor="reg-email">
            WORK EMAIL
          </label>
          <TextInput
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="engineer@company.com"
            leftSection={<IconMail size={16} color="#6b7280" />}
            required
            styles={{
              input: {
                height: 44,
                borderRadius: 9,
                borderColor: '#e5e7eb',
                fontSize: '0.85rem',
              },
            }}
          />
        </Box>

        {/* PASSWORD Field */}
        <Box>
          <label className="tech-mono-label" htmlFor="reg-password">
            PASSWORD
          </label>
          <PasswordInput
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Create strong password"
            leftSection={<IconLock size={16} color="#6b7280" />}
            required
            styles={{
              input: {
                height: 44,
                borderRadius: 9,
                borderColor: '#e5e7eb',
                fontSize: '0.85rem',
              },
            }}
          />
        </Box>

        {/* CONFIRM PASSWORD Field */}
        <Box>
          <label className="tech-mono-label" htmlFor="reg-confirm-password">
            CONFIRM PASSWORD
          </label>
          <PasswordInput
            id="reg-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            placeholder="Confirm your password"
            leftSection={<IconLock size={16} color="#6b7280" />}
            required
            styles={{
              input: {
                height: 44,
                borderRadius: 9,
                borderColor: '#e5e7eb',
                fontSize: '0.85rem',
              },
            }}
          />
        </Box>

        {/* Submit Button */}
        <button
          type="submit"
          className="tech-btn-primary"
          disabled={loading}
          id="register-submit-btn"
          style={{ marginTop: 4, height: 48 }}
        >
          {loading ? (
            'CREATING ACCOUNT...'
          ) : (
            <>
              <span>CREATE ACCOUNT</span>
              <IconArrowRight size={18} stroke={2.4} />
            </>
          )}
        </button>
      </form>

      {/* Divider OR */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '16px 0',
        }}
      >
        <Box style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#9ca3af',
            letterSpacing: '0.06em',
          }}
        >
          OR
        </span>
        <Box style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
      </Box>

      {/* Social SSO Buttons */}
      <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <button
          type="button"
          className="tech-btn-social"
          id="reg-google-btn"
          onClick={() => {
            setOauthProvider('GOOGLE')
            setOauthModalOpen(true)
          }}
        >
          <GoogleIcon size={18} />
          <span>Google</span>
        </button>
        <button
          type="button"
          className="tech-btn-social"
          id="reg-github-btn"
          onClick={() => {
            setOauthProvider('GITHUB')
            setOauthModalOpen(true)
          }}
        >
          <GitHubIcon size={18} />
          <span>GitHub</span>
        </button>
      </Box>

      {/* Bottom Callout / Footer Card -> Navigate back to Login */}
      <Box style={{ marginTop: 'auto' }}>
        <Box
          className="tech-callout-card tech-callout-interactive"
          onClick={onNavigateLogin}
          role="button"
          tabIndex={0}
          id="nav-to-login-btn"
        >
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 3,
                }}
              >
                ALREADY REGISTERED?
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  color: '#0f172a',
                  textTransform: 'uppercase',
                }}
              >
                SIGN IN INSTEAD<span className="tech-headline-dot">.</span>
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.78rem',
                  color: '#64748b',
                  marginTop: 3,
                  lineHeight: 1.35,
                }}
              >
                Access your workspace and continue building.
              </p>
            </Box>
            <IconArrowRight size={20} color="#2563eb" style={{ flexShrink: 0, marginLeft: 12 }} />
          </Box>
        </Box>
      </Box>

      {/* OAuth SSO Modal */}
      <OAuthModal
        opened={oauthModalOpen}
        onClose={() => setOauthModalOpen(false)}
        provider={oauthProvider}
        onLoginSuccess={(res) => {
          if (onLoginSuccess) {
            onLoginSuccess(res)
          } else if (onRegisterSuccess) {
            onRegisterSuccess()
          }
        }}
      />
    </Box>
  )
}
