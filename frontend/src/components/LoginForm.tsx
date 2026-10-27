import React, { useState, useEffect, useRef } from 'react'
import {
  TextInput,
  PasswordInput,
  Anchor,
} from '@mantine/core'
import {
  IconUser,
  IconLock,
  IconArrowRight,
  IconAlertCircle,
  IconCheck,
  IconMail,
  IconKey,
  IconQrcode,
  IconShieldLock,
  IconRefresh,
  IconDeviceMobile,
} from '@tabler/icons-react'
import { GoogleIcon, GitHubIcon } from './SocialButtons'
import { IsometricCube } from './IsometricCube'
import { OAuthModal } from './OAuthModal'
import {
  loginApi,
  login2faApi,
  sendOtpApi,
  loginWithOtpApi,
  generateQrSessionApi,
  checkQrSessionStatusApi,
  approveQrSessionApi,
} from '../services/authApi'

export function LoginForm({
  onNavigateRegister,
  onNavigateForgot,
  onLoginSuccess,
  variant = 'with-cube',
}) {
  // Login Tab: 'password' | 'otp' | 'qr'
  const [loginMethod, setLoginMethod] = useState('password')

  // OAuth SSO state
  const [oauthModalOpen, setOauthModalOpen] = useState(false)
  const [oauthProvider, setOauthProvider] = useState('GOOGLE')

  // Password state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 2FA Challenge state (triggered after password validation if user has 2FA enabled)
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')

  // OTP Login state
  const [otpTarget, setOtpTarget] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)

  // QR Login state
  const [qrSession, setQrSession] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrSimulating, setQrSimulating] = useState(false)
  const pollTimerRef = useRef(null)

  // Common form status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)

  // Countdown timer for OTP
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpCountdown])

  // Initialize or poll QR Session when in 'qr' tab
  useEffect(() => {
    if (loginMethod === 'qr') {
      fetchQrSession()
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [loginMethod])

  const fetchQrSession = async () => {
    setQrLoading(true)
    setError('')
    try {
      const res = await generateQrSessionApi()
      setQrSession(res.data)
      startQrPolling(res.data.sessionToken)
    } catch (err) {
      setError('Failed to generate QR login session')
    } finally {
      setQrLoading(false)
    }
  }

  const startQrPolling = (sessionToken) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await checkQrSessionStatusApi(sessionToken)
        if (res.data?.status === 'APPROVED' && res.data?.accessToken) {
          clearInterval(pollTimerRef.current)
          setSuccessInfo('QR Code verified! Logging in...')
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess({
                success: true,
                data: res.data,
                isMock: res.isMock,
              })
            }
          }, 600)
        } else if (res.data?.status === 'EXPIRED') {
          clearInterval(pollTimerRef.current)
        }
      } catch (err) {
        console.warn('QR poll error', err)
      }
    }, 2500)
  }

  // Handle Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessInfo(null)

    if (!email) {
      setError('Email or username is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    setLoading(true)
    try {
      const result = await loginApi({ email, password })

      // Check if 2FA is required by the backend
      if (result.data?.twoFactorRequired) {
        setTwoFactorChallenge(true)
        setTempToken(result.data.tempToken)
        setSuccessInfo('Password verified. Please enter your 6-digit Authenticator code.')
        return
      }

      setSuccessInfo(result.isMock ? 'Logged in (Simulated Mode)' : 'Logged in successfully!')
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(result), 600)
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  // Handle 2FA Challenge Submit
  const handle2faSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError('Please enter the 6-digit code from your authenticator app')
      return
    }

    setLoading(true)
    try {
      const result = await login2faApi({ tempToken, code: twoFactorCode })
      setSuccessInfo('Two-Factor Authentication verified!')
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(result), 600)
      }
    } catch (err) {
      setError(err.message || 'Invalid 2FA code')
    } finally {
      setLoading(false)
    }
  }

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    setError('')
    if (!otpTarget) {
      setError('Please enter your email or phone number')
      return
    }

    setLoading(true)
    try {
      const res = await sendOtpApi({ target: otpTarget, type: 'LOGIN' })
      setOtpSent(true)
      setOtpCountdown(60)
      setSuccessInfo(res.data?.message || `One-time code sent to ${otpTarget}`)
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP Verify & Login
  const handleOtpLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!otpCode) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    try {
      const result = await loginWithOtpApi({ target: otpTarget, code: otpCode })
      setSuccessInfo('Code verified! Logging in...')
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(result), 600)
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  // Developer Test helper: Simulate scanning QR code on a mobile app
  const handleSimulateMobileApproval = async () => {
    if (!qrSession?.sessionToken) return
    setQrSimulating(true)
    try {
      await approveQrSessionApi({
        sessionToken: qrSession.sessionToken,
        email: email || 'mobile-tester@workspace.ai',
        password: 'password123',
      })
      setSuccessInfo('Simulated mobile approval complete! Auto-logging in...')
    } catch (err) {
      setError('Could not simulate mobile approval: ' + err.message)
    } finally {
      setQrSimulating(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header: Logo + Version */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="tech-logo-box">R&amp;D</div>
        <span className="tech-version-tag">MNC ENTERPRISE AUTH</span>
      </div>

      {/* Headline & Graphic */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1, paddingRight: variant === 'with-cube' ? 12 : 0 }}>
          <div className="tech-kicker" style={{ marginBottom: 6 }}>
            01 / ENTERPRISE SIGN IN
          </div>
          <h1 className="tech-headline">
            {twoFactorChallenge ? (
              <>
                TWO-FACTOR <br />
                SECURITY<span className="tech-headline-dot">.</span>
              </>
            ) : loginMethod === 'otp' ? (
              <>
                SIGN IN <br />
                WITH OTP<span className="tech-headline-dot">.</span>
              </>
            ) : loginMethod === 'qr' ? (
              <>
                SCAN QR TO <br />
                SIGN IN<span className="tech-headline-dot">.</span>
              </>
            ) : (
              <>
                WELCOME <br />
                BACK<span className="tech-headline-dot">.</span>
              </>
            )}
          </h1>
          <p className="tech-subtitle" style={{ marginTop: 6 }}>
            {twoFactorChallenge
              ? 'Enter the 6-digit code from Google/Microsoft Authenticator.'
              : loginMethod === 'otp'
              ? 'Instant passwordless sign in via secure Gmail OTP verification code.'
              : loginMethod === 'qr'
              ? 'Scan with your authenticator or authorized mobile device.'
              : 'Sign in to access your secure enterprise compute workspace.'}
          </p>
        </div>

        {variant === 'with-cube' && !twoFactorChallenge && (
          <div style={{ flexShrink: 0, marginTop: -8 }}>
            <IsometricCube size={95} />
          </div>
        )}
      </div>

      {/* Authentication Mode Switcher Pills (Only if not in 2FA challenge) */}
      {!twoFactorChallenge && (
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: 3,
            borderRadius: 10,
            marginBottom: 18,
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password')
              setError('')
              setSuccessInfo(null)
            }}
            className={`auth-tab-btn ${loginMethod === 'password' ? 'active' : ''}`}
            style={{ flex: 1, padding: '7px 10px', fontSize: '0.74rem' }}
          >
            <IconLock size={14} />
            <span>PASSWORD</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp')
              setError('')
              setSuccessInfo(null)
            }}
            className={`auth-tab-btn ${loginMethod === 'otp' ? 'active' : ''}`}
            style={{ flex: 1, padding: '7px 10px', fontSize: '0.74rem' }}
          >
            <IconMail size={14} />
            <span>OTP CODE</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('qr')
              setError('')
              setSuccessInfo(null)
            }}
            className={`auth-tab-btn ${loginMethod === 'qr' ? 'active' : ''}`}
            style={{ flex: 1, padding: '7px 10px', fontSize: '0.74rem' }}
          >
            <IconQrcode size={14} />
            <span>SCAN QR</span>
          </button>
        </div>
      )}

      {/* Error Feedback */}
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

      {/* Success Feedback */}
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

      {/* 2FA CHALLENGE FORM */}
      {twoFactorChallenge ? (
        <form onSubmit={handle2faSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1d4ed8', fontWeight: 700, fontSize: '0.8rem', marginBottom: 4 }}>
              <IconShieldLock size={16} />
              <span>AUTHENTICATOR APP REQUIRED</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#3b82f6', lineHeight: 1.4 }}>
              Open Google Authenticator or Microsoft Authenticator and enter the dynamic 6-digit TOTP code.
            </p>
          </div>

          <div>
            <label className="tech-mono-label" htmlFor="two-factor-code">
              6-DIGIT AUTHENTICATOR CODE
            </label>
            <TextInput
              id="two-factor-code"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.currentTarget.value)}
              placeholder="e.g. 582910"
              leftSection={<IconKey size={18} color="#2563eb" />}
              maxLength={6}
              autoFocus
              required
              styles={{
                input: {
                  height: 48,
                  borderRadius: 10,
                  borderColor: '#2563eb',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.2rem',
                  letterSpacing: '0.3em',
                  fontWeight: 700,
                  textAlign: 'center',
                },
              }}
            />
          </div>

          <button
            type="submit"
            className="tech-btn-primary"
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            {loading ? 'VERIFYING...' : (
              <>
                <span>VERIFY &amp; SIGN IN</span>
                <IconArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setTwoFactorChallenge(false)
              setTwoFactorCode('')
              setTempToken('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            Cancel and return to password login
          </button>
        </form>
      ) : loginMethod === 'password' ? (
        /* PASSWORD LOGIN FORM */
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="tech-mono-label" htmlFor="login-email">
              USERNAME OR EMAIL
            </label>
            <TextInput
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="e.g. engineer@workspace.ai"
              leftSection={<IconUser size={18} color="#6b7280" />}
              required
              styles={{
                input: {
                  height: 46,
                  borderRadius: 10,
                  borderColor: '#e5e7eb',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                },
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="tech-mono-label" htmlFor="login-password" style={{ margin: 0 }}>
                PASSWORD
              </label>
              <Anchor
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault()
                  if (onNavigateForgot) onNavigateForgot()
                }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#2563eb',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Anchor>
            </div>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="Enter your password"
              leftSection={<IconLock size={18} color="#6b7280" />}
              required
              styles={{
                input: {
                  height: 46,
                  borderRadius: 10,
                  borderColor: '#e5e7eb',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                },
              }}
            />
          </div>

          <button
            type="submit"
            className="tech-btn-primary"
            disabled={loading}
            id="login-submit-btn"
            style={{ marginTop: 4 }}
          >
            {loading ? 'AUTHENTICATING...' : (
              <>
                <span>SIGN IN</span>
                <IconArrowRight size={18} stroke={2.4} />
              </>
            )}
          </button>
        </form>
      ) : loginMethod === 'otp' ? (
        /* OTP LOGIN FORM */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="tech-mono-label" htmlFor="otp-target">
              EMAIL OR PHONE NUMBER
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <TextInput
                id="otp-target"
                value={otpTarget}
                onChange={(e) => setOtpTarget(e.currentTarget.value)}
                placeholder="e.g. engineer@workspace.ai"
                leftSection={<IconMail size={18} color="#6b7280" />}
                style={{ flex: 1 }}
                styles={{
                  input: {
                    height: 46,
                    borderRadius: 10,
                    borderColor: '#e5e7eb',
                  },
                }}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || otpCountdown > 0 || !otpTarget}
                style={{
                  padding: '0 14px',
                  borderRadius: 10,
                  backgroundColor: otpCountdown > 0 ? '#f1f5f9' : '#2563eb',
                  color: otpCountdown > 0 ? '#94a3b8' : '#ffffff',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {otpCountdown > 0 ? `${otpCountdown}s RESEND` : otpSent ? 'RESEND' : 'SEND CODE'}
              </button>
            </div>
          </div>

          {otpSent && (
            <form onSubmit={handleOtpLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="tech-mono-label" htmlFor="otp-code">
                  6-DIGIT VERIFICATION CODE
                </label>
                <TextInput
                  id="otp-code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.currentTarget.value)}
                  placeholder="e.g. 123456"
                  leftSection={<IconKey size={18} color="#2563eb" />}
                  maxLength={6}
                  required
                  styles={{
                    input: {
                      height: 48,
                      borderRadius: 10,
                      borderColor: '#2563eb',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.15rem',
                      letterSpacing: '0.25em',
                      fontWeight: 700,
                      textAlign: 'center',
                    },
                  }}
                />
              </div>

              <button
                type="submit"
                className="tech-btn-primary"
                disabled={loading}
                style={{ marginTop: 4 }}
              >
                {loading ? 'VERIFYING...' : (
                  <>
                    <span>VERIFY OTP &amp; SIGN IN</span>
                    <IconArrowRight size={18} stroke={2.4} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* QR SCAN LOGIN FORM */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <div
            style={{
              padding: 14,
              backgroundColor: '#ffffff',
              borderRadius: 16,
              border: '2px dashed #cbd5e1',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              display: 'inline-block',
            }}
          >
            {qrLoading ? (
              <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Generating QR...</span>
              </div>
            ) : qrSession?.qrCodeDataUrl ? (
              <img
                src={qrSession.qrCodeDataUrl}
                alt="Login QR Code"
                style={{ width: 180, height: 180, display: 'block', borderRadius: 8 }}
              />
            ) : (
              // Fallback generated QR visual if offline
              <div
                style={{
                  width: 180,
                  height: 180,
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <IconQrcode size={100} color="#38bdf8" />
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', marginTop: 4, color: '#94a3b8' }}>
                  SESSION READY
                </span>
              </div>
            )}
          </div>

          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0f172a', fontWeight: 700, fontSize: '0.88rem' }}>
              <IconDeviceMobile size={18} color="#2563eb" />
              <span>Instant Web QR Sign In</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              Open your authenticated mobile app or camera to scan and approve login instantly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button
              type="button"
              onClick={fetchQrSession}
              disabled={qrLoading}
              className="tech-btn-social"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.72rem' }}
            >
              <IconRefresh size={14} />
              <span>REFRESH QR</span>
            </button>
            <button
              type="button"
              onClick={handleSimulateMobileApproval}
              disabled={qrSimulating || qrLoading}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {qrSimulating ? 'APPROVING...' : 'DEMO APPROVE'}
            </button>
          </div>
        </div>
      )}

      {/* Divider OR & Social Single Sign-On (only on password/otp tabs) */}
      {!twoFactorChallenge && loginMethod !== 'qr' && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '18px 0 14px',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              className="tech-btn-social"
              id="google-sso-btn"
              onClick={() => {
                setOauthProvider('GOOGLE')
                setOauthModalOpen(true)
              }}
            >
              <GoogleIcon size={16} />
              <span>Google</span>
            </button>
            <button
              type="button"
              className="tech-btn-social"
              id="github-sso-btn"
              onClick={() => {
                setOauthProvider('GITHUB')
                setOauthModalOpen(true)
              }}
            >
              <GitHubIcon size={16} />
              <span>GitHub</span>
            </button>
          </div>
        </>
      )}

      {/* Bottom Switcher: Create an account */}
      {!twoFactorChallenge && (
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <div
            className="tech-callout-card tech-callout-interactive"
            onClick={onNavigateRegister}
            role="button"
            tabIndex={0}
            id="nav-to-register-btn"
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
                    marginBottom: 2,
                  }}
                >
                  NEW HERE?
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                  }}
                >
                  CREATE AN ACCOUNT<span className="tech-headline-dot">.</span>
                </span>
              </div>
              <IconArrowRight size={18} color="#2563eb" style={{ flexShrink: 0, marginLeft: 12 }} />
            </div>
          </div>
        </div>
      )}

      {/* OAuth SSO Modal */}
      <OAuthModal
        opened={oauthModalOpen}
        onClose={() => setOauthModalOpen(false)}
        provider={oauthProvider}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  )
}
