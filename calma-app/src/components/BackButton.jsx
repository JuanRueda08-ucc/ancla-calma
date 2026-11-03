import { Link } from 'react-router-dom'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/comun'

export default function BackButton({ to, state }) {
  const t = useTextos(TEXTOS)
  return (
    <Link
      to={to}
      state={state}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/60 py-[9px] pl-3 pr-4 text-sm font-semibold text-ink"
    >
      {t.volver}
    </Link>
  )
}
