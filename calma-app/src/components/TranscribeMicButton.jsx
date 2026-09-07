import { useEffect, useRef, useState } from 'react'

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function MicIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" fill="currentColor" />
      <path
        d="M6 11v1a6 6 0 0 0 12 0v-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function TranscribeMicButton({ value, onTranscript }) {
  const [status, setStatus] = useState('idle') // 'idle' | 'listening' | 'error'
  const [interimText, setInterimText] = useState('')

  const recognitionRef = useRef(null)
  const valueRef = useRef(value)
  const onTranscriptRef = useRef(onTranscript)
  const manualStopRef = useRef(false)
  const errorTimeoutRef = useRef(null)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const startRecognition = () => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor()
    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'es-CO'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const transcript = result[0].transcript
        if (result.isFinal) {
          const current = valueRef.current
          const separator = current.trim() !== '' ? ' ' : ''
          const combined = `${current}${separator}${transcript}`
          valueRef.current = combined
          onTranscriptRef.current?.(combined)
        } else {
          interim += transcript
        }
      }
      setInterimText(interim)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        manualStopRef.current = true
        setStatus('error')
        setInterimText('')
        clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = setTimeout(() => setStatus('idle'), 3000)
      }
    }

    recognition.onend = () => {
      // El navegador puede cortar la sesión por silencio incluso con
      // continuous=true. Si el usuario no la detuvo manualmente, la
      // reiniciamos para que se sienta continua desde su perspectiva.
      if (!manualStopRef.current) {
        startRecognition()
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const handleClick = () => {
    if (status === 'listening') {
      manualStopRef.current = true
      recognitionRef.current?.stop()
      setStatus('idle')
      setInterimText('')
      return
    }

    clearTimeout(errorTimeoutRef.current)
    manualStopRef.current = false
    setInterimText('')
    startRecognition()
    setStatus('listening')
  }

  useEffect(() => {
    return () => {
      clearTimeout(errorTimeoutRef.current)
      const recognition = recognitionRef.current
      if (recognition) {
        manualStopRef.current = true
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
        recognition.abort()
      }
    }
  }, [])

  if (!getSpeechRecognitionCtor()) return null

  const ariaLabel =
    status === 'listening'
      ? 'Detener transcripción'
      : status === 'error'
        ? 'Error de micrófono'
        : 'Transcribir por voz'

  const stateClass =
    status === 'listening'
      ? 'bg-aire-accent/20 text-aire-1 animate-pulse'
      : status === 'error'
        ? 'bg-red-50 text-red-500'
        : 'bg-ink/10 text-ink-soft'

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={status === 'error' ? 'No se pudo acceder al micrófono' : ariaLabel}
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ${stateClass}`}
      >
        <MicIcon className="h-4 w-4" />
      </button>

      {status === 'listening' && interimText.trim() !== '' && (
        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 max-w-[220px] -translate-x-1/2 truncate rounded-md bg-ink px-2 py-1 text-[10px] text-white/90">
          escuchando: {interimText}
        </span>
      )}
    </div>
  )
}
