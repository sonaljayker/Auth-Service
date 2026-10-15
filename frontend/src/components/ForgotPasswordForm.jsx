import React, { useState } from 'react'
import {
  TextInput,
  PasswordInput,
  Anchor,
} from '@mantine/core'
import {
  IconMail,
  IconLock,
  IconArrowRight,
  IconAlertCircle,
  IconCheck,
  IconKey,
  IconArrowLeft,
} from '@tabler/icons-react'
import { forgotPasswordApi, resetPasswordApi } from '../services/authApi'

export function ForgotPasswordForm({ onNavigateLogin }) {
  const [step, setStep] = useState(1) // 1: Request Code, 2: Enter Code & New Password, 3: Success
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const res = await forgotPasswordApi({ email })
      setSuccessMsg(res.data?.message || 'Verification code sent to your email!')
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!resetCode) {
      setError('Verification code is required')
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
      const res = await resetPasswordApi({ email, resetCode, newPassword })
      setSuccessMsg(res.data?.message || 'Password successfully updated!')
      setStep(3)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="tech-logo-box">R&amp;D</div>
        <button
          onClick={onNavigateLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <IconArrowLeft size={14} />
          BACK TO LOGIN
        </button>
      </div>

      <div className="tech-kicker" style={{ marginBottom: 8 }}>
        PASSWORD RECOVERY &bull; GMAIL SECURED
      </div>
      <h1 className="tech-headline">
        RESET YOUR <br />
        PASSWORD<span className="tech-headline-dot">.</span>
      </h1>
      <p className="tech-subtitle" style={{ marginTop: 6, marginBottom: 20 }}>
        {step === 1 && 'Enter your registered email to receive a secure Gmail verification code.'}
        {step === 2 && 'Enter the 6-digit code sent to your email and your new password.'}
        {step === 3 && 'Your account security credentials have been updated.'}
      </p>

      {/* Error alert */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.82rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconAlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Success alert */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.82rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconCheck size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Step 1: Request Code */}
      {step === 1 && (
        <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="tech-mono-label" htmlFor="forgot-email">
              ACCOUNT EMAIL
            </label>
            <TextInput
              id="forgot-email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="e.g. engineer@workspace.ai"
              leftSection={<IconMail size={18} color="#6b7280" />}
              required
              styles={{
                input: {
                  height: 48,
                  borderRadius: 10,
                  borderColor: '#e5e7eb',
                  fontFamily: 'var(--font-body)',
                },
              }}
            />
          </div>

          <button
            type="submit"
            className="tech-btn-primary"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'SENDING CODE...' : (
              <>
                <span>SEND VERIFICATION CODE</span>
                <IconArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: Enter Code & New Password */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="tech-mono-label" htmlFor="reset-code">
              6-DIGIT VERIFICATION CODE
            </label>
            <TextInput
              id="reset-code"
              value={resetCode}
              onChange={(e) => setResetCode(e.currentTarget.value)}
              placeholder="e.g. 123456"
              leftSection={<IconKey size={18} color="#6b7280" />}
              maxLength={6}
              required
              styles={{
                input: {
                  height: 48,
                  borderRadius: 10,
                  borderColor: '#e5e7eb',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.15em',
                  fontWeight: 700,
                },
              }}
            />
          </div>

          <div>
            <label className="tech-mono-label" htmlFor="new-password">
              NEW PASSWORD
            </label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              placeholder="At least 6 characters"
              leftSection={<IconLock size={18} color="#6b7280" />}
              required
              styles={{
                input: {
                  height: 48,
                  borderRadius: 10,
                  borderColor: '#e5e7eb',
                },
              }}
            />
          </div>

          <div>
            <label className="tech-mono-label" htmlFor="confirm-password">
              CONFIRM NEW PASSWORD
            </label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              placeholder="Re-type new password"
              leftSection={<IconLock size={18} color="#6b7280" />}
              required
              styles={{
                input: {
                  height: 48,
                  borderRadius: 10,
                  borderColor: '#e5e7eb',
                },
              }}
            />
          </div>

          <button
            type="submit"
            className="tech-btn-primary"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'RESETTING PASSWORD...' : (
              <>
                <span>CONFIRM &amp; SAVE PASSWORD</span>
                <IconCheck size={18} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <IconCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Password Reset Successful!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 24 }}>
            Your password has been securely updated. You can now sign in with your new credentials.
          </p>
          <button
            onClick={onNavigateLogin}
            className="tech-btn-primary"
            style={{ width: '100%' }}
          >
            <span>PROCEED TO SIGN IN</span>
            <IconArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Footer Return Link */}
      <div style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center' }}>
        <Anchor
          href="#login"
          onClick={(e) => {
            e.preventDefault()
            onNavigateLogin()
          }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: '#64748b',
            textDecoration: 'none',
          }}
        >
          Remember your password? <span style={{ color: '#2563eb', fontWeight: 700 }}>SIGN IN</span>
        </Anchor>
      </div>
    </div>
  )
}
