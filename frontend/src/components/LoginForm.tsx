import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  IconAlertCircle,
  IconCheck,
  IconLock,
  IconMail,
  IconQrcode,
  IconShieldLock,
  IconRefresh,
  IconDeviceMobile,
} from '@tabler/icons-react'
import { GoogleIcon, GitHubIcon } from './SocialButtons'
import { OAuthModal } from './OAuthModal'
import { TechInput, TechButton, TechSocialButton } from './TechControls'
import {
  loginApi,
  login2faApi,
  sendOtpApi,
  loginWithOtpApi,
  generateQrSessionApi,
  checkQrSessionStatusApi,
  approveQrSessionApi,
} from '../services/authApi'

interface LoginFormProps {
  onNavigateRegister: () => void
  onNavigateForgot: () => void
  onLoginSuccess: (session: any) => void
}

export function LoginForm({
  onNavigateRegister,
  onNavigateForgot,
  onLoginSuccess,
}: LoginFormProps) {
  // Method tab: 'password' | 'otp' | 'qr'
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp' | 'qr'>('password')

  // Password fields
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  // 2FA Challenge state
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')

  // OTP Login state
  const [otpTarget, setOtpTarget] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)

  // QR Session state
  const [qrSession, setQrSession] = useState<any>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrSimulating, setQrSimulating] = useState(false)
  const pollTimerRef = useRef<any>(null)

  // OAuth SSO state
  const [oauthModalOpen, setOauthModalOpen] = useState(false)
  const [oauthProvider, setOauthProvider] = useState<'GOOGLE' | 'GITHUB'>('GOOGLE')

  // Status & Feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  // Countdown timer for OTP
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpCountdown])

  const startQrPolling = useCallback((sessionToken: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await checkQrSessionStatusApi(sessionToken)
        if (res.status === 'APPROVED' && res.accessToken) {
          clearInterval(pollTimerRef.current)
          setSuccessInfo('QR session approved. Authenticating...')
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess({
                success: true,
                data: res,
              })
            }
          }, 600)
        } else if (res.status === 'EXPIRED') {
          clearInterval(pollTimerRef.current)
        }
      } catch (err) {
        console.warn('QR poll error', err)
      }
    }, 2500)
  }, [onLoginSuccess])

  const fetchQrSession = useCallback(async () => {
    setQrLoading(true)
    setError('')
    try {
      const res = await generateQrSessionApi()
      setQrSession(res)
      if (res?.sessionToken) {
        startQrPolling(res.sessionToken)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to initialize QR session. Please check backend status.')
    } finally {
      setQrLoading(false)
    }
  }, [startQrPolling])

  // Clear polling on unmount or tab change away from qr
  useEffect(() => {
    if (loginMethod !== 'qr' && pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [loginMethod])

  // Handle standard password login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessInfo(null)
    const errs: Record<string, string> = {}

    if (!identifier.trim()) {
      errs.identifier = 'Username or email is required'
    }
    if (!password) {
      errs.password = 'Password is required'
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})

    setLoading(true)
    try {
      const result = await loginApi({
        email: identifier.trim(),
        username: identifier.trim(),
        password,
      })

      // Check if 2FA is required by backend policy
      if (result.data?.twoFactorRequired) {
        setTwoFactorChallenge(true)
        setTempToken(result.data.tempToken)
        setSuccessInfo('Two-factor security active. Enter the 6-digit code from your authenticator app.')
        return
      }

      setSuccessInfo('Authentication successful')
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(result), 600)
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or connection error')
    } finally {
      setLoading(false)
    }
  }

  // Handle 2FA submission
  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError('Please enter a valid 6-digit authenticator code')
      return
    }

    setLoading(true)
    try {
      const result = await login2faApi({ tempToken, code: twoFactorCode })
      setSuccessInfo('Two-Factor verification successful')
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(result), 600)
      }
    } catch (err: any) {
      setError(err.message || 'Invalid 2FA code')
    } finally {
      setLoading(false)
    }
  }

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    if (!otpTarget.trim()) {
      setError('Please enter your work email or registered phone number')
      return
    }

    setLoading(true)
    try {
      const res = await sendOtpApi({ target: otpTarget.trim(), type: 'LOGIN' })
      setOtpSent(true)
      setOtpCountdown(60)
      setSuccessInfo(res?.message || `One-time passcode dispatched to ${otpTarget}`)
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP code')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP Verify
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code')
      return
    }

    setLoading(true)
    try {
      const result = await loginWithOtpApi({ target: otpTarget.trim(), code: otpCode.trim() })
      setSuccessInfo('OTP verified. Logging into workspace...')
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(result), 600)
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code')
    } finally {
      setLoading(false)
    }
  }

  // QR Session Approval
  const handleApproveQr = async () => {
    if (!qrSession?.sessionToken) return
    if (!identifier || !password) {
      setError('Please enter your email and password above to approve the QR login session.')
      return
    }
    setQrSimulating(true)
    try {
      await approveQrSessionApi({
        sessionToken: qrSession.sessionToken,
        email: identifier,
        password,
      })
      setSuccessInfo('QR session approved via credentials!')
    } catch (err: any) {
      setError(err.message || 'Could not approve QR session.')
    } finally {
      setQrSimulating(false)
    }
  }

  return (
    <div className="rnd-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div className="rnd-logo-square">R&amp;D</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tech-kicker-badge">
            <span className="tech-kicker-dot" />
            R&amp;D / SYSTEMS LAB
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#85899E' }}>
            v 1.0.0
          </span>
        </div>
      </div>

      {/* Main Form Heading & Supporting Description */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="rnd-form-heading">
          {twoFactorChallenge ? 'VERIFY SECURITY CODE.' : 'SIGN IN TO CONTINUE.'}
        </h2>
        <p className="rnd-form-subtext">
          {twoFactorChallenge
            ? 'Enter the 6-digit TOTP code generated by your Authenticator app.'
            : 'Access your workspace and continue building.'}
        </p>
      </div>

      {/* Secondary Mode Switcher (Password | OTP | QR) */}
      {!twoFactorChallenge && (
        <div className="rnd-tab-bar">
          <button
            type="button"
            className={`rnd-tab-button ${loginMethod === 'password' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('password')
              setError('')
              setFieldErrors({})
              setSuccessInfo(null)
            }}
          >
            <IconLock size={14} />
            <span>PASSWORD</span>
          </button>
          <button
            type="button"
            className={`rnd-tab-button ${loginMethod === 'otp' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('otp')
              setError('')
              setFieldErrors({})
              setSuccessInfo(null)
            }}
          >
            <IconMail size={14} />
            <span>OTP CODE</span>
          </button>
          <button
            type="button"
            className={`rnd-tab-button ${loginMethod === 'qr' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('qr')
              setError('')
              setFieldErrors({})
              setSuccessInfo(null)
              fetchQrSession()
            }}
          >
            <IconQrcode size={14} />
            <span>SCAN QR</span>
          </button>
        </div>
      )}

      {/* Global Alerts */}
      {error && (
        <div className="rnd-alert rnd-alert-error" role="alert">
          <IconAlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {successInfo && (
        <div className="rnd-alert rnd-alert-success" role="status">
          <IconCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{successInfo}</span>
        </div>
      )}

      {/* 2FA CHALLENGE FORM */}
      {twoFactorChallenge ? (
        <form onSubmit={handle2faSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              padding: 14,
              backgroundColor: 'var(--color-surface-light-blue)',
              border: '1px solid rgba(49, 85, 255, 0.25)',
              borderRadius: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3155FF', fontWeight: 600, fontSize: '0.82rem', marginBottom: 4 }}>
              <IconShieldLock size={16} />
              <span>AUTHENTICATOR VERIFICATION</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#1A1A1A', lineHeight: 1.45 }}>
              Open Google Authenticator or Microsoft Authenticator and provide your 6-digit TOTP verification token.
            </p>
          </div>

          <div>
            <label className="tech-label-mono" htmlFor="two-factor-code" style={{ marginBottom: 6, color: '#1A1A1A' }}>
              6-DIGIT VERIFICATION CODE
            </label>
            <input
              id="two-factor-code"
              type="text"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="000000"
              autoFocus
              required
              className="rnd-input-control"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                letterSpacing: '0.35em',
                fontWeight: 700,
                textAlign: 'center',
                borderColor: '#3155FF',
              }}
            />
          </div>

          <TechButton type="submit" loading={loading} loadingText="VERIFYING...">
            VERIFY &amp; SIGN IN
          </TechButton>

          <button
            type="button"
            onClick={() => {
              setTwoFactorChallenge(false)
              setTwoFactorCode('')
              setTempToken('')
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#85899E',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            Cancel and return to password login
          </button>
        </form>
      ) : loginMethod === 'password' ? (
        /* STANDARD PASSWORD FORM */
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 1. Username or Email */}
          <TechInput
            id="login-identifier"
            label="USERNAME OR EMAIL"
            placeholder="e.g. engineer@workspace.ai"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value)
              if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: '' })
            }}
            error={fieldErrors.identifier}
            autoComplete="username"
            required
          />

          {/* 2. Password */}
          <TechInput
            id="login-password"
            label="PASSWORD"
            isPassword
            placeholder="Enter your security password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
            }}
            error={fieldErrors.password}
            autoComplete="current-password"
            required
            rightAction={
              <a
                href="#forgot"
                className="rnd-link"
                style={{ fontSize: '0.74rem' }}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigateForgot()
                }}
              >
                Forgot password?
              </a>
            }
          />

          {/* Full-width electric-blue SIGN IN button */}
          <TechButton
            type="submit"
            id="login-submit-btn"
            loading={loading}
            loadingText="AUTHENTICATING..."
            style={{ marginTop: 8 }}
          >
            SIGN IN
          </TechButton>
        </form>
      ) : loginMethod === 'otp' ? (
        /* OTP LOGIN FORM */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="rnd-input-group">
            <label className="tech-label-mono" htmlFor="otp-target">
              EMAIL OR PHONE NUMBER
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="otp-target"
                type="text"
                className="rnd-input-control"
                placeholder="e.g. engineer@workspace.ai"
                value={otpTarget}
                onChange={(e) => setOtpTarget(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={loading || otpCountdown > 0 || !otpTarget.trim()}
                className="rnd-btn-primary"
                style={{
                  width: 'auto',
                  padding: '0 16px',
                  height: 'var(--input-height)',
                  fontSize: '0.76rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {otpCountdown > 0 ? `${otpCountdown}s RESEND` : otpSent ? 'RESEND' : 'SEND CODE'}
              </button>
            </div>
          </div>

          {otpSent && (
            <form onSubmit={handleOtpLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TechInput
                id="otp-code-input"
                label="6-DIGIT VERIFICATION CODE"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
              />

              <TechButton type="submit" loading={loading} loadingText="VERIFYING...">
                VERIFY OTP &amp; SIGN IN
              </TechButton>
            </form>
          )}
        </div>
      ) : (
        /* QR SCAN LOGIN FORM */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <div
            style={{
              padding: 16,
              backgroundColor: '#FFFFFF',
              borderRadius: 4,
              border: '2px dashed #BFC2CC',
              display: 'inline-block',
            }}
          >
            {qrLoading ? (
              <div style={{ width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#85899E', fontFamily: 'var(--font-mono)' }}>
                  GENERATING QR...
                </span>
              </div>
            ) : qrSession?.qrCodeDataUrl ? (
              <img
                src={qrSession.qrCodeDataUrl}
                alt="Login QR Code"
                style={{ width: 170, height: 170, display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: 170,
                  height: 170,
                  backgroundColor: '#1A1A1A',
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <IconQrcode size={90} color="#3155FF" />
                <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', marginTop: 4, color: '#85899E' }}>
                  SESSION ACTIVE
                </span>
              </div>
            )}
          </div>

          <div style={{ maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, fontSize: '0.88rem' }}>
              <IconDeviceMobile size={18} color="#3155FF" />
              <span>Instant Mobile Authorization</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#85899E', marginTop: 4 }}>
              Scan this code using an authorized mobile workstation or identity client to log in instantly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              type="button"
              onClick={fetchQrSession}
              disabled={qrLoading}
              className="rnd-btn-secondary"
              style={{ flex: 1, height: 44, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
            >
              <IconRefresh size={14} />
              <span>REFRESH QR</span>
            </button>
            <button
              type="button"
              onClick={handleApproveQr}
              disabled={qrSimulating || qrLoading}
              className="rnd-btn-secondary"
              style={{
                flex: 1,
                height: 44,
                backgroundColor: 'var(--color-surface-light-blue)',
                borderColor: '#3155FF',
                color: '#3155FF',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              {qrSimulating ? 'APPROVING...' : 'APPROVE WITH ACCOUNT'}
            </button>
          </div>
        </div>
      )}

      {/* Social SSO Buttons (Google and GitHub) */}
      {!twoFactorChallenge && loginMethod !== 'qr' && (
        <>
          <div className="rnd-divider-row">
            <div className="rnd-divider-line" />
            <span className="rnd-divider-text">OR CONTINUE WITH</span>
            <div className="rnd-divider-line" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TechSocialButton
              id="google-sso-btn"
              icon={<GoogleIcon size={18} />}
              label="Google"
              onClick={() => {
                setOauthProvider('GOOGLE')
                setOauthModalOpen(true)
              }}
            />
            <TechSocialButton
              id="github-sso-btn"
              icon={<GitHubIcon size={18} />}
              label="GitHub"
              onClick={() => {
                setOauthProvider('GITHUB')
                setOauthModalOpen(true)
              }}
            />
          </div>
        </>
      )}

      {/* Bottom Switcher: CREATE AN ACCOUNT */}
      {!twoFactorChallenge && (
        <div
          className="rnd-nav-card"
          onClick={onNavigateRegister}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onNavigateRegister()
            }
          }}
          id="nav-to-register-btn"
        >
          <div>
            <span className="tech-label-mono" style={{ color: 'var(--color-brand-primary)', marginBottom: 2 }}>
              NEW HERE?
            </span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1A1A1A',
                letterSpacing: '-0.01em',
              }}
            >
              CREATE AN ACCOUNT &rarr;
            </span>
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
