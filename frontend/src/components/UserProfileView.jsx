import React, { useState } from 'react'
import {
  IconCheck,
  IconCopy,
  IconLogout,
  IconShieldCheck,
  IconTerminal,
  IconLock,
  IconQrcode,
  IconAlertCircle,
  IconShieldLock,
  IconKey,
} from '@tabler/icons-react'
import { TextInput } from '@mantine/core'
import { setup2faApi, enable2faApi, disable2faApi } from '../services/authApi'

export function UserProfileView({ authData, onLogout }) {
  const [copied, setCopied] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)
  const [testingApi, setTestingApi] = useState(false)

  // 2FA Management State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    authData?.data?.user?.twoFactorEnabled || false
  )
  const [show2faSetup, setShow2faSetup] = useState(false)
  const [setupData, setSetupData] = useState(null)
  const [totpInput, setTotpInput] = useState('')
  const [loading2fa, setLoading2fa] = useState(false)
  const [error2fa, setError2fa] = useState('')
  const [success2fa, setSuccess2fa] = useState('')
  const [secretCopied, setSecretCopied] = useState(false)

  const token = authData?.data?.accessToken || ''
  const email = authData?.data?.user?.email || 'engineer@workspace.ai'
  const username = authData?.data?.user?.username || email.split('@')[0]

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStart2faSetup = async () => {
    setError2fa('')
    setSuccess2fa('')
    setLoading2fa(true)
    try {
      const res = await setup2faApi(token)
      setSetupData(res.data)
      setShow2faSetup(true)
    } catch (err) {
      setError2fa(err.message || 'Failed to initiate 2FA setup')
    } finally {
      setLoading2fa(false)
    }
  }

  const handleConfirm2fa = async (e) => {
    e.preventDefault()
    setError2fa('')
    if (!totpInput || totpInput.length !== 6) {
      setError2fa('Please enter the 6-digit code from your authenticator app')
      return
    }

    setLoading2fa(true)
    try {
      await enable2faApi({ token, code: totpInput })
      setTwoFactorEnabled(true)
      setShow2faSetup(false)
      setTotpInput('')
      setSuccess2fa('Two-Factor Authentication is now active on your account!')
    } catch (err) {
      setError2fa(err.message || 'Invalid 6-digit verification code')
    } finally {
      setLoading2fa(false)
    }
  }

  const handleDisable2fa = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication?')) return
    setLoading2fa(true)
    setError2fa('')
    try {
      await disable2faApi(token)
      setTwoFactorEnabled(false)
      setShow2faSetup(false)
      setSuccess2fa('Two-Factor Authentication has been disabled.')
    } catch (err) {
      setError2fa(err.message || 'Failed to disable 2FA')
    } finally {
      setLoading2fa(false)
    }
  }

  const testProtectedApi = async () => {
    setTestingApi(true)
    setApiResponse(null)
    try {
      const res = await fetch('/api/v1/test-users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setApiResponse({ status: res.status, ok: res.ok, data })
    } catch (err) {
      setApiResponse({
        status: 500,
        ok: false,
        error: err.message,
        simulated: true,
        data: [{ id: 'mock-1', email, username, provider: 'LOCAL' }],
      })
    } finally {
      setTestingApi(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="tech-logo-box">R&amp;D</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: '#ecfdf5',
              color: '#059669',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 700,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            SESSION ACTIVE
          </span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4,
            }}
            title="Log Out"
          >
            <IconLogout size={18} />
          </button>
        </div>
      </div>

      <div>
        <div className="tech-kicker" style={{ marginBottom: 4 }}>
          03 / WORKSPACE &bull; SECURITY
        </div>
        <h1 className="tech-headline" style={{ fontSize: '1.4rem' }}>
          ENTERPRISE PROFILE<span className="tech-headline-dot">.</span>
        </h1>
        <p className="tech-subtitle" style={{ fontSize: '0.82rem', marginTop: 2 }}>
          Manage your credentials, 2FA authenticator, and JWT security tokens.
        </p>
      </div>

      {/* User Info Card */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 14,
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: '#2b5cff',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{username}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.75rem' }}>
          <div style={{ padding: '6px 8px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>
              2FA STATUS
            </span>
            <span style={{ fontWeight: 700, color: twoFactorEnabled ? '#059669' : '#d97706' }}>
              {twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <div style={{ padding: '6px 8px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>
              SECURITY TIER
            </span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>ENTERPRISE L3</span>
          </div>
        </div>
      </div>

      {/* 2FA Status & Enrollment Card */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 14,
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="tech-mono-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconShieldLock size={15} color="#2563eb" />
            TWO-FACTOR AUTHENTICATION (TOTP)
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: twoFactorEnabled ? '#ecfdf5' : '#fef3c7',
              color: twoFactorEnabled ? '#059669' : '#b45309',
            }}
          >
            {twoFactorEnabled ? 'PROTECTED' : 'UNPROTECTED'}
          </span>
        </div>

        <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '4px 0 10px' }}>
          Secure sign-ins with Google Authenticator, Microsoft Authenticator, or Authy.
        </p>

        {error2fa && (
          <div style={{ padding: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 6, fontSize: '0.74rem', marginBottom: 8 }}>
            <IconAlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {error2fa}
          </div>
        )}

        {success2fa && (
          <div style={{ padding: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 6, fontSize: '0.74rem', marginBottom: 8 }}>
            <IconCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {success2fa}
          </div>
        )}

        {show2faSetup ? (
          /* 2FA Setup Flow */
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', marginBottom: 8 }}>
              Scan QR in Google / Microsoft Authenticator:
            </div>

            {setupData?.qrCodeDataUrl ? (
              <img
                src={setupData.qrCodeDataUrl}
                alt="2FA QR Code"
                style={{ width: 140, height: 140, margin: '0 auto 8px', display: 'block', borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
            ) : (
              <div style={{ width: 140, height: 140, background: '#0f172a', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                <IconQrcode size={80} color="#38bdf8" />
              </div>
            )}

            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8 }}>
              Manual Key: <code style={{ fontWeight: 700, color: '#2563eb' }}>{setupData?.manualKey || 'JBSWY3DPEHPK3PXP'}</code>
            </div>

            <form onSubmit={handleConfirm2fa} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TextInput
                value={totpInput}
                onChange={(e) => setTotpInput(e.currentTarget.value)}
                placeholder="Enter 6-digit code from app"
                maxLength={6}
                required
                styles={{
                  input: {
                    height: 40,
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.2em',
                    fontWeight: 700,
                  },
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="submit"
                  disabled={loading2fa}
                  className="tech-btn-primary"
                  style={{ flex: 1, height: 38, fontSize: '0.75rem' }}
                >
                  {loading2fa ? 'ENABLING...' : 'ACTIVATE 2FA'}
                </button>
                <button
                  type="button"
                  onClick={() => setShow2faSetup(false)}
                  style={{
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            {twoFactorEnabled ? (
              <button
                type="button"
                onClick={handleDisable2fa}
                disabled={loading2fa}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                DISABLE 2FA AUTHENTICATOR
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart2faSetup}
                disabled={loading2fa}
                className="tech-btn-social"
                style={{
                  width: '100%',
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <IconQrcode size={16} />
                <span>ENABLE GOOGLE / MS AUTHENTICATOR (2FA)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* JWT Bearer Token Card */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 12,
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span className="tech-mono-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconShieldCheck size={14} color="#2563eb" />
            JWT ACCESS TOKEN
          </span>
          <button
            onClick={handleCopyToken}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? '#10b981' : '#2563eb',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#475569',
            background: '#f1f5f9',
            padding: '6px 8px',
            borderRadius: 6,
            wordBreak: 'break-all',
            maxHeight: 52,
            overflowY: 'auto',
          }}
        >
          {token || 'eyJhbGciOiJIUzUxMiJ9...'}
        </div>
      </div>

      {/* Protected Endpoint Tester */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={testProtectedApi}
          disabled={testingApi}
          className="tech-btn-social"
          style={{
            width: '100%',
            marginBottom: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            borderColor: '#2b5cff',
            color: '#2b5cff',
          }}
        >
          <IconTerminal size={16} />
          <span>{testingApi ? 'TESTING...' : 'TEST /API/V1/TEST-USERS'}</span>
        </button>

        {apiResponse && (
          <div
            style={{
              padding: 8,
              background: apiResponse.ok ? '#f0fdf4' : '#eff6ff',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 700, color: apiResponse.ok ? '#15803d' : '#1d4ed8', marginBottom: 2 }}>
              HTTP {apiResponse.status} — Response Received
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', maxHeight: 60, overflowY: 'auto' }}>
              {JSON.stringify(apiResponse.data, null, 2)}
            </pre>
          </div>
        )}

        <button onClick={onLogout} className="tech-btn-primary" style={{ height: 44 }}>
          <span>SIGN OUT</span>
          <IconLogout size={16} />
        </button>
      </div>
    </div>
  )
}
