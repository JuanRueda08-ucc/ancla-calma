// Íconos de línea compartidos por las pantallas nocturnas (Señales, Panel de
// Acompañamiento). Heredan el color con `currentColor`.
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function CorazonIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  )
}

export function CuerpoIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M6 9h12" />
      <path d="M12 9v5" />
      <path d="M9 21l3-7 3 7" />
    </svg>
  )
}

export function MenteIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 4a7 7 0 0 0-7 7c0 2 .8 3.7 2 5v4h6v-2h2a2 2 0 0 0 2-2v-2h1.5L17 11a5 5 0 0 0-5-7z" />
      <path d="M10 10a2 2 0 1 1 2 2v1" />
    </svg>
  )
}

export function OjoIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

export function ChevronIcon({ className }) {
  return (
    <svg {...iconProps} strokeWidth="2.2" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function FlechaIcon({ className }) {
  return (
    <svg {...iconProps} strokeWidth="2.2" className={className}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export function InfoIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export function TelefonoIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  )
}

export function FlechaAtrasIcon({ className }) {
  return (
    <svg {...iconProps} strokeWidth="2.2" className={className}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  )
}

export function CerrarIcon({ className }) {
  return (
    <svg {...iconProps} strokeWidth="2.2" className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

export function PausaIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </svg>
  )
}

export function PlayIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M7 5l12 7-12 7z" fill="currentColor" />
    </svg>
  )
}

export function SonidoIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <path d="M17 9a4 4 0 0 1 0 6" />
      <path d="M19.5 6.5a8 8 0 0 1 0 11" />
    </svg>
  )
}

export function SilencioIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <path d="M17 9l5 6" />
      <path d="M22 9l-5 6" />
    </svg>
  )
}

export function PersonaIcon({ className }) {
  return (
    <svg {...iconProps} strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

export function SalirIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </svg>
  )
}

export function EntrarIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 7l5 5-5 5" />
      <path d="M15 12H4" />
    </svg>
  )
}

export function MensajeIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 5h16v11H8l-4 4z" />
    </svg>
  )
}
