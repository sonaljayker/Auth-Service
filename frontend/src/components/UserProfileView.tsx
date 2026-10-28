import React, { useState, useEffect } from 'react'
import {
  IconCheck,
  IconLogout,
  IconTerminal,
  IconQrcode,
  IconAlertCircle,
  IconShieldLock,
  IconExternalLink,
  IconPlayerPause,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { TechButton, TechInput } from './TechControls'
import { setup2faApi, enable2faApi, disable2faApi } from '../services/authApi'

export function UserProfileView({
  authData,
  onLogout,
}: {
  authData: any
  onLogout: () => void
}) {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [testingApi, setTestingApi] = useState(false)

  // External Redirect target
  const REDIRECT_URL = 'https://aiengineeringfromscratch.com/'
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const [redirectPaused, setRedirectPaused] = useState(false)

  // 2FA Management State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    authData?.data?.user?.twoFactorEnabled || false
  )
  const [show2faSetup, setShow2faSetup] = useState(false)
  const [setupData, setSetupData] = useState<any>(null)
  const [totpInput, setTotpInput] = useState('')
  const [loading2fa, setLoading2fa] = useState(false)
  const [error2fa, setError2fa] = useState('')
  const [success2fa, setSuccess2fa] = useState('')

  const token = authData?.data?.accessToken || ''
  const email = authData?.data?.user?.email || ''
  const username = authData?.data?.user?.username || email.split('@')[0] || 'User'

  // Redirection countdown
  useEffect(() => {
    if (redirectPaused) return
    if (redirectCountdown <= 0) {
      window.location.href = REDIRECT_URL
      return
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [redirectCountdown, redirectPaused])

  const handleStart2faSetup = async () => {
    setError2fa('')
    setSuccess2fa('')
    setLoading2fa(true)
    try {
      const res = await setup2faApi(token)
      setSetupData(res)
      setShow2faSetup(true)
    } catch (err: any) {
      setError2fa(err.message || 'Failed to initiate 2FA setup with backend')
    } finally {
      setLoading2fa(false)
    }
  }

  const handleConfirm2fa = async (e: React.FormEvent) => {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
          Accept: 'application/json',
        },
      })
      const data = await res.json().catch(() => null)
      setApiResponse({ status: res.status, ok: res.ok, data })
    } catch (err: any) {
      setApiResponse({
        status: 500,
        ok: false,
        error: err.message,
      })
    } finally {
      setTestingApi(false)
    }
  }

  return (
    <div className="rnd-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="rnd-logo-square">R&amp;D</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              borderRadius: 3,
              backgroundColor: '#ECFDF3',
              color: '#18794E',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 600,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#18794E' }} />
            SESSION ACTIVE
          </span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#85899E',
              padding: 4,
            }}
            title="Log Out"
          >
            <IconLogout size={18} />
          </button>
        </div>
      </div>

      {/* Redirection Status Card */}
      <div
        style={{
          border: '1px solid rgba(49, 85, 255, 0.3)',
          borderRadius: 4,
          padding: 14,
          backgroundColor: 'var(--color-surface-light-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span style={{ fontSize: '0.76rem', color: '#1A1A1A', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          {redirectPaused ? 'Redirect paused.' : `Redirecting to AI Engineering in ${redirectCountdown}s...`}
        </span>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setRedirectPaused(!redirectPaused)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 3,
              border: '1px solid #BFC2CC',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {redirectPaused ? <IconPlayerPlay size={12} /> : <IconPlayerPause size={12} />}
            {redirectPaused ? 'RESUME' : 'PAUSE'}
          </button>

          <a
            href={REDIRECT_URL}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 3,
              backgroundColor: '#3155FF',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            <span>GO NOW</span>
            <IconExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* User Information Grid */}
      <div
        style={{
          border: '1px solid #D7D8D8',
          borderRadius: 4,
          padding: 14,
          backgroundColor: '#FAFAF5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 4,
              backgroundColor: '#3155FF',
              color: '#FFFFFF',
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
            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#1A1A1A' }}>{username}</div>
            <div style={{ fontSize: '0.78rem', color: '#85899E', fontFamily: 'var(--font-mono)' }}>{email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.75rem' }}>
          <div style={{ padding: '6px 8px', background: '#FFFFFF', borderRadius: 3, border: '1px solid #D7D8D8' }}>
            <span style={{ color: '#85899E', display: 'block', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>
              IDENTITY
            </span>
            <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{authData?.data?.user?.provider || 'LOCAL'}</span>
          </div>
          <div style={{ padding: '6px 8px', background: '#FFFFFF', borderRadius: 3, border: '1px solid #D7D8D8' }}>
            <span style={{ color: '#85899E', display: 'block', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>
              2FA STATUS
            </span>
            <span style={{ fontWeight: 700, color: twoFactorEnabled ? '#18794E' : '#B42318' }}>
              {twoFactorEnabled ? 'ACTIVE' : 'DISABLED'}
            </span>
          </div>
        </div>
      </div>

      {/* 2FA Enrollment Box */}
      <div
        style={{
          border: '1px solid #D7D8D8',
          borderRadius: 4,
          padding: 14,
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="tech-label-mono" style={{ margin: 0, color: '#1A1A1A' }}>
            <IconShieldLock size={15} color="#3155FF" />
            TWO-FACTOR SECURITY (TOTP)
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 3,
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: twoFactorEnabled ? '#ECFDF3' : 'var(--color-surface-light-blue)',
              color: twoFactorEnabled ? '#18794E' : '#3155FF',
            }}
          >
            {twoFactorEnabled ? 'ENABLED' : 'OPTIONAL'}
          </span>
        </div>

        {error2fa && (
          <div className="rnd-alert rnd-alert-error" style={{ padding: 8, fontSize: '0.74rem', marginBottom: 8 }}>
            <IconAlertCircle size={14} />
            <span>{error2fa}</span>
          </div>
        )}

        {success2fa && (
          <div className="rnd-alert rnd-alert-success" style={{ padding: 8, fontSize: '0.74rem', marginBottom: 8 }}>
            <IconCheck size={14} />
            <span>{success2fa}</span>
          </div>
        )}

        {show2faSetup ? (
          <div style={{ background: '#FAFAF5', padding: 12, borderRadius: 4, border: '1px solid #D7D8D8', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1A1A1A', marginBottom: 8 }}>
              Scan QR in Google / Microsoft Authenticator:
            </div>

            {setupData?.qrCodeDataUrl ? (
              <img
                src={setupData.qrCodeDataUrl}
                alt="2FA QR Code"
                style={{ width: 130, height: 130, margin: '0 auto 8px', display: 'block', border: '1px solid #D7D8D8' }}
              />
            ) : (
              <div style={{ width: 130, height: 130, background: '#1A1A1A', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconQrcode size={70} color="#3155FF" />
              </div>
            )}

            {setupData?.manualKey && (
              <div style={{ fontSize: '0.72rem', color: '#85899E', marginBottom: 8 }}>
                Key: <code style={{ fontWeight: 700, color: '#3155FF' }}>{setupData.manualKey}</code>
              </div>
            )}

            <form onSubmit={handleConfirm2fa} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TechInput
                id="totp-input-code"
                value={totpInput}
                onChange={(e) => setTotpInput(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <TechButton type="submit" loading={loading2fa} style={{ flex: 1, height: 42, fontSize: '0.76rem' }}>
                  ACTIVATE 2FA
                </TechButton>
                <button
                  type="button"
                  onClick={() => setShow2faSetup(false)}
                  className="rnd-btn-secondary"
                  style={{ width: 'auto', padding: '0 14px', height: 42, fontSize: '0.76rem' }}
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
                className="rnd-btn-secondary"
                style={{
                  width: '100%',
                  borderColor: '#FECDCA',
                  color: '#B42318',
                  backgroundColor: '#FEF3F2',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                DISABLE 2FA AUTHENTICATOR
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart2faSetup}
                disabled={loading2fa}
                className="rnd-btn-secondary"
                style={{
                  width: '100%',
                  borderColor: '#3155FF',
                  color: '#3155FF',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                <IconQrcode size={16} />
                <span>CONFIGURE AUTHENTICATOR (2FA)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* API Testing */}
      <div>
        <button
          onClick={testProtectedApi}
          disabled={testingApi}
          className="rnd-btn-secondary"
          style={{ width: '100%', marginBottom: 10, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
        >
          <IconTerminal size={16} />
          <span>{testingApi ? 'QUERYING...' : 'TEST /API/V1/TEST-USERS'}</span>
        </button>

        {apiResponse && (
          <div
            style={{
              padding: 8,
              background: apiResponse.ok ? '#ECFDF3' : '#FEF3F2',
              border: `1px solid ${apiResponse.ok ? '#A6F4C5' : '#FECDCA'}`,
              borderRadius: 4,
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 600, color: apiResponse.ok ? '#18794E' : '#B42318', marginBottom: 2 }}>
              HTTP {apiResponse.status} — {apiResponse.ok ? 'Authorized' : 'Error'}
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', maxHeight: 80, overflowY: 'auto' }}>
              {JSON.stringify(apiResponse.data || apiResponse.error, null, 2)}
            </pre>
          </div>
        )}

        <TechButton onClick={onLogout}>
          SIGN OUT
        </TechButton>
      </div>
    </div>
  )
}
