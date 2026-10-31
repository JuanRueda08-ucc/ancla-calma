import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { crearSupabaseFalso } from '../test/supabaseFalso'

const estado = vi.hoisted(() => ({ supabase: null }))
vi.mock('../lib/supabaseClient', () => ({
  get supabase() {
    return estado.supabase
  },
}))

const SESION = { user: { id: 'usuario-prueba', email: 'prueba@calma.test' } }

async function abrirBitacora() {
  estado.supabase = crearSupabaseFalso({
    sesion: SESION,
    respuestas: {
      profiles: { data: { avatar_id: null, display_name: null }, error: null },
      bitacora_entradas: { data: { id: 'entrada-1', created_at: new Date().toISOString() }, error: null },
    },
  })
  window.history.pushState({}, '', '/bitacora')
  const { default: App } = await import('../App')
  render(<App />)
  await screen.findByRole('heading', { name: '¿Cómo te sientes?' })
  return { usuario: userEvent.setup(), supabase: estado.supabase }
}

const tituloVisible = () => screen.getByRole('heading', { level: 2 }).textContent

beforeEach(() => {
  vi.resetModules()
})

describe('Bitácora: una pregunta a la vez', () => {
  it('empieza en el paso 1 de 6 y solo muestra esa pregunta', async () => {
    await abrirBitacora()
    expect(screen.getByText(/Paso 1 de 6/)).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    expect(screen.queryByRole('heading', { name: '¿Qué ocurrió?' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument()
  })

  it('el botón dice "Saltar" si el paso está vacío y "Siguiente" si tiene algo', async () => {
    const { usuario } = await abrirBitacora()
    expect(screen.getByRole('button', { name: 'Saltar' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /Tranquilidad/ }))
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
  })

  it('se puede ir y volver sin perder lo escrito', async () => {
    const { usuario } = await abrirBitacora()
    await usuario.click(screen.getByRole('button', { name: 'Saltar' }))
    expect(tituloVisible()).toBe('¿Qué estoy sintiendo?')

    await usuario.type(screen.getByLabelText('¿Qué estoy sintiendo?', { selector: 'textarea' }), 'Un poco de ansiedad')
    await usuario.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(tituloVisible()).toBe('¿Qué ocurrió?')

    await usuario.click(screen.getByRole('button', { name: 'Atrás' }))
    expect(screen.getByLabelText('¿Qué estoy sintiendo?', { selector: 'textarea' })).toHaveValue('Un poco de ansiedad')
  })

  it('el último paso es la nota de voz con "Guardar entrada"', async () => {
    const { usuario } = await abrirBitacora()
    for (let i = 0; i < 5; i += 1) await usuario.click(screen.getByRole('button', { name: 'Saltar' }))
    expect(screen.getByText(/Paso 6 de 6/)).toBeInTheDocument()
    expect(tituloVisible()).toBe('¿Algo más que quieras decirte?')
    expect(screen.getByRole('button', { name: 'Guardar entrada' })).toBeInTheDocument()
  })

  it('"Guardar ahora" permite dejarla a medias y vuelve al inicio con todo limpio', async () => {
    const { usuario, supabase } = await abrirBitacora()
    expect(screen.queryByRole('button', { name: 'Guardar ahora' })).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /Ansiedad/ }))
    await usuario.click(screen.getByRole('button', { name: 'Siguiente' }))
    await usuario.type(screen.getByLabelText('¿Qué estoy sintiendo?', { selector: 'textarea' }), 'Nervios por mañana')
    await usuario.click(screen.getByRole('button', { name: 'Guardar ahora' }))

    expect(await screen.findByText('Entrada guardada')).toBeInTheDocument()
    expect(supabase.from).toHaveBeenCalledWith('bitacora_entradas')
    await waitFor(() => expect(tituloVisible()).toBe('¿Cómo te sientes?'))
    expect(screen.getByRole('button', { name: /Ansiedad/ })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByLabelText('¿Qué estoy sintiendo?', { selector: 'textarea' })).toHaveValue('')
  })
})
