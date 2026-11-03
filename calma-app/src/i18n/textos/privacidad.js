// Política de privacidad. Cada sección es una lista de bloques: { fuerte, texto }
// es un párrafo con su inicio en negrita (fuerte puede ir vacío). La versión en
// español es la que rige; la inglesa lo aclara en `notaTraduccion`.
export default {
  es: {
    titulo: 'Política de privacidad',
    actualizacion: 'Última actualización: 31 de octubre de 2026',
    notaTraduccion: '',
    intro:
      'Esta política describe qué información recoge Calma (Proyecto ANCLA), para qué la usa, y qué derechos tienes sobre ella. Está escrita para ser honesta sobre lo que la app realmente hace, no un texto genérico.',
    responsableTitulo: 'Quién es responsable de tus datos',
    responsableTexto:
      'Calma es desarrollada por Juan José Rueda Viveros, como parte del Proyecto ANCLA. Si tienes preguntas sobre tus datos, escribe a:',
    secciones: [
      {
        titulo: 'Qué información recogemos',
        bloques: [
          { fuerte: 'Cuenta', texto: ': tu correo electrónico, usado únicamente para iniciar sesión y confirmar tu identidad.' },
          {
            fuerte: 'Contactos de confianza',
            texto:
              ': el nombre y teléfono de las personas que decidas agregar. Solo se usan para que tú puedas llamarlas o compartirles tu ubicación por WhatsApp — nunca se comparten con nadie más ni se usan para ningún otro fin.',
          },
          {
            fuerte: 'Bitácora emocional',
            texto:
              ': las emociones que selecciones, el texto que escribas (en tus propias palabras o por transcripción de voz), y si grabaste una nota de voz, el audio de esa nota.',
          },
          {
            fuerte: 'Transcripción por voz',
            texto:
              ': el botón de micrófono en cada pregunta de la bitácora usa la función de reconocimiento de voz de tu propio navegador (no un servicio nuestro). Esto significa que, dependiendo de qué navegador uses, el audio de tu voz se procesa en los servidores de Google (Chrome, Edge) o Apple (Safari) para convertirlo a texto, antes de devolvértelo. No tenemos control sobre ese procesamiento ni acceso a él — ocurre entre tu navegador y esas empresas. Si prefieres no usar esta función, puedes escribir directamente en cada campo sin usar el micrófono.',
          },
          {
            fuerte: 'Ubicación en vivo (solo si la activas)',
            texto:
              ': cuando usas "Compartir ubicación en vivo", guardamos tu posición más reciente —solo el último punto, nunca un recorrido— durante el tiempo que elijas (15 minutos, 1 hora o 4 horas), para que las personas a las que les envíes el enlace puedan verla junto con tu nombre de usuario. Cualquiera que tenga ese enlace puede verla mientras esté activa, así que envíalo solo a personas de confianza. Al detenerla o cuando se acaba el tiempo, tu ubicación se borra y el enlace deja de funcionar.',
          },
          {
            fuerte: 'Idioma y tema',
            texto:
              ': el idioma y el tema (noche o día) que elijas se guardan solo en tu navegador, no en tu cuenta ni en nuestros servidores.',
          },
        ],
      },
      {
        titulo: 'Qué NO recogemos ni guardamos',
        bloques: [
          {
            fuerte: '"Compartir mi ubicación" (una sola vez) no guarda tu ubicación.',
            texto:
              ' La calculamos una sola vez, armamos el link para enviarte a WhatsApp, y la descartamos de inmediato — no queda registrada en ningún lugar, ni en tu dispositivo ni en nuestros servidores. Tampoco seguimos tu ubicación en segundo plano: la ubicación en vivo solo funciona mientras tú la activas y Calma está abierta.',
          },
          {
            fuerte: '',
            texto:
              'No mostramos publicidad ni vendemos, alquilamos o compartimos tu información con terceros con fines comerciales.',
          },
        ],
      },
      {
        titulo: 'Dónde se almacena tu información',
        bloques: [
          {
            fuerte: '',
            texto:
              'Tus datos (contactos, entradas de bitácora, audio de notas de voz) se guardan en Supabase, un proveedor de base de datos con seguridad a nivel de fila (Row Level Security): esto significa que, técnicamente, solo tu cuenta puede leer o modificar tus propios datos — ni siquiera otro usuario de Calma puede acceder a ellos.',
          },
          {
            fuerte: '',
            texto:
              'Tu sesión de acceso se guarda en el almacenamiento local de tu navegador, para que no tengas que iniciar sesión cada vez que abres la app.',
          },
        ],
      },
    ],
    derechosTitulo: 'Tus derechos sobre tu información',
    derechosIntro:
      'De acuerdo con la Ley 1581 de 2012 (Habeas Data, Colombia), tienes derecho a conocer, actualizar, corregir y solicitar la eliminación de tu información personal.',
    derechos: [
      {
        fuerte: 'Contactos de confianza y entradas de tu bitácora',
        texto:
          ': puedes eliminarlos individualmente en cualquier momento, directamente desde la app (Isla del Auxilio y tu Historial, respectivamente).',
      },
      {
        fuerte: 'Eliminar tu cuenta por completo',
        texto:
          ': puedes hacerlo tú mismo/a en cualquier momento desde Mi perfil → Zona de peligro. Esto borra de inmediato y de forma permanente tu cuenta, tus contactos de confianza, y toda tu bitácora (incluyendo las notas de voz). No hay forma de deshacer esta acción, así que la app te pide escribir una palabra de confirmación antes de proceder.',
      },
    ],
    cambiosTitulo: 'Cambios a esta política',
    cambiosTexto:
      'Si esta política cambia de forma importante, lo indicaremos actualizando la fecha al inicio de este documento.',
  },
  en: {
    titulo: 'Privacy policy',
    actualizacion: 'Last updated: October 31, 2026',
    notaTraduccion:
      'This is a translation for your convenience. The Spanish version of this policy is the one that legally applies.',
    intro:
      'This policy describes what information Calma (Proyecto ANCLA) collects, what it is used for, and what rights you have over it. It is written to be honest about what the app actually does, not as generic boilerplate.',
    responsableTitulo: 'Who is responsible for your data',
    responsableTexto:
      'Calma is developed by Juan José Rueda Viveros as part of Proyecto ANCLA. If you have questions about your data, write to:',
    secciones: [
      {
        titulo: 'What information we collect',
        bloques: [
          { fuerte: 'Account', texto: ': your email address, used only to sign in and confirm your identity.' },
          {
            fuerte: 'Trusted contacts',
            texto:
              ': the name and phone number of the people you choose to add. They are only used so you can call them or share your location with them on WhatsApp — they are never shared with anyone else or used for any other purpose.',
          },
          {
            fuerte: 'Emotional journal',
            texto:
              ': the emotions you select, the text you write (in your own words or by voice dictation), and, if you recorded a voice note, the audio of that note.',
          },
          {
            fuerte: 'Voice dictation',
            texto:
              ": the microphone button on each journal question uses your own browser's speech recognition (not a service of ours). This means that, depending on which browser you use, the audio of your voice is processed on Google's servers (Chrome, Edge) or Apple's (Safari) to turn it into text before it is returned to you. We have no control over or access to that processing — it happens between your browser and those companies. If you prefer not to use this feature, you can type directly into each field without using the microphone.",
          },
          {
            fuerte: 'Live location (only if you turn it on)',
            texto:
              ': when you use "Share live location", we store your most recent position —only the latest point, never a route— for the time you choose (15 minutes, 1 hour or 4 hours), so the people you send the link to can see it along with your username. Anyone who has that link can see it while it is active, so only send it to people you trust. When you stop it or the time runs out, your location is deleted and the link stops working.',
          },
          {
            fuerte: 'Language and theme',
            texto:
              ': the language and theme (night or day) you choose are stored only in your browser, not in your account or on our servers.',
          },
        ],
      },
      {
        titulo: 'What we do NOT collect or store',
        bloques: [
          {
            fuerte: '"Share my location" (one time) does not store your location.',
            texto:
              ' We calculate it once, build the link to send you to WhatsApp, and discard it immediately — it is not recorded anywhere, neither on your device nor on our servers. We also do not track your location in the background: live location only works while you turn it on and Calma is open.',
          },
          {
            fuerte: '',
            texto: 'We do not show ads, and we do not sell, rent or share your information with third parties for commercial purposes.',
          },
        ],
      },
      {
        titulo: 'Where your information is stored',
        bloques: [
          {
            fuerte: '',
            texto:
              'Your data (contacts, journal entries, voice note audio) is stored in Supabase, a database provider with Row Level Security: this means that, technically, only your account can read or change your own data — not even another Calma user can access it.',
          },
          {
            fuerte: '',
            texto:
              "Your sign-in session is stored in your browser's local storage, so you don't have to sign in every time you open the app.",
          },
        ],
      },
    ],
    derechosTitulo: 'Your rights over your information',
    derechosIntro:
      'Under Law 1581 of 2012 (Habeas Data, Colombia), you have the right to know, update, correct and request the deletion of your personal information.',
    derechos: [
      {
        fuerte: 'Trusted contacts and journal entries',
        texto:
          ': you can delete them one by one at any time, directly from the app (Island of Aid and your History, respectively).',
      },
      {
        fuerte: 'Deleting your whole account',
        texto:
          ': you can do it yourself at any time from My profile → Danger zone. This immediately and permanently deletes your account, your trusted contacts and your whole journal (including voice notes). This action cannot be undone, so the app asks you to type a confirmation word before going ahead.',
      },
    ],
    cambiosTitulo: 'Changes to this policy',
    cambiosTexto:
      'If this policy changes in an important way, we will show it by updating the date at the top of this document.',
  },
}
