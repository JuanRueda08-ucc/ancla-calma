import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import GuidedExerciseShell from '../components/GuidedExerciseShell'
import SiluetaCuerpo from '../components/SiluetaCuerpo'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/ejercicios'

// Zonas del cuerpo de cada paso, de la cabeza a los pies; los textos están en
// i18n/textos/ejercicios.js → relajacion.pasos (mismo orden).
const PASOS = [
  { partes: ['jaw'] },
  { partes: ['shoulders'] },
  { partes: ['armLeft', 'armRight'] },
  { partes: ['handLeft', 'handRight'] },
  { partes: ['torso'] },
  { partes: ['legLeft', 'legRight'] },
  { partes: ['footLeft', 'footRight'] },
]

// Ritmo de cada paso: tensar y sostener, luego soltar el doble de tiempo.
// Avanza solo; la pausa del shell lo detiene.
const DURACION_MS = { tensa: 5000, suelta: 10000 }
const TICK_MS = 100
const DURACION_TOTAL_S = (PASOS.length * (DURACION_MS.tensa + DURACION_MS.suelta)) / 1000

export default function EjercicioRelajacionMuscular() {
  const navigate = useNavigate()
  const textos = useTextos(TEXTOS)
  const t = textos.relajacion
  const [pasoIndex, setPasoIndex] = useState(0)
  const [fase, setFase] = useState('tensa') // 'tensa' | 'suelta'
  const [transcurrido, setTranscurrido] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [terminado, setTerminado] = useState(false)

  const esUltimoPaso = pasoIndex === PASOS.length - 1
  const paso = { ...PASOS[pasoIndex], ...t.pasos[pasoIndex] }
  const duracion = DURACION_MS[fase]
  const progreso = Math.min(1, transcurrido / duracion)
  const restanteS = Math.max(1, Math.ceil((duracion - transcurrido) / 1000))
  const hechas = PASOS.slice(0, terminado ? PASOS.length : pasoIndex).flatMap((p) => p.partes)

  const salir = () => navigate('/islas/aire/puerto-seguro')

  const siguientePaso = () => {
    setTranscurrido(0)
    setFase('tensa')
    if (esUltimoPaso) {
      setTerminado(true)
    } else {
      setPasoIndex((prev) => prev + 1)
    }
  }

  useEffect(() => {
    if (pausado || terminado) return undefined
    const id = setInterval(() => setTranscurrido((prev) => prev + TICK_MS), TICK_MS)
    return () => clearInterval(id)
  }, [pausado, terminado])

  // Fin de fase: de tensar pasa a soltar; al terminar de soltar, a la zona siguiente.
  useEffect(() => {
    if (transcurrido < duracion) return
    if (fase === 'tensa') {
      setFase('suelta')
      setTranscurrido(0)
    } else {
      siguientePaso()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcurrido, duracion, fase])

  return (
    <GuidedExerciseShell
      title={t.titulo}
      totalSteps={PASOS.length}
      // El shell anima la salida/entrada del contenido al cambiar de paso; aquí
      // el cuerpo se queda quieto entre zonas, así que solo cambia al terminar.
      currentStep={terminado ? 2 : 1}
      durationSeconds={DURACION_TOTAL_S}
      onBack={salir}
      footerLabel={t.pie}
      onPausaCambio={setPausado}
    >
      <div className="text-center">
        <SiluetaCuerpo
          zonas={terminado ? [] : paso.partes}
          hechas={hechas}
          fase={fase}
          progreso={progreso}
          pausado={pausado}
          terminado={terminado}
          etiqueta={t.cuerpo(paso.zona.toLowerCase())}
          className="mx-auto mb-5 h-[38vh] max-h-[340px] min-h-[220px] w-auto"
        />

        {terminado ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="mb-2 text-2xl font-semibold text-cielo">{t.terminadoTitulo}</h2>
            <p className="mx-auto mb-6 max-w-[380px] text-sm leading-[1.55] text-cielo/80">{t.terminadoTexto}</p>
            <button
              type="button"
              onClick={salir}
              className="rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
            >
              {textos.finalizar}
            </button>
          </motion.div>
        ) : (
          <>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-cielo/55">
              {t.zonaDe(pasoIndex + 1, PASOS.length)}
            </p>
            <h2 className="mb-3 text-[22px] font-semibold text-cielo">{paso.zona}</h2>

            {/* fase actual en grande, con su cuenta regresiva */}
            <div className="mb-3 flex items-baseline justify-center gap-2" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${pasoIndex}-${fase}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className={`text-[30px] font-bold ${fase === 'tensa' ? 'text-faro-2' : 'text-aire-accent'}`}
                >
                  {t.fases[fase]}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm font-semibold tabular-nums text-cielo/60" aria-hidden="true">
                {t.segundos(restanteS)}
              </span>
            </div>

            {/* tensar ocupa un tercio del paso y soltar dos tercios */}
            <div className="mx-auto mb-4 flex max-w-[300px] gap-1.5" aria-hidden="true">
              {['tensa', 'suelta'].map((nombre) => {
                const lleno = nombre === fase ? progreso : nombre === 'tensa' ? 1 : 0
                return (
                  <span
                    key={nombre}
                    className={`h-1.5 overflow-hidden rounded-full bg-white/15 ${nombre === 'tensa' ? 'flex-[1]' : 'flex-[2]'}`}
                  >
                    <motion.span
                      className={`block h-full rounded-full ${nombre === 'tensa' ? 'bg-faro-2' : 'bg-aire-accent'}`}
                      animate={{ width: `${lleno * 100}%` }}
                      transition={{ duration: TICK_MS / 1000, ease: 'linear' }}
                    />
                  </span>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${pasoIndex}-${fase}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="mx-auto mb-5 min-h-[76px] max-w-[420px] rounded-[20px] border border-cielo/[0.14] bg-white/[0.08] px-5 py-4 text-[15px] leading-[1.55] text-cielo/90"
              >
                {fase === 'tensa' ? paso.tensa : paso.suelta}
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={siguientePaso}
              className="rounded-full border border-cielo/30 px-7 py-3 text-sm font-semibold text-cielo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cielo/30"
            >
              {esUltimoPaso ? textos.finalizar : t.siguienteZona}
            </button>
          </>
        )}
      </div>
    </GuidedExerciseShell>
  )
}
