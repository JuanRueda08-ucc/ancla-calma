import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { crearSupabaseFalso } from './test/supabaseFalso'

// Supabase falso: cada prueba arma el suyo (con o sin sesión) antes de
// importar la app. Nunca se habla con la base real.
const estado = vi.hoisted(() => ({ supabase: null }))
vi.mock('./lib/supabaseClient', () => ({
  get supabase() {
    return estado.supabase
  },
}))

async function abrirApp(ruta, { sesion = null, respuestas = {}, retrasoLoginMs = 0 } = {}) {
  estado.supabase = crearSupabaseFalso({ sesion, respuestas, retrasoLoginMs })
  window.history.pushState({}, '', ruta)
  const { default: App } = await import('./App')
  render(<App />)
  return estado.supabase
}

const SESION = { user: { id: 'usuario-prueba', email: 'prueba@calma.test' } }

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('navegación', () => {
  it('una dirección que no existe lleva al inicio, no a una página en blanco', async () => {
    await abrirApp('/esta-ruta-no-existe')
    expect(await screen.findByRole('heading', { level: 1, name: 'Calma' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('una pantalla protegida sin sesión manda al login recordando de dónde venía', async () => {
    await abrirApp('/bitacora')
    expect(await screen.findByRole('heading', { name: 'Bienvenido de vuelta' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
    expect(window.history.state?.usr?.from).toBe('/bitacora')
  })

  it('después de iniciar sesión vuelve a la pantalla de origen, no a /islas', async () => {
    const usuario = userEvent.setup()
    // Red lenta: la sesión llega antes que la respuesta del login. Era el caso
    // del error real (Login redirigía a /islas apenas veía la sesión).
    await abrirApp('/islas/faro', {
      respuestas: { herramientas_faro: { data: [], error: null } },
      retrasoLoginMs: 5000,
    })

    await screen.findByRole('heading', { name: 'Bienvenido de vuelta' })
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'prueba@calma.test')
    await usuario.type(screen.getByLabelText('Contraseña'), 'contrasena-de-prueba')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(window.location.pathname).toBe('/islas/faro'))
    expect(await screen.findByRole('heading', { name: 'Tu faro' })).toBeInTheDocument()
  })

  it('con sesión, entrar a /login sin origen lleva a /islas', async () => {
    await abrirApp('/login', { sesion: SESION })
    await waitFor(() => expect(window.location.pathname).toBe('/islas'))
  })
})

describe('Isla del Auxilio sin sesión', () => {
  it('abre sin pedir cuenta y muestra las líneas de ayuda listas para llamar', async () => {
    await abrirApp('/islas/auxilio')

    expect(await screen.findByRole('heading', { level: 1, name: 'Isla del Auxilio' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/islas/auxilio')
    expect(screen.getByRole('link', { name: /Bienestar Te Escucha/ })).toHaveAttribute('href', 'tel:018000113113')
    expect(screen.getByRole('link', { name: /Línea de la Vida/ })).toHaveAttribute('href', 'tel:106')
  })

  it('en contactos invita a iniciar sesión y no ofrece la ubicación en vivo', async () => {
    await abrirApp('/islas/auxilio')

    expect(await screen.findByText(/inicia sesión\.$/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
    expect(screen.queryByText('Compartir ubicación en vivo')).not.toBeInTheDocument()
  })
})

describe('Isla del Auxilio con sesión: marcación rápida', () => {
  const contacto = (id, nombre, telefono) => ({ id, nombre, telefono })
  const conContactos = (lista) => ({
    sesion: SESION,
    respuestas: {
      contactos_confianza: { data: lista, error: null },
      ubicaciones_en_vivo: { data: null, error: null },
      profiles: { data: { avatar_id: null, display_name: null }, error: null },
    },
  })

  it('cada contacto es un círculo que llama de un toque', async () => {
    await abrirApp('/islas/auxilio', conContactos([contacto('1', 'Mamá', '+57 300 111 2233')]))
    const llamar = await screen.findByRole('link', { name: 'Llamar a Mamá' })
    expect(llamar).toHaveAttribute('href', 'tel:+573001112233')
    expect(screen.getByRole('button', { name: 'Agregar contacto de confianza' })).toBeInTheDocument()
  })

  it('con 3 contactos ya no ofrece agregar otro', async () => {
    await abrirApp(
      '/islas/auxilio',
      conContactos([contacto('1', 'Ana', '+571'), contacto('2', 'Beto', '+572'), contacto('3', 'Caro', '+573')]),
    )
    await screen.findByRole('link', { name: 'Llamar a Caro' })
    expect(screen.queryByRole('button', { name: 'Agregar contacto de confianza' })).not.toBeInTheDocument()
  })

  it('"Administrar" muestra Editar y Eliminar con confirmación en dos pasos', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/islas/auxilio', conContactos([contacto('1', 'Mamá', '+573001112233')]))
    await usuario.click(await screen.findByRole('button', { name: 'Administrar' }))

    expect(screen.queryByRole('link', { name: 'Llamar a Mamá' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar a Mamá' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Eliminar a Mamá' }))
    expect(screen.getByRole('button', { name: '¿Eliminar?' })).toBeInTheDocument()
  })

  it('todo lo que llama muestra el ícono de teléfono (contactos y líneas de ayuda)', async () => {
    await abrirApp('/islas/auxilio', conContactos([contacto('1', 'Mamá', '+573001112233')]))
    await screen.findByRole('link', { name: 'Llamar a Mamá' })
    const enlacesQueLlaman = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('tel:'))
    expect(enlacesQueLlaman).toHaveLength(3)
    for (const enlace of enlacesQueLlaman) expect(enlace.querySelector('svg')).not.toBeNull()
  })

  it('las líneas de ayuda van en una barra fija abajo, también con sesión', async () => {
    await abrirApp('/islas/auxilio', conContactos([]))
    const linea = await screen.findByRole('link', { name: /Línea de la Vida/ })
    expect(linea.closest('section').className).toMatch(/\bfixed\b/)
    expect(linea.closest('section').className).toMatch(/\bbottom-0\b/)
  })
})

describe('"Volver" regresa a la pantalla de origen entre secciones', () => {
  it('Señales → Respirar un momento → Volver regresa a Señales', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/islas/senales')
    await usuario.click(await screen.findByRole('button', { name: /Respirar un momento/ }))
    await screen.findByRole('heading', { name: 'Respiración de caja' })

    await usuario.click(screen.getByRole('button', { name: 'Volver' }))
    await waitFor(() => expect(window.location.pathname).toBe('/islas/senales'))
  })

  it('Señales → Buscar apoyo → Volver regresa a Señales', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/islas/senales')
    await usuario.click(await screen.findByRole('button', { name: /Buscar apoyo/ }))
    await screen.findByRole('heading', { level: 1, name: 'Isla del Auxilio' })
    expect(screen.getByRole('link', { name: /Volver/ })).toHaveAttribute('href', '/islas/senales')
  })

  it('Isla del Aire → Escribir en la bitácora → Volver regresa a la Isla del Aire', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/islas/aire', {
      sesion: SESION,
      respuestas: { profiles: { data: { avatar_id: null, display_name: null }, error: null } },
    })
    await usuario.click(await screen.findByRole('button', { name: /Escribir en la bitácora/ }))
    await screen.findByRole('heading', { name: '¿Cómo te sientes?' })
    expect(screen.getByRole('link', { name: /Volver/ })).toHaveAttribute('href', '/islas/aire')
  })

  it('entrando directo, cada pantalla vuelve a su lugar de siempre', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/islas/aire/respiracion')
    await screen.findByRole('heading', { name: 'Respiración de caja' })
    await usuario.click(screen.getByRole('button', { name: 'Volver' }))
    await waitFor(() => expect(window.location.pathname).toBe('/islas/aire'))
  })
})

describe('Panel de Acompañamiento con pestañas', () => {
  const contenidoVisible = () => screen.getByRole('tabpanel')

  it('abre en "Ahora", con tu persona y qué decir a la vista', async () => {
    await abrirApp('/acompanamiento')
    await screen.findByRole('heading', { name: 'Panel de Acompañamiento' })

    expect(screen.getByRole('tab', { name: 'Ahora' })).toHaveAttribute('aria-selected', 'true')
    expect(within(contenidoVisible()).getByRole('heading', { name: 'Tu persona' })).toBeInTheDocument()
    expect(within(contenidoVisible()).getByRole('button', { name: 'Copiar: Estoy aquí contigo.' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Entender las señales' })).not.toBeInTheDocument()
  })

  it('cada pestaña muestra solo su contenido', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/acompanamiento')
    await screen.findByRole('heading', { name: 'Panel de Acompañamiento' })

    await usuario.click(screen.getByRole('tab', { name: 'Señales' }))
    expect(within(contenidoVisible()).getByRole('heading', { name: 'Entender las señales' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Tu persona' })).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('tab', { name: 'Guía' }))
    expect(within(contenidoVisible()).getByRole('button', { name: /Principios clave/ })).toBeInTheDocument()
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
  })

  const conDosContactos = {
    sesion: SESION,
    respuestas: {
      contactos_confianza: {
        data: [
          { id: '1', nombre: 'Mamá', telefono: '+57 300 111 2233' },
          { id: '2', nombre: 'Andrés Gómez', telefono: '+57 311 444 5566' },
        ],
        error: null,
      },
      ubicaciones_en_vivo: { data: null, error: null },
      profiles: { data: { avatar_id: null, display_name: null }, error: null },
    },
  }

  it('en "Ahora" se ve cada contacto con su nombre, llamar y mensaje', async () => {
    await abrirApp('/acompanamiento', conDosContactos)
    const panel = await screen.findByRole('tabpanel')

    expect(await within(panel).findByText('Mamá')).toBeInTheDocument()
    expect(within(panel).getByText('Andrés Gómez')).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Llamar a Mamá' })).toHaveAttribute('href', 'tel:+573001112233')
    expect(within(panel).getByRole('link', { name: 'Llamar a Andrés Gómez' })).toHaveAttribute('href', 'tel:+573114445566')
    expect(within(panel).getByRole('button', { name: 'Escribir a Mamá por WhatsApp' })).toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: 'Llamar' })).not.toBeInTheDocument()
  })

  it('"Editar contactos" lleva a la Isla del Auxilio y su "Volver" regresa al Panel', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/acompanamiento', conDosContactos)
    await usuario.click(await screen.findByRole('button', { name: /Editar contactos/ }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Isla del Auxilio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Volver/ })).toHaveAttribute('href', '/acompanamiento')
  })

  it('entrando directo a la Isla del Auxilio, "Volver" sigue llevando a las islas', async () => {
    await abrirApp('/islas/auxilio')
    await screen.findByRole('heading', { level: 1, name: 'Isla del Auxilio' })
    expect(screen.getByRole('link', { name: /Volver/ })).toHaveAttribute('href', '/islas')
  })

  it('las pestañas se recorren con las flechas del teclado', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/acompanamiento')
    await screen.findByRole('heading', { name: 'Panel de Acompañamiento' })

    screen.getByRole('tab', { name: 'Ahora' }).focus()
    await usuario.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Señales' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Señales' })).toHaveAttribute('aria-selected', 'true')
    await usuario.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Guía' })).toHaveAttribute('aria-selected', 'true')
    await usuario.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Ahora' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('acordeones: una sola sección abierta a la vez', () => {
  const abiertas = () =>
    screen
      .getAllByRole('button', { expanded: true })
      .filter((boton) => boton.getAttribute('aria-controls')?.startsWith('acordeon-'))
      .map((boton) => within(boton).getByText(/./, { selector: 'span.flex-1' }).textContent)

  it('en la Isla de las Señales (mosaico), elegir una ficha muestra solo sus señales', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/islas/senales')
    await screen.findByRole('heading', { name: 'Isla de las Señales' })

    const fichas = screen.getAllByRole('button', { pressed: true }).concat(screen.getAllByRole('button', { pressed: false }))
    expect(fichas.filter((b) => b.getAttribute('aria-controls') === 'senales-detalle')).toHaveLength(4)
    expect(screen.getByRole('button', { name: /Emocionales/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Sentir angustia')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /Físicas/ }))
    expect(screen.getByRole('button', { name: /Físicas/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Emocionales/ })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('heading', { name: 'Señales físicas' })).toBeInTheDocument()
    expect(screen.getByText('Tensión corporal')).toBeInTheDocument()
    expect(screen.queryByText('Sentir angustia')).not.toBeInTheDocument()

    // tocar la ficha ya elegida la deja elegida (siempre hay una a la vista)
    await usuario.click(screen.getByRole('button', { name: /Físicas/ }))
    expect(screen.getByRole('button', { name: /Físicas/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('en el Panel de Acompañamiento también, en la pestaña Guía', async () => {
    const usuario = userEvent.setup()
    await abrirApp('/acompanamiento')
    await screen.findByRole('heading', { name: 'Panel de Acompañamiento' })

    await usuario.click(screen.getByRole('tab', { name: 'Guía' }))
    await usuario.click(screen.getByRole('button', { name: /Qué evitar/ }))
    expect(abiertas()).toEqual(['Qué evitar'])
    await usuario.click(screen.getByRole('button', { name: /Cómo acompañar/ }))
    expect(abiertas()).toEqual(['Cómo acompañar'])
  })

  it('el Panel sin sesión pide iniciar sesión en la tarjeta de tu persona', async () => {
    await abrirApp('/acompanamiento')
    expect(await screen.findByText('Se requiere inicio de sesión para añadir contactos.')).toBeInTheDocument()
  })
})
