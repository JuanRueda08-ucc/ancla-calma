import '../styles/starfield.css'

export default function StarField({ className = '' }) {
  return <div className={`star-field pointer-events-none absolute inset-0 z-[1] opacity-60 ${className}`} />
}
