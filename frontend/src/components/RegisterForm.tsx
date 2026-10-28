import React, { useState } from 'react'
import { IconArrowRight, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { GoogleIcon, GitHubIcon } from './SocialButtons'
import { OAuthModal } from './OAuthModal'
import { TechInput, TechButton, TechSocialButton } from './TechControls'
import { registerApi } from '../services/authApi'

interface RegisterFormProps {
  onNavigateLogin: () => void
  onRegisterSuccess?: (res?: any) => void
  onLoginSuccess?: (res?: any) => void
}

export function RegisterForm({
  onNavigateLogin,
  onRegisterSuccess,
  onLoginSuccess,
}: RegisterFormProps) {
  // Form fields - no dummy presets
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Status & Feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  // OAuth SSO state
  const [oauthModalOpen, setOauthModalOpen] = useState(false)
  const [oauthProvider, setOauthProvider] = useState<'GOOGLE' | 'GITHUB'>('GOOGLE')

  // Validation
  const validate = () => {
    const errs: Record<string, string> = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      errs.email = 'Work email is required'
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid work email address'
    }

    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Password confirmation is required'
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }

    if (!acceptedTerms) {
      errs.terms = 'You must accept the R&D Platform Security & Usage terms'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessInfo(null)

    if (!validate()) return

    setLoading(true)
    try {
      const derivedUsername = username.trim() || fullName.trim().toLowerCase().replace(/\s+/g, '_') || email.split('@')[0]
      const result = await registerApi({
        email: email.trim().toLowerCase(),
        username: derivedUsername,
        fullName: fullName.trim(),
        password,
      })

      setSuccessInfo('Account successfully provisioned in database! Redirecting to sign in...')
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(result)
        } else {
          onNavigateLogin()
        }
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'Registration failed with backend service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rnd-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="rnd-logo-square">R&amp;D</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tech-kicker-badge">
            <span className="tech-kicker-dot" />
            ENGINEER PROVISIONING
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#85899E' }}>
            v 1.0.0
          </span>
        </div>
      </div>

      {/* Main Heading & Description */}
      <div style={{ marginBottom: 22 }}>
        <h2 className="rnd-form-heading">START BUILDING.</h2>
        <p className="rnd-form-subtext">
          Create your account and begin your engineering journey.
        </p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="rnd-alert rnd-alert-error" role="alert">
          <IconAlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Global Success Banner */}
      {successInfo && (
        <div className="rnd-alert rnd-alert-success" role="status">
          <IconCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{successInfo}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Full Name & Username in 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TechInput
            id="reg-fullname"
            label="FULL NAME"
            placeholder="e.g. Alex Vance"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />

          <TechInput
            id="reg-username"
            label="USERNAME (OPTIONAL)"
            placeholder="e.g. alex_vance"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            helperText="Derived from email if blank."
            autoComplete="username"
          />
        </div>

        {/* Email Address */}
        <TechInput
          id="reg-email"
          label="WORK EMAIL ADDRESS"
          type="email"
          placeholder="engineer@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
          }}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />

        {/* Password */}
        <TechInput
          id="reg-password"
          label="PASSWORD"
          isPassword
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
          }}
          error={fieldErrors.password}
          autoComplete="new-password"
          required
        />

        {/* Confirm Password */}
        <TechInput
          id="reg-confirm-password"
          label="CONFIRM PASSWORD"
          isPassword
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' })
          }}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          required
        />

        {/* Terms & Conditions Checkbox */}
        <div style={{ marginTop: 2 }}>
          <label className="rnd-checkbox-label">
            <input
              type="checkbox"
              className="rnd-checkbox-input"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked)
                if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: '' })
              }}
              required
            />
            <span style={{ fontSize: '0.78rem', color: '#1A1A1A', lineHeight: 1.45 }}>
              I agree to the <a href="#terms" className="rnd-link" onClick={(e) => e.preventDefault()}>R&amp;D Platform Engineering Security Standards</a> and Confidentiality Agreement.
            </span>
          </label>
          {fieldErrors.terms && (
            <div className="rnd-field-error" style={{ marginTop: 4 }}>
              <IconAlertCircle size={14} />
              <span>{fieldErrors.terms}</span>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <TechButton
          type="submit"
          id="register-submit-btn"
          loading={loading}
          loadingText="PROVISIONING ACCOUNT..."
          style={{ marginTop: 8 }}
        >
          CREATE ACCOUNT
        </TechButton>
      </form>

      {/* Divider */}
      <div className="rnd-divider-row">
        <div className="rnd-divider-line" />
        <span className="rnd-divider-text">OR CONTINUE WITH</span>
        <div className="rnd-divider-line" />
      </div>

      {/* Social SSO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TechSocialButton
          id="reg-google-btn"
          icon={<GoogleIcon size={18} />}
          label="Google"
          onClick={() => {
            setOauthProvider('GOOGLE')
            setOauthModalOpen(true)
          }}
        />
        <TechSocialButton
          id="reg-github-btn"
          icon={<GitHubIcon size={18} />}
          label="GitHub"
          onClick={() => {
            setOauthProvider('GITHUB')
            setOauthModalOpen(true)
          }}
        />
      </div>

      {/* Bottom Switcher: ALREADY HAVE AN ACCOUNT? SIGN IN */}
      <div
        className="rnd-nav-card"
        onClick={onNavigateLogin}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onNavigateLogin()
          }
        }}
        id="nav-to-login-btn"
      >
        <div>
          <span className="tech-label-mono" style={{ color: 'var(--color-brand-primary)', marginBottom: 2 }}>
            ALREADY HAVE AN ACCOUNT?
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
            SIGN IN &rarr;
          </span>
        </div>
        <IconArrowRight size={18} color="#3155FF" />
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
            onRegisterSuccess(res)
          }
        }}
      />
    </div>
  )
}
