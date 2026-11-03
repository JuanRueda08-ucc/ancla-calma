export default {
  es: {
    titulo: 'Isla de las Señales',
    subtitulo: 'Reconoce las señales de malestar emocional',
    intro:
      'Cada persona vive los momentos difíciles de manera distinta. Estas pueden ser algunas señales de que podrías necesitar apoyo o acompañamiento.',
    cuantas: (n) => `${n} señales`,
    categorias: [
      {
        titulo: 'Señales emocionales',
        corto: 'Emocionales',
        senales: ['Sentir angustia', 'Irritabilidad', 'Tristeza', 'Sensación de desconexión', 'Cambios en el estado de ánimo'],
      },
      {
        titulo: 'Señales físicas',
        corto: 'Físicas',
        senales: ['Tensión corporal', 'Cansancio', 'Respiración acelerada', 'Cambios en el sueño', 'Molestias físicas'],
      },
      {
        titulo: 'Señales cognitivas',
        corto: 'Cognitivas',
        senales: ['Pensamientos repetitivos', 'Dificultad para concentrarse', 'Sensación de confusión', 'Preocupación constante'],
      },
      {
        titulo: 'Señales conductuales',
        corto: 'Conductuales',
        senales: ['Aislamiento', 'Evitar actividades', 'Dificultad para comunicarse', 'Cambios en rutinas'],
      },
    ],
    teReconoces: '¿Te reconoces en algunas?',
    pasos: [
      { titulo: 'Respirar un momento', descripcion: 'Bajar el ritmo con la respiración de las olas' },
      { titulo: 'Buscar apoyo', descripcion: 'Tus personas de confianza y líneas de ayuda' },
    ],
    aviso:
      'Estas señales son orientativas, no definitorias. Si sientes que necesitas apoyo, está bien buscarlo.',
  },
  en: {
    titulo: 'Island of Signs',
    subtitulo: 'Recognize the signs of emotional distress',
    intro:
      'Everyone goes through hard moments in their own way. These may be some signs that you could use support or someone by your side.',
    cuantas: (n) => `${n} signs`,
    categorias: [
      {
        titulo: 'Emotional signs',
        corto: 'Emotional',
        senales: ['Feeling distressed', 'Irritability', 'Sadness', 'Feeling disconnected', 'Mood changes'],
      },
      {
        titulo: 'Physical signs',
        corto: 'Physical',
        senales: ['Body tension', 'Tiredness', 'Rapid breathing', 'Changes in sleep', 'Physical discomfort'],
      },
      {
        titulo: 'Cognitive signs',
        corto: 'Cognitive',
        senales: ['Repetitive thoughts', 'Trouble concentrating', 'Feeling confused', 'Constant worry'],
      },
      {
        titulo: 'Behavioral signs',
        corto: 'Behavioral',
        senales: ['Withdrawing from others', 'Avoiding activities', 'Difficulty communicating', 'Changes in routines'],
      },
    ],
    teReconoces: 'Do you recognize some of these?',
    pasos: [
      { titulo: 'Take a breath', descripcion: 'Slow down with the breathing of the waves' },
      { titulo: 'Look for support', descripcion: 'Your trusted people and helplines' },
    ],
    aviso: "These signs are a guide, not a diagnosis. If you feel you need support, it's okay to look for it.",
  },
}
