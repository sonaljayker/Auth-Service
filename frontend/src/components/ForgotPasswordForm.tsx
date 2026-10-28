import React, { useState } from 'react'
import {
  IconAlertCircle,
  IconCheck,
  IconArrowLeft,
  IconShieldLock,
} from '@tabler/icons-react'
import { TechInput, TechButton } from './TechControls'
import { forgotPasswordApi, resetPasswordApi } from '../services/authApi'

export function ForgotPasswordForm({ onNavigateLogin }: { onNavigateLogin: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Request Code, 2: Reset Password, 3: Success
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!email.trim()) {
      setError('Please provide your registered work email address')
      return
    }

    setLoading(true)
    try {
      const res = await forgotPasswordApi({ email: email.trim() })
      setSuccessMsg(res.data?.message || 'Verification passcode dispatched to your email address.')
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch password recovery code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!resetCode.trim()) {
      setError('6-digit verification code is required')
      return
    }
    if (!newPassword) {
      setError('New password is required')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await resetPasswordApi({
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword,
      })
      setSuccessMsg(res.data?.message || 'Password successfully updated!')
      setStep(3)
    } catch (err: any) {
      setError(err.message || 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rnd-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="rnd-logo-square">R&amp;D</div>
        <button
          type="button"
          onClick={onNavigateLogin}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-brand-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <IconArrowLeft size={14} />
          <span>RETURN TO LOGIN</span>
        </button>
      </div>

      <div style={{ marginBottom: 22 }}>
        <span className="tech-kicker-badge" style={{ marginBottom: 6 }}>
          <IconShieldLock size={12} />
          CREDENTIAL RECOVERY
        </span>
        <h2 className="rnd-form-heading">RESET PASSWORD.</h2>
        <p className="rnd-form-subtext">
          {step === 1 && 'Enter your registered work email to receive a secure verification code.'}
          {step === 2 && 'Enter the 6-digit code sent to your email and choose a new password.'}
          {step === 3 && 'Your security credentials have been updated successfully.'}
        </p>
      </div>

      {error && (
        <div className="rnd-alert rnd-alert-error" role="alert">
          <IconAlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="rnd-alert rnd-alert-success" role="status">
          <IconCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Step 1: Request Code */}
      {step === 1 && (
        <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TechInput
            id="forgot-email"
            label="REGISTERED WORK EMAIL"
            type="email"
            placeholder="engineer@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <TechButton type="submit" loading={loading} loadingText="DISPATCHING CODE..." style={{ marginTop: 8 }}>
            SEND VERIFICATION CODE
          </TechButton>
        </form>
      )}

      {/* Step 2: Enter Code & New Password */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TechInput
            id="reset-code"
            label="6-DIGIT VERIFICATION CODE"
            placeholder="123456"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            maxLength={6}
            required
          />

          <TechInput
            id="new-password"
            label="NEW PASSWORD"
            isPassword
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <TechInput
            id="confirm-new-password"
            label="CONFIRM NEW PASSWORD"
            isPassword
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <TechButton type="submit" loading={loading} loadingText="UPDATING CREDENTIALS..." style={{ marginTop: 8 }}>
            CONFIRM &amp; SAVE PASSWORD
          </TechButton>
        </form>
      )}

      {/* Step 3: Success Screen */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: '#ECFDF3',
              color: '#18794E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <IconCheck size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#1A1A1A', marginBottom: 6 }}>
            Password Reset Complete
          </h3>
          <p style={{ color: '#85899E', fontSize: '0.85rem', marginBottom: 22, lineHeight: 1.45 }}>
            Your credentials have been securely updated. You can now access your R&amp;D engineering workspace.
          </p>

          <TechButton onClick={onNavigateLogin}>
            PROCEED TO SIGN IN
          </TechButton>
        </div>
      )}

      {/* Footer Return Link */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <a
          href="#login"
          className="rnd-link"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}
          onClick={(e) => {
            e.preventDefault()
            onNavigateLogin()
          }}
        >
          Remembered your password? <strong>SIGN IN</strong>
        </a>
      </div>
    </div>
  )
}
