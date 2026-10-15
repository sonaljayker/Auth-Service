import React, { useState } from 'react'
import {
  TextInput,
  PasswordInput,
  Anchor,
  Text,
  Divider,
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

export function RegisterForm({ onNavigateLogin, onRegisterSuccess, onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)

  // OAuth SSO state
  const [oauthModalOpen, setOauthModalOpen] = useState(false)
  const [oauthProvider, setOauthProvider] = useState('GOOGLE')

  const handleSubmit = async (e) => {
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
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header: Logo + Version */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="tech-logo-box">R&amp;D</div>
        <span className="tech-version-tag">v 1.0.0</span>
      </div>

      {/* Kicker + Headline with Isometric Cube */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <div className="tech-kicker" style={{ marginBottom: 8 }}>
            02 / GET STARTED
          </div>
          <h1 className="tech-headline">
            CREATE AN <br />
            ACCOUNT<span className="tech-headline-dot">.</span>
          </h1>
          <p className="tech-subtitle" style={{ marginTop: 8 }}>
            Join our R&amp;D engineering workspace and start building.
          </p>
        </div>

        {/* Isometric Cube Graphic */}
        <div style={{ flexShrink: 0, marginTop: -6 }}>
          <IsometricCube size={96} />
        </div>
      </div>

      {/* Error / Alert feedback */}
      {error && (
        <div
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
        </div>
      )}

      {successInfo && (
        <div
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
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* USERNAME Field */}
        <div>
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
        </div>

        {/* EMAIL Field */}
        <div>
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
        </div>

        {/* PASSWORD Field */}
        <div>
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
        </div>

        {/* CONFIRM PASSWORD Field */}
        <div>
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
        </div>

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '16px 0',
        }}
      >
        <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
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
        <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
      </div>

      {/* Social SSO Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
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
      </div>

      {/* Bottom Callout / Footer Card -> Navigate back to Login */}
      <div>
        <div
          className="tech-callout-card tech-callout-interactive"
          onClick={onNavigateLogin}
          role="button"
          tabIndex={0}
          id="nav-to-login-btn"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
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
            </div>
            <IconArrowRight size={20} color="#2563eb" style={{ flexShrink: 0, marginLeft: 12 }} />
          </div>
        </div>
      </div>

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
    </div>
  )
}
