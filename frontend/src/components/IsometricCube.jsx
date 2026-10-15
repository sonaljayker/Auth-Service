import React from 'react'

export function IsometricCube({ size = 110, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Dot Matrix Grid */}
      <defs>
        <pattern id="dot-matrix" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill="#cbd5e1" opacity="0.6" />
        </pattern>
      </defs>
      <rect x="50" y="20" width="105" height="120" fill="url(#dot-matrix)" />

      {/* Topmost Highlighted Blue Cube (Ascended) */}
      <g transform="translate(10, 0)">
        {/* Top facet - Vibrant Blue */}
        <path
          d="M100 32 L124 46 L100 60 L76 46 Z"
          fill="#2b5cff"
          stroke="#1d4ed8"
          strokeWidth="1.2"
        />
        {/* Center Accent Dot */}
        <circle cx="100" cy="46" r="2.5" fill="#ffffff" />
        {/* Left facet */}
        <path
          d="M76 46 L100 60 L100 86 L76 72 Z"
          fill="#3b82f6"
          stroke="#1d4ed8"
          strokeWidth="1.2"
          opacity="0.85"
        />
        {/* Right facet */}
        <path
          d="M100 60 L124 46 L124 72 L100 86 Z"
          fill="#1d4ed8"
          stroke="#1e40af"
          strokeWidth="1.2"
          opacity="0.9"
        />
      </g>

      {/* Middle Cube Tier */}
      <g transform="translate(10, 0)">
        {/* Top facet */}
        <path
          d="M76 60 L100 74 L76 88 L52 74 Z"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
        {/* Left facet */}
        <path
          d="M52 74 L76 88 L76 114 L52 100 Z"
          fill="#f1f5f9"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
        {/* Right facet */}
        <path
          d="M76 88 L100 74 L100 100 L76 114 Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>

      {/* Bottom Front Cube Tier */}
      <g transform="translate(10, 0)">
        {/* Top facet */}
        <path
          d="M52 88 L76 102 L52 116 L28 102 Z"
          fill="#ffffff"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
        {/* Left facet */}
        <path
          d="M28 102 L52 116 L52 142 L28 128 Z"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
        {/* Right facet */}
        <path
          d="M52 116 L76 102 L76 128 L52 142 Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  )
}
