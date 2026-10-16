import React, { useState } from 'react'
import { Modal, TextInput, Box } from '@mantine/core'
import { IconArrowRight, IconUser, IconMail, IconAlertCircle } from '@tabler/icons-react'
import { GoogleIcon, GitHubIcon } from './SocialButtons'
import { oauthLoginApi } from '../services/authApi'

export function OAuthModal({
  opened,
  onClose,
  provider,
  onLoginSuccess,
}: {
  opened: boolean
  onClose: () => void
  provider: string
  onLoginSuccess?: (res: any) => void
}) {
  const isGoogle = provider === 'GOOGLE'
  const defaultEmail = isGoogle ? 'researcher.lab@gmail.com' : 'dev.engineer@github.com'
  const defaultName = isGoogle ? 'Dr. Alex Vance (R&D)' : 'alex-engineer (R&D)'

  const [email, setEmail] = useState(defaultEmail)
  const [name, setName] = useState(defaultName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await oauthLoginApi({
        provider,
        email: email.trim(),
        name: name.trim(),
        idToken: 'oauth-token-' + Math.random().toString(36).substring(2),
      })

      if (onLoginSuccess) {
        onLoginSuccess(res)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'OAuth authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="md"
      padding="xl"
      title={
        <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isGoogle ? <GoogleIcon size={22} /> : <GitHubIcon size={22} />}
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
            Sign in with {isGoogle ? 'Google Workspace' : 'GitHub Enterprise'}
          </span>
        </Box>
      }
      styles={{
        header: { borderBottom: '1px solid #f1f5f9', paddingBottom: 14 },
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
          Authenticate your session using your enterprise {isGoogle ? 'Google' : 'GitHub'} identity.
          A token will be issued by the R&amp;D Auth Service.
        </p>

        {error && (
          <Box
            style={{
              padding: 10,
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <IconAlertCircle size={16} />
            <span>{error}</span>
          </Box>
        )}

        {/* Quick Profile Selection Card */}
        <Box
          onClick={() => handleOAuthSubmit()}
          style={{
            border: '1.5px solid #2563eb',
            borderRadius: 10,
            padding: 14,
            backgroundColor: '#eff6ff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Box
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: isGoogle ? '#ea4335' : '#24292f',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {name.charAt(0)}
            </Box>
            <Box>
              <Box style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>{name}</Box>
              <Box style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{email}</Box>
            </Box>
          </Box>
          <button
            type="button"
            disabled={loading}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {loading ? 'CONNECTING...' : 'CONTINUE'}
          </button>
        </Box>

        {/* Manual Account Customization Option */}
        <form onSubmit={handleOAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Box style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#94a3b8' }}>
              OR CUSTOMIZE PROFILE
            </span>
          </Box>

          <Box>
            <label className="tech-mono-label" htmlFor="oauth-name">DISPLAY NAME</label>
            <TextInput
              id="oauth-name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="e.g. John Doe"
              leftSection={<IconUser size={16} color="#64748b" />}
              styles={{ input: { height: 42, fontSize: '0.84rem' } }}
            />
          </Box>

          <Box>
            <label className="tech-mono-label" htmlFor="oauth-email">ACCOUNT EMAIL</label>
            <TextInput
              id="oauth-email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="e.g. user@gmail.com"
              leftSection={<IconMail size={16} color="#64748b" />}
              styles={{ input: { height: 42, fontSize: '0.84rem' } }}
            />
          </Box>

          <button
            type="submit"
            className="tech-btn-primary"
            disabled={loading}
            style={{ height: 44, marginTop: 4 }}
          >
            {loading ? 'AUTHENTICATING WITH PROVIDER...' : (
              <>
                <span>CONFIRM &amp; SIGN IN</span>
                <IconArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </Box>
    </Modal>
  )
}
