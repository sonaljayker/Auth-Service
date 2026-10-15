/**
 * Auth API Service
 * Communicates with the Spring Boot Backend at /api/v1/auth
 * Includes automatic mock fallback when backend is unreachable or starting up.
 */

const API_BASE = '/api/v1'

/**
 * Robust fetch helper that handles JSON responses, detects Vite proxy 500/502 ECONNREFUSED
 * errors, and safely handles offline backend scenarios without throwing SyntaxError.
 */
async function safeFetch(url, options = {}) {
  let response
  try {
    response = await fetch(url, options)
  } catch (err) {
    const error = new Error(err.message || 'Network request failed')
    error.isNetwork = true
    throw error
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  // If response is not OK and not JSON (e.g. Vite proxy error or raw gateway error)
  if (!response.ok) {
    if (!isJson) {
      const text = await response.text().catch(() => '')
      if (
        text.includes('[vite]') ||
        text.includes('ECONNREFUSED') ||
        text.includes('proxy error') ||
        text.includes('AggregateError') ||
        response.status >= 502
      ) {
        const error = new Error('Backend server is offline or unreachable')
        error.isNetwork = true
        throw error
      }
      const error = new Error(text.slice(0, 160) || `Server error (${response.status})`)
      error.status = response.status
      throw error
    }
  }

  // Safely parse JSON
  let data
  try {
    data = await response.json()
  } catch (parseErr) {
    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`)
      error.isNetwork = true
      throw error
    }
    throw parseErr
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

// Standard Password Login
export async function loginApi({ email, password }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      console.warn('Backend server unreachable, using mock session.')
      return mockLogin({ email, password })
    }
    throw err
  }
}

// 2FA Challenge Verification during Login
export async function login2faApi({ tempToken, code }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/login/2fa-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, code }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      if (code === '123456' || code.length === 6) {
        return mockLogin({ email: 'verified-2fa@workspace.ai' })
      }
      throw new Error('Invalid mock 2FA code. Use 123456 in simulation mode.')
    }
    throw err
  }
}

// OAuth SSO Login (Google, GitHub)
export async function oauthLoginApi({ provider, email, name, idToken, avatarUrl }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/oauth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, email, name, idToken, avatarUrl }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      const mockEmail = email || `${(name || provider).toLowerCase().replace(/\s+/g, '.')}@${provider.toLowerCase()}.com`
      return {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzUxMiJ9.mock-oauth-' + provider.toLowerCase() + '-token',
          refreshToken: 'mock-refresh-' + Math.random().toString(36).substring(2),
          twoFactorRequired: false,
          message: `Authenticated with ${provider} (Simulation Mode)`,
          user: {
            email: mockEmail,
            username: name || mockEmail.split('@')[0],
            provider: provider.toUpperCase(),
            twoFactorEnabled: false,
          },
        },
        isMock: true,
      }
    }
    throw err
  }
}

// User Registration
export async function registerApi({ email, username, password }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      return mockRegister({ email, username, password })
    }
    throw err
  }
}

// Send One-Time Password (OTP) via Gmail SMTP
export async function sendOtpApi({ target, type = 'LOGIN' }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, type }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      return {
        success: true,
        data: { message: `(Simulated) OTP sent to ${target}. Use 123456 to verify.` },
        isMock: true,
      }
    }
    throw err
  }
}

// Login with OTP
export async function loginWithOtpApi({ target, code }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/otp/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, code, type: 'LOGIN' }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      if (code === '123456' || code.length === 6) {
        return mockLogin({ email: target })
      }
      throw new Error('Invalid simulated OTP. Enter 123456.')
    }
    throw err
  }
}

// Request Forgot Password Code
export async function forgotPasswordApi({ email }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      return {
        success: true,
        data: { message: `(Simulated) Reset code sent to ${email}. Code: 123456` },
        isMock: true,
      }
    }
    throw err
  }
}

// Reset Password with Code
export async function resetPasswordApi({ email, resetCode, newPassword }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetCode, newPassword }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      if (resetCode === '123456' || resetCode.length === 6) {
        return {
          success: true,
          data: { message: 'Password reset successfully (Simulation Mode).' },
          isMock: true,
        }
      }
      throw new Error('Invalid reset code. Use 123456 in simulation.')
    }
    throw err
  }
}

// Generate Web QR Code Login Session
export async function generateQrSessionApi() {
  try {
    const data = await safeFetch(`${API_BASE}/auth/qr/generate`)
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      return {
        success: true,
        data: {
          sessionToken: 'mock-qr-' + Math.random().toString(36).substring(2),
          status: 'PENDING',
          expiresInSeconds: 180,
          qrCodeDataUrl: null,
        },
        isMock: true,
      }
    }
    throw err
  }
}

// Poll QR Code Login Status
export async function checkQrSessionStatusApi(sessionToken) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/qr/status/${sessionToken}`)
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      return {
        success: true,
        data: { sessionToken, status: 'PENDING', expiresInSeconds: 120 },
        isMock: true,
      }
    }
    throw err
  }
}

// Approve QR Session (called from authenticated device or simulation)
export async function approveQrSessionApi({ sessionToken, token, email, password }) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const data = await safeFetch(`${API_BASE}/auth/qr/approve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionToken, email, password }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      return {
        success: true,
        data: { message: 'QR session approved (Simulation Mode).' },
        isMock: true,
      }
    }
    throw err
  }
}

// Setup 2FA (Returns Secret & QR Data URL)
export async function setup2faApi(token) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/2fa/setup`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      return {
        success: true,
        data: {
          secret: 'JBSWY3DPEHPK3PXP',
          manualKey: 'JBSWY3DPEHPK3PXP',
          qrCodeDataUrl: null,
        },
        isMock: true,
      }
    }
    throw err
  }
}

// Enable 2FA after scanning QR
export async function enable2faApi({ token, code }) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/2fa/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      if (code === '123456' || code.length === 6) {
        return { success: true, data: { message: '2FA Enabled (Simulation Mode)' }, isMock: true }
      }
      throw new Error('Invalid code. Enter 123456.')
    }
    throw err
  }
}

// Disable 2FA
export async function disable2faApi(token) {
  try {
    const data = await safeFetch(`${API_BASE}/auth/2fa/disable`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    return { success: true, data, isMock: false }
  } catch (err) {
    if (isNetworkError(err)) {
      return { success: true, data: { message: '2FA Disabled (Simulation Mode)' }, isMock: true }
    }
    throw err
  }
}

export async function checkBackendHealth() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'OPTIONS',
      signal: controller.signal,
    }).catch(() => null)
    clearTimeout(timeoutId)
    return !!response
  } catch {
    return false
  }
}

function isNetworkError(err) {
  if (!err) return false
  if (err.isNetwork) return true
  const msg = (err.message || '').toLowerCase()
  return (
    err.name === 'TypeError' ||
    err.name === 'SyntaxError' ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('offline') ||
    msg.includes('unreachable') ||
    msg.includes('econnrefused') ||
    msg.includes('connection refused') ||
    msg.includes('proxy error') ||
    msg.includes('aggregateerror') ||
    msg.includes('vite') ||
    msg.includes('unexpected token')
  )
}

function mockLogin({ email }) {
  const mockToken =
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxNmYyMGIwNy02YTA4LTQ1MDctYTk3OC04OTliZDFmOTk4OGQiLCJlbWFpbCI6IicgKyBlbWFpbCArICciLCJyb2xlIjpbIlJPTEVfVVNFUiJdLCJ0eXAiOiJhY2Nlc3MifQ.mock-token'
  return {
    success: true,
    data: {
      accessToken: mockToken,
      refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(2),
      twoFactorRequired: false,
      message: 'Login successful (Simulation Mode)',
      user: {
        email: email || 'engineer@workspace.ai',
        username: (email || 'engineer').split('@')[0],
        twoFactorEnabled: false,
      },
    },
    isMock: true,
  }
}

function mockRegister({ email, username }) {
  return {
    success: true,
    data: {
      id: 'mock-' + Math.random().toString(36).substring(2, 10),
      email,
      username: username || email.split('@')[0],
      enable: true,
      provider: 'LOCAL',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    isMock: true,
  }
}
