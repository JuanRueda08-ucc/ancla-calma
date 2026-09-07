import { useEffect, useRef, useState } from 'react'

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/mp4']

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return undefined
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type))
}

function isRecordingSupported() {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  )
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const pillClass =
  'flex w-full items-center gap-2.5 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-ink-soft shadow-[0_8px_22px_rgba(0,0,0,0.04)]'

export default function VoiceNoteRecorder({ onRecordingChange }) {
  // Estado de la máquina: 'idle' | 'requesting' | 'recording' | 'recorded' | 'error'.
  const [status, setStatus] = useState('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [recordedDuration, setRecordedDuration] = useState(0)
  const [errorType, setErrorType] = useState(null) // 'denied' | 'unsupported'
  const [isPlaying, setIsPlaying] = useState(false)

  // Referencias mutables entre renders — no necesitan re-renderizar el componente.
  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const objectUrlRef = useRef(null)
  const audioElRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const recordStartRef = useRef(0)

  const stopTimer = () => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }

  const stopStreamTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const startRecording = (stream) => {
    chunksRef.current = []
    const mimeType = pickMimeType()
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.onstop = () => {
      const duration = Math.round((performance.now() - recordStartRef.current) / 1000)
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
      objectUrlRef.current = URL.createObjectURL(blob)
      stopStreamTracks()
      setRecordedDuration(duration)
      setStatus('recorded')
      onRecordingChange?.(blob, duration)
    }

    recordStartRef.current = performance.now()
    setElapsedSeconds(0)
    recorder.start()
    setStatus('recording')

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((performance.now() - recordStartRef.current) / 1000))
    }, 1000)
  }

  const handleStart = async () => {
    if (!isRecordingSupported()) {
      setErrorType('unsupported')
      setStatus('error')
      return
    }

    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      startRecording(stream)
    } catch {
      setErrorType('denied')
      setStatus('error')
    }
  }

  const handleStop = () => {
    stopTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleDiscard = () => {
    audioElRef.current?.pause()
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    chunksRef.current = []
    setIsPlaying(false)
    setStatus('idle')
    onRecordingChange?.(null, null)
  }

  const handleRetry = () => {
    setErrorType(null)
    setStatus('idle')
  }

  const togglePlay = () => {
    const audio = audioElRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  // Cleanup al desmontar en cualquier estado: detiene una grabación activa antes
  // que los tracks del stream, y revoca el object URL si existe, para no dejar
  // ni el micrófono "encendido" ni memoria huérfana.
  useEffect(() => {
    return () => {
      stopTimer()
      audioElRef.current?.pause()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      stopStreamTracks()
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'idle') {
    return (
      <button type="button" onClick={handleStart} className={pillClass}>
        <span>🎙️</span>
        <span>Agregar nota de voz</span>
      </button>
    )
  }

  if (status === 'requesting') {
    return (
      <div className={pillClass}>
        <span className="opacity-40">🎙️</span>
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-ink-soft/25 border-t-ink-soft"
        />
        <span>Agregar nota de voz</span>
      </div>
    )
  }

  if (status === 'recording') {
    return (
      <div className={pillClass}>
        <span aria-hidden="true" className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-red-500" />
        <span className="flex-1 text-left">Grabando... {formatDuration(elapsedSeconds)}</span>
        <button
          type="button"
          onClick={handleStop}
          aria-label="Detener grabación"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink/10 text-sm text-ink"
        >
          ■
        </button>
      </div>
    )
  }

  if (status === 'recorded') {
    return (
      <div className={pillClass}>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-base text-auxilio-1"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span className="flex-1 text-left">Nota de voz • {formatDuration(recordedDuration)}</span>
        <button
          type="button"
          onClick={handleDiscard}
          aria-label="Descartar nota de voz"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink/10 text-sm text-ink"
        >
          🗑️
        </button>
        <audio
          ref={audioElRef}
          src={objectUrlRef.current ?? undefined}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    )
  }

  // status === 'error'
  const isUnsupported = errorType === 'unsupported'
  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl bg-white px-5 py-4 shadow-[0_8px_22px_rgba(0,0,0,0.04)]">
      <p className="text-sm text-ink-soft">
        {isUnsupported
          ? 'Tu navegador no soporta grabación de audio.'
          : 'No pudimos acceder a tu micrófono. Revisa los permisos del navegador.'}
      </p>
      {!isUnsupported && (
        <button
          type="button"
          onClick={handleRetry}
          className="self-start rounded-full bg-ink/10 px-4 py-2 text-xs font-semibold text-ink"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
