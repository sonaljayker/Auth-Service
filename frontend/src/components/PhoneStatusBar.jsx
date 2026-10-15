import React from 'react'

export function PhoneStatusBar() {
  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* Top Phone Sensor Island */}
      <div className="phone-island" />

      {/* Clock and Status Icons */}
      <div className="phone-status-bar" style={{ marginTop: '-20px', paddingBottom: '12px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
          9:41
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Signal Bars */}
          <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
            <rect x="0.5" y="8" width="2.5" height="3" rx="0.5" fill="#111827" />
            <rect x="4.5" y="5.5" width="2.5" height="5.5" rx="0.5" fill="#111827" />
            <rect x="8.5" y="3" width="2.5" height="8" rx="0.5" fill="#111827" />
            <rect x="12.5" y="0.5" width="2.5" height="10.5" rx="0.5" fill="#111827" />
          </svg>

          {/* Wi-Fi Icon */}
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
            <path
              d="M7.5 10.5C8.05228 10.5 8.5 10.0523 8.5 9.5C8.5 8.94772 8.05228 8.5 7.5 8.5C6.94772 8.5 6.5 8.94772 6.5 9.5C6.5 10.0523 6.94772 10.5 7.5 10.5Z"
              fill="#111827"
            />
            <path
              d="M4.5 6.5C5.35 5.8 6.38 5.4 7.5 5.4C8.62 5.4 9.65 5.8 10.5 6.5"
              stroke="#111827"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M1.8 3.8C3.4 2.3 5.4 1.5 7.5 1.5C9.6 1.5 11.6 2.3 13.2 3.8"
              stroke="#111827"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>

          {/* Battery */}
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
            <rect
              x="1"
              y="1"
              width="18"
              height="9"
              rx="2.5"
              stroke="#111827"
              strokeWidth="1.2"
            />
            <rect x="2.5" y="2.5" width="13" height="6" rx="1.5" fill="#111827" />
            <path
              d="M20 4C20.6 4.3 21 4.8 21 5.5C21 6.2 20.6 6.7 20 7"
              stroke="#111827"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
