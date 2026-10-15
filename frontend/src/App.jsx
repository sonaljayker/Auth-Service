import React, { useState, useEffect } from 'react'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import {
  IconServer,
  IconServerOff,
  IconShieldLock,
  IconDatabase,
  IconCpu,
  IconBrandGithub,
  IconLogin,
  IconUserPlus,
} from '@tabler/icons-react'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import { UserProfileView } from './components/UserProfileView'
import { IsometricCube } from './components/IsometricCube'
import { checkBackendHealth } from './services/authApi'

const mantineTheme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'var(--font-body)',
  headings: {
    fontFamily: 'var(--font-heading)',
  },
})

export default function App() {
  // Current tab: 'login' | 'register' | 'profile'
  const [activeTab, setActiveTab] = useState('login')
  // Authenticated user session
  const [authSession, setAuthSession] = useState(null)
  // Backend connection status
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    checkBackendHealth().then(setBackendOnline)
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendOnline)
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  const handleLoginSuccess = (session) => {
    setAuthSession(session)
    setActiveTab('profile')
  }

  const handleRegisterSuccess = () => {
    setActiveTab('login')
  }

  const handleLogout = () => {
    setAuthSession(null)
    setActiveTab('login')
  }

  return (
    <MantineProvider theme={mantineTheme}>
      <Notifications position="top-right" />
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f6f8fb',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top Website Navigation Bar */}
        <header
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '16px 28px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: 1240,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            {/* Brand Logo & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="tech-logo-box">R&amp;D</div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    letterSpacing: '-0.02em',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  R&amp;D PLATFORM
                  <span className="tech-version-tag" style={{ fontSize: '0.68rem', padding: '1px 6px', background: '#f1f5f9', borderRadius: 4 }}>
                    v 1.0.0
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#64748b' }}>
                  RESEARCH &amp; DEVELOPMENT &bull; AUTH SERVICE
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Website Page Content */}
        <main style={{ flex: 1, padding: '40px 24px', display: 'flex', alignItems: 'center' }}>
          <div className="website-container">
            {/* Left Column: Brand Hero & 3D Isometric Showcase */}
            <div className="website-hero-panel">
              <div className="tech-kicker" style={{ marginBottom: 12 }}>
                00 / INTELLIGENT WORKSPACE
              </div>

              <h1
                className="tech-headline"
                style={{
                  fontSize: '2.55rem',
                  lineHeight: 1.08,
                  marginBottom: 16,
                  letterSpacing: '-0.03em',
                }}
              >
                THE PLATFORM FOR <br />
                R&amp;D ENGINEERS<span className="tech-headline-dot">.</span>
              </h1>

              <p
                className="tech-subtitle"
                style={{
                  fontSize: '1rem',
                  maxWidth: 520,
                  lineHeight: 1.55,
                  marginBottom: 24,
                }}
              >
                Access scalable microservices, manage role-based authorization tokens, and collaborate on state-of-the-art machine learning projects with enterprise security.
              </p>

              {/* Feature Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                <span className="feature-pill">
                  <IconShieldLock size={15} color="#2563eb" />
                  JWT HS-512 SECURE
                </span>
                <span className="feature-pill">
                  <IconDatabase size={15} color="#2563eb" />
                  POSTGRESQL 16 READY
                </span>
                <span className="feature-pill">
                  <IconCpu size={15} color="#2563eb" />
                  SPRING BOOT 3 + REST
                </span>
              </div>

              {/* Technical Showcase Card with Isometric Cube */}
              <div className="hero-graphic-card">
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#2563eb',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    ARCHITECTURE MATRIX
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    TIERED SECURITY STACK<span className="tech-headline-dot">.</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4, maxWidth: 280 }}>
                    Modular token authentication with stateless session verification and role mapping.
                  </p>
                </div>
                <IsometricCube size={120} />
              </div>

              {/* Reference Banner Card */}
              <div
                className="tech-callout-card"
                style={{
                  marginTop: 20,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#2563eb',
                    lineHeight: 1.35,
                    borderRight: '1px solid #e2e8f0',
                    paddingRight: 16,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  LEARN<br />BUILD<br />GROW
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    A MODERN PLATFORM FOR R&amp;D ENGINEERS.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Authentication Card */}
            <div className="website-auth-panel">
              <div className="website-auth-card">
                {/* Internal Tab Selector */}
                {activeTab !== 'profile' && (
                  <div
                    style={{
                      display: 'flex',
                      backgroundColor: '#f1f5f9',
                      padding: 4,
                      borderRadius: 12,
                      marginBottom: 24,
                    }}
                  >
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                    >
                      <IconLogin size={15} />
                      <span>SIGN IN</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('register')}
                      className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                    >
                      <IconUserPlus size={15} />
                      <span>CREATE ACCOUNT</span>
                    </button>
                  </div>
                )}

                {/* View Container */}
                {activeTab === 'profile' && authSession ? (
                  <UserProfileView authData={authSession} onLogout={handleLogout} />
                ) : activeTab === 'forgot' ? (
                  <ForgotPasswordForm onNavigateLogin={() => setActiveTab('login')} />
                ) : activeTab === 'register' ? (
                  <RegisterForm
                    onNavigateLogin={() => setActiveTab('login')}
                    onRegisterSuccess={handleRegisterSuccess}
                    onLoginSuccess={handleLoginSuccess}
                  />
                ) : (
                  <LoginForm
                    variant="with-cube"
                    onNavigateRegister={() => setActiveTab('register')}
                    onNavigateForgot={() => setActiveTab('forgot')}
                    onLoginSuccess={handleLoginSuccess}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Website Page Footer */}
        <footer
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '20px 28px',
          }}
        >
          <div
            style={{
              maxWidth: 1240,
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: '#64748b',
            }}
          >
            <div>
              &copy; 2026 R&amp;D PLATFORM &bull; ENTERPRISE AUTHENTICATION SERVICE
            </div>
            <div>
              SPRING SECURITY 6 &bull; JWT HS-512 &bull; REACT + MANTINE UI
            </div>
          </div>
        </footer>
      </div>
    </MantineProvider>
  )
}
