import { Link } from 'react-router-dom'

export default function BackButton({ to }) {
  return (
    <Link
      to={to}
      className="mb-7 inline-flex items-center gap-1.5 rounded-full bg-white/60 py-[9px] pl-3 pr-4 text-sm font-semibold text-ink"
    >
      ← Volver
    </Link>
  )
}
