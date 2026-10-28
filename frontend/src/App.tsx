import React, { useState, useEffect } from 'react'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications, notifications } from '@mantine/notifications'
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
import { TechAnimationCore } from './components/TechAnimationCore'
import { checkBackendHealth } from './services/authApi'

const mantineTheme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'var(--font-body)',
  headings: {
    fontFamily: 'var(--font-heading)',
  },
})

export default function App() {
  // Current view: 'login' | 'register' | 'profile' | 'forgot'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'profile' | 'forgot'>('login')
  // Authenticated user session
  const [authSession, setAuthSession] = useState<any>(null)
  // Backend connection status (checks port 8090)
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    checkBackendHealth().then(setBackendOnline)
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendOnline)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleLoginSuccess = (session: any) => {
    setAuthSession(session)
    setActiveTab('profile')
    notifications.show({
      title: 'Authentication Successful',
      message: 'Redirecting to AI Engineering from Scratch in 5s...',
      color: 'blue',
      autoClose: 5000,
    })
  }

  const handleRegisterSuccess = () => {
    setActiveTab('login')
    notifications.show({
      title: 'Account Provisioned',
      message: 'Account successfully registered with Spring backend. Please sign in.',
      color: 'green',
      autoClose: 4000,
    })
  }

  const handleLogout = () => {
    setAuthSession(null)
    setActiveTab('login')
  }

  return (
    <MantineProvider theme={mantineTheme}>
      <Notifications position="top-right" />
      <div className="rnd-layout-wrapper rnd-grid-bg">
        {/* Top Header */}
        <header className="rnd-header">
          <div className="rnd-header-container">
            {/* Brand Logo & Systems Lab */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="rnd-logo-square">R&amp;D</div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    letterSpacing: '-0.02em',
                    color: '#1A1A1A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  R&amp;D SYSTEMS LAB
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.66rem',
                      padding: '2px 6px',
                      background: 'var(--color-surface-light-blue)',
                      border: '1px solid rgba(49, 85, 255, 0.2)',
                      color: 'var(--color-brand-primary)',
                      borderRadius: 3,
                    }}
                  >
                    AUTH v1.0.0
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#85899E' }}>
                  RESEARCH &amp; DEVELOPMENT IDENTITY SERVICE
                </div>
              </div>
            </div>

            {/* Backend Connectivity Status & External Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 3,
                  backgroundColor: backendOnline ? '#ECFDF3' : '#FEF3F2',
                  border: `1px solid ${backendOnline ? '#A6F4C5' : '#FECDCA'}`,
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: backendOnline ? '#18794E' : '#B42318',
                  fontWeight: 600,
                }}
              >
                {backendOnline ? (
                  <>
                    <IconServer size={14} color="#18794E" />
                    <span>SPRING API ONLINE (:8090)</span>
                  </>
                ) : (
                  <>
                    <IconServerOff size={14} color="#B42318" />
                    <span>API DISCONNECTED (:8090)</span>
                  </>
                )}
              </div>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 3,
                  border: '1px solid #D7D8D8',
                  color: '#1A1A1A',
                  textDecoration: 'none',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <IconBrandGithub size={15} />
                <span>GITHUB</span>
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area: Two-Column Composition */}
        <main className="rnd-content-grid">
          {/* Left Column: Research & Innovation Showcase */}
          <div className="rnd-left-panel">
            <div style={{ marginBottom: 12 }}>
              <span className="tech-kicker-badge">
                <span className="tech-kicker-dot" />
                R&amp;D / SYSTEMS LAB
              </span>
            </div>

            <h1
              className="rnd-display-heading"
              style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)',
                marginBottom: 16,
              }}
            >
              BUILD THE FUTURE.
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: '#85899E',
                lineHeight: 1.6,
                maxWidth: 540,
                marginBottom: 24,
              }}
            >
              Access scalable microservices, manage role-based authorization tokens, and collaborate on advanced engineering workloads with precision security.
            </p>

            {/* Architecture feature badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D7D8D8',
                  borderRadius: 3,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                }}
              >
                <IconShieldLock size={14} color="#3155FF" />
                JWT HS-512 SECURE
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D7D8D8',
                  borderRadius: 3,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                }}
              >
                <IconDatabase size={14} color="#3155FF" />
                POSTGRESQL 16 READY
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D7D8D8',
                  borderRadius: 3,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                }}
              >
                <IconCpu size={14} color="#3155FF" />
                SPRING BOOT 3 REST
              </span>
            </div>

            {/* Futuristic Looping Technology Animation */}
            <TechAnimationCore height={340} />
          </div>

          {/* Right Column: Authentication Card Panel */}
          <div className="rnd-right-panel">
            <div className="rnd-auth-card">
              {/* Internal Tab Bar (Login / Register) */}
              {activeTab !== 'profile' && activeTab !== 'forgot' && (
                <div className="rnd-tab-bar">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`rnd-tab-button ${activeTab === 'login' ? 'active' : ''}`}
                  >
                    <IconLogin size={15} />
                    <span>SIGN IN</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`rnd-tab-button ${activeTab === 'register' ? 'active' : ''}`}
                  >
                    <IconUserPlus size={15} />
                    <span>CREATE ACCOUNT</span>
                  </button>
                </div>
              )}

              {/* View Router */}
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
                  onNavigateRegister={() => setActiveTab('register')}
                  onNavigateForgot={() => setActiveTab('forgot')}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
            </div>
          </div>
        </main>

        {/* Website Page Footer */}
        <footer className="rnd-footer">
          <div className="rnd-footer-container">
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
