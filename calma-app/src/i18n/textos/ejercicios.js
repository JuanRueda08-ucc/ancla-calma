// Puerto Seguro, la respiración de caja y los tres ejercicios guiados.
export default {
  es: {
    reanudar: 'Reanudar',
    pausar: 'Pausar',
    cerrar: 'Cerrar',
    continuar: 'Continuar',
    finalizar: 'Finalizar',
    puerto: {
      titulo: 'Puerto Seguro',
      subtitulo: 'Un refugio tranquilo para encontrar calma',
      ejercicios: [
        { title: 'Ejercicios de grounding', description: '5-4-3-2-1 para conectar con el presente' },
        { title: 'Relajación muscular', description: 'Libera la tensión de tu cuerpo' },
        { title: 'Ejercicios sensoriales', description: 'Conecta con tus sentidos' },
      ],
    },
    respiracion: {
      fases: ['Inhala…', 'Sostén…', 'Exhala…', 'Sostén…'],
      volver: 'Volver',
      silenciar: 'Silenciar',
      activarSonido: 'Activar sonido',
      titulo: 'Respiración de caja',
      subtitulo: 'Sigue el ritmo de las olas del océano',
      explicacion:
        'Esta técnica de respiración ayuda a regular el sistema nervioso y reducir el desborde emocional.',
      pie: '4 segundos cada fase • Repetición continua',
    },
    grounding: {
      titulo: 'Ejercicio de grounding',
      pie: 'Ejercicio de grounding • 3 min',
      respira: 'Respira suavemente mientras observas',
      pasos: [
        { titulo: '5 cosas que puedes ver', texto: 'Observa tu alrededor y nombra 5 cosas que puedas ver, sin apurarte.' },
        { titulo: '4 cosas que puedes tocar', texto: 'Nota la textura de algo cerca de ti: tu ropa, una superficie, tu propia piel.' },
        { titulo: '3 cosas que puedes escuchar', texto: 'Enfoca tu atención en los sonidos cercanos, incluso los más sutiles.' },
        { titulo: '2 cosas que puedes oler', texto: 'Percibe algún aroma en el ambiente, o el olor de tu propia piel o ropa.' },
        { titulo: '1 cosa que puedes saborear', texto: 'Nota el sabor en tu boca en este momento, o toma un sorbo de algo.' },
      ],
    },
    sensorial: {
      titulo: 'Ejercicios sensoriales',
      pie: 'Ejercicios sensoriales • 4 min',
      toca: 'Toca el recuadro para interactuar',
      pasos: [
        { titulo: 'Escucha atenta', texto: 'Cierra los ojos y escucha los sonidos a tu alrededor.' },
        { titulo: 'Enfoque visual', texto: 'Encuentra un objeto y observa todos sus detalles.' },
        { titulo: 'Respira el aire', texto: 'Inhala profundamente y nota si hay algún aroma en el ambiente.' },
        {
          titulo: 'Siente tu cuerpo',
          texto:
            'Nota los puntos de contacto entre tu cuerpo y la superficie donde estás: tus pies en el suelo, tu espalda en la silla.',
        },
      ],
    },
    relajacion: {
      titulo: 'Relajación muscular',
      pie: 'Relajación muscular • 5 min',
      personaje: 'Personaje pirata',
      pasos: [
        { zona: 'Hombros', texto: 'Eleva tus hombros hacia las orejas… Sostén… Suelta y relaja' },
        { zona: 'Mandíbula', texto: 'Aprieta suavemente tu mandíbula… Sostén… Relaja completamente' },
        {
          zona: 'Brazos',
          texto:
            'Tensa los músculos de tus brazos, como si los apretaras con fuerza… Sostén… Deja que caigan sueltos a tus costados',
        },
        { zona: 'Manos', texto: 'Cierra tus manos en puños apretados… Sostén… Abre los dedos y siente el alivio' },
        { zona: 'Abdomen', texto: 'Contrae suavemente los músculos de tu abdomen… Sostén… Suelta y respira profundo' },
        {
          zona: 'Piernas',
          texto:
            'Tensa los músculos de tus piernas, como si empujaras el suelo… Sostén… Suelta y siente el peso de tus piernas',
        },
        { zona: 'Pies', texto: 'Aprieta los dedos de tus pies hacia abajo… Sostén… Relaja y siente el contacto con el suelo' },
      ],
    },
  },
  en: {
    reanudar: 'Resume',
    pausar: 'Pause',
    cerrar: 'Close',
    continuar: 'Continue',
    finalizar: 'Finish',
    puerto: {
      titulo: 'Safe Harbor',
      subtitulo: 'A quiet refuge to find calm',
      ejercicios: [
        { title: 'Grounding exercises', description: '5-4-3-2-1 to connect with the present' },
        { title: 'Muscle relaxation', description: 'Release the tension in your body' },
        { title: 'Sensory exercises', description: 'Connect with your senses' },
      ],
    },
    respiracion: {
      fases: ['Breathe in…', 'Hold…', 'Breathe out…', 'Hold…'],
      volver: 'Back',
      silenciar: 'Mute',
      activarSonido: 'Turn sound on',
      titulo: 'Box breathing',
      subtitulo: 'Follow the rhythm of the ocean waves',
      explicacion: 'This breathing technique helps regulate your nervous system and ease emotional overwhelm.',
      pie: '4 seconds per phase • Continuous repetition',
    },
    grounding: {
      titulo: 'Grounding exercise',
      pie: 'Grounding exercise • 3 min',
      respira: 'Breathe gently as you notice',
      pasos: [
        { titulo: '5 things you can see', texto: 'Look around you and name 5 things you can see, without rushing.' },
        { titulo: '4 things you can touch', texto: 'Notice the texture of something near you: your clothes, a surface, your own skin.' },
        { titulo: '3 things you can hear', texto: 'Focus your attention on nearby sounds, even the faintest ones.' },
        { titulo: '2 things you can smell', texto: 'Notice any scent around you, or the smell of your own skin or clothes.' },
        { titulo: '1 thing you can taste', texto: 'Notice the taste in your mouth right now, or take a sip of something.' },
      ],
    },
    sensorial: {
      titulo: 'Sensory exercises',
      pie: 'Sensory exercises • 4 min',
      toca: 'Touch the box to interact',
      pasos: [
        { titulo: 'Careful listening', texto: 'Close your eyes and listen to the sounds around you.' },
        { titulo: 'Visual focus', texto: 'Find an object and notice every detail of it.' },
        { titulo: 'Breathe the air', texto: 'Breathe in deeply and notice whether there is any scent around you.' },
        {
          titulo: 'Feel your body',
          texto:
            'Notice the points where your body touches the surface you are on: your feet on the floor, your back against the chair.',
        },
      ],
    },
    relajacion: {
      titulo: 'Muscle relaxation',
      pie: 'Muscle relaxation • 5 min',
      personaje: 'Pirate character',
      pasos: [
        { zona: 'Shoulders', texto: 'Raise your shoulders toward your ears… Hold… Let go and relax' },
        { zona: 'Jaw', texto: 'Gently clench your jaw… Hold… Relax completely' },
        {
          zona: 'Arms',
          texto: 'Tense the muscles in your arms, as if squeezing them hard… Hold… Let them fall loose at your sides',
        },
        { zona: 'Hands', texto: 'Make tight fists with your hands… Hold… Open your fingers and feel the relief' },
        { zona: 'Belly', texto: 'Gently tighten your belly muscles… Hold… Let go and take a deep breath' },
        {
          zona: 'Legs',
          texto:
            'Tense the muscles in your legs, as if pushing against the floor… Hold… Let go and feel the weight of your legs',
        },
        { zona: 'Feet', texto: 'Curl your toes downward… Hold… Relax and feel your feet touching the floor' },
      ],
    },
  },
}
