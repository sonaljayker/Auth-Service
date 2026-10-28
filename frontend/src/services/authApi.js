/**
 * Auth API Service
 * Real-time communication with the Spring Boot Backend at /api/v1/auth
 * Fully connected to Spring Security 6 backend with zero mock/dummy data fallbacks.
 */

let activeApiBase = ''

export function getApiBase() {
  if (activeApiBase) return activeApiBase
  if (typeof window !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    activeApiBase = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    return activeApiBase
  }
  return '/api/v1'
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  let data = null

  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    const text = await response.text().catch(() => '')
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text.slice(0, 200) }
      }
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.Message ||
      data?.error ||
      data?.details ||
      (typeof data === 'string' ? data : null) ||
      `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Robust fetch helper that connects to the backend API.
 * Automatically tries relative path first (/api/v1), and if running in a browser
 * where the relative route is not proxied (e.g. direct SPA port without proxy),
 * transparently connects to the backend host on port 8090.
 */
async function safeFetch(endpoint, options = {}) {
  const base = getApiBase()
  const initialUrl = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`

  let response
  try {
    response = await fetch(initialUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    })
  } catch (networkErr) {
    // If relative request failed and we are on localhost, attempt direct connection to port 8090
    if (
      typeof window !== 'undefined' &&
      !endpoint.startsWith('http') &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      window.location.port !== '8090'
    ) {
      const directUrl = `http://${window.location.hostname}:8090/api/v1${endpoint}`
      try {
        const directRes = await fetch(directUrl, {
          ...options,
          headers: {
            'Accept': 'application/json',
            ...(options.headers || {}),
          },
        })
        const directContentType = directRes.headers.get('content-type') || ''
        if (!directContentType.includes('text/html')) {
          activeApiBase = `http://${window.location.hostname}:8090/api/v1`
          return await handleResponse(directRes)
        }
      } catch {
        // Direct attempt also failed
      }
    }
    throw new Error(networkErr.message || 'Unable to connect to backend server (Port 8090)')
  }

  // If response returned HTML, the web server returned index.html or 502/504 Bad Gateway instead of hitting the backend
  const contentType = response.headers.get('content-type') || ''
  if (
    contentType.includes('text/html') &&
    !endpoint.startsWith('http') &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port !== '8090'
  ) {
    const directUrl = `http://${window.location.hostname}:8090/api/v1${endpoint}`
    try {
      const directRes = await fetch(directUrl, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...(options.headers || {}),
        },
      })
      const directContentType = directRes.headers.get('content-type') || ''
      if (!directContentType.includes('text/html')) {
        activeApiBase = `http://${window.location.hostname}:8090/api/v1`
        return await handleResponse(directRes)
      }
    } catch {
      // Direct connection also failed
    }
    throw new Error(`API routing error: received HTML from web server (HTTP ${response.status}). Ensure backend is running on port 8090.`)
  }

  return await handleResponse(response)
}

// Real Password Login
export async function loginApi({ email, username, password }) {
  const loginIdentifier = (email || username || '').trim()
  const data = await safeFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: loginIdentifier,
      username: username || loginIdentifier,
      password,
    }),
  })
  return { success: true, data }
}

// Real 2FA Challenge Verification during Login
export async function login2faApi({ tempToken, code }) {
  const data = await safeFetch('/auth/login/2fa-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, code: code.trim() }),
  })
  return { success: true, data }
}

// Real OAuth SSO Login (Google, GitHub)
export async function oauthLoginApi({ provider, email, name, idToken, avatarUrl }) {
  const data = await safeFetch('/auth/oauth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, email, name, idToken, avatarUrl }),
  })
  return { success: true, data }
}

// Real User Registration
export async function registerApi({ email, username, fullName, password }) {
  const normalizedEmail = (email || '').trim().toLowerCase()
  const chosenUsername = (username || fullName || normalizedEmail.split('@')[0] || 'engineer').trim()
  const data = await safeFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: normalizedEmail,
      username: chosenUsername,
      password,
    }),
  })
  return { success: true, data }
}

// Real Send One-Time Password (OTP) via Gmail SMTP
export async function sendOtpApi({ target, type = 'LOGIN' }) {
  const data = await safeFetch('/auth/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: target.trim(), type }),
  })
  return { success: true, data }
}

// Real Login with OTP
export async function loginWithOtpApi({ target, code }) {
  const data = await safeFetch('/auth/otp/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: target.trim(), code: code.trim(), type: 'LOGIN' }),
  })
  return { success: true, data }
}

// Real Request Forgot Password Code
export async function forgotPasswordApi({ email }) {
  const data = await safeFetch('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  })
  return { success: true, data }
}

// Real Reset Password with Code
export async function resetPasswordApi({ email, resetCode, newPassword }) {
  const data = await safeFetch('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      resetCode: resetCode.trim(),
      newPassword,
    }),
  })
  return { success: true, data }
}

// Real Generate Web QR Code Login Session
export async function generateQrSessionApi() {
  const data = await safeFetch('/auth/qr/generate')
  return { success: true, data }
}

// Real Poll QR Code Login Status
export async function checkQrSessionStatusApi(sessionToken) {
  const data = await safeFetch(`/auth/qr/status/${sessionToken}`)
  return { success: true, data }
}

// Real Approve QR Session
export async function approveQrSessionApi({ sessionToken, token, email, password }) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const data = await safeFetch('/auth/qr/approve', {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionToken, email, password }),
  })
  return { success: true, data }
}

// Real Setup 2FA
export async function setup2faApi(token) {
  const data = await safeFetch('/auth/2fa/setup', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return { success: true, data }
}

// Real Enable 2FA
export async function enable2faApi({ token, code }) {
  const data = await safeFetch('/auth/2fa/enable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code: code.trim() }),
  })
  return { success: true, data }
}

// Real Disable 2FA
export async function disable2faApi(token) {
  const data = await safeFetch('/auth/2fa/disable', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return { success: true, data }
}

// Real Check Backend Health
export async function checkBackendHealth() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)
    const base = getApiBase()
    let response = null
    try {
      response = await fetch(`${base}/auth/qr/generate`, {
        method: 'GET',
        signal: controller.signal,
      })
    } catch {
      response = null
    }

    const contentType = response?.headers?.get('content-type') || ''
    // If relative request failed or returned HTML, try direct connection to port 8090
    if (
      (!response || !response.ok || contentType.includes('text/html')) &&
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      window.location.port !== '8090'
    ) {
      try {
        const directRes = await fetch(`http://${window.location.hostname}:8090/api/v1/auth/qr/generate`, {
          method: 'GET',
        })
        const directContentType = directRes?.headers?.get('content-type') || ''
        if (directRes?.ok && directContentType.includes('application/json')) {
          activeApiBase = `http://${window.location.hostname}:8090/api/v1`
          clearTimeout(timeoutId)
          return true
        }
      } catch {
        // Direct attempt also failed
      }
    }

    clearTimeout(timeoutId)
    return !!response && response.status < 500 && contentType.includes('application/json')
  } catch {
    return false
  }
}
