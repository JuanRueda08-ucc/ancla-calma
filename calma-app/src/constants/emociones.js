// Etiquetas de emoción de la bitácora. `label` es lo que se guarda en la base
// (siempre en español, para no mezclar idiomas en las entradas); cómo se
// muestra en cada idioma está en i18n/textos/bitacora.js → emociones.
export const EMOCIONES = [
  { emoji: '😌', label: 'Tranquilidad' },
  { emoji: '😟', label: 'Ansiedad' },
  { emoji: '😤', label: 'Frustración' },
  { emoji: '😴', label: 'Cansancio' },
  { emoji: '😊', label: 'Alegría' },
  { emoji: '😔', label: 'Soledad' },
  { emoji: '😨', label: 'Miedo' },
  { emoji: '☀️', label: 'Esperanza' },
  { emoji: '😵', label: 'Confusión' },
  { emoji: '🍵', label: 'Calma' },
  { emoji: '😠', label: 'Irritabilidad' },
  { emoji: '💪', label: 'Motivación' },
  { emoji: '😩', label: 'Saturación' },
  { emoji: '🥺', label: 'Nostalgia' },
  { emoji: '😌', label: 'Alivio' },
  { emoji: '😶', label: 'Desconexión' },
  { emoji: '😟', label: 'Inseguridad' },
  { emoji: '🙏', label: 'Gratitud' },
  { emoji: '😖', label: 'Estrés' },
  { emoji: '🥹', label: 'Sensibilidad' },
]

export const EMOJI_POR_EMOCION = Object.fromEntries(EMOCIONES.map((e) => [e.label, e.emoji]))
