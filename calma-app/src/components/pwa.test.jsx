import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AvisoSinConexion from './AvisoSinConexion'
import InstalarApp from './InstalarApp'

const UA_ORIGINAL = window.navigator.userAgent

function simularNavegador(userAgent) {
  Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true })
}

afterEach(() => {
  simularNavegador(UA_ORIGINAL)
})

describe('AvisoSinConexion', () => {
  it('aparece al perder la conexión y se va al recuperarla', () => {
    render(<AvisoSinConexion />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => window.dispatchEvent(new Event('offline')))
    expect(screen.getByRole('status')).toHaveTextContent('Sin conexión')

    act(() => window.dispatchEvent(new Event('online')))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('es parte del flujo de la página (no flota), para no tapar "Volver"', () => {
    render(<AvisoSinConexion />)
    act(() => window.dispatchEvent(new Event('offline')))
    expect(screen.getByRole('status').className).not.toMatch(/\b(fixed|absolute)\b/)
  })
})

describe('InstalarApp', () => {
  it('en iPhone explica Compartir → Agregar a pantalla de inicio', () => {
    simularNavegador('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1')
    render(<InstalarApp />)
    expect(screen.getByText('Agregar a pantalla de inicio')).toBeInTheDocument()
  })

  it('al cerrarla no vuelve a aparecer', async () => {
    const usuario = userEvent.setup()
    simularNavegador('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1')
    const { unmount } = render(<InstalarApp />)
    await usuario.click(screen.getByRole('button', { name: 'No mostrar de nuevo' }))
    // tiene animación de salida: se espera a que termine
    await waitFor(() => expect(screen.queryByText('Lleva Calma en tu teléfono')).not.toBeInTheDocument())
    expect(localStorage.getItem('calma:instalar-descartado')).toBe('1')

    unmount()
    render(<InstalarApp />)
    expect(screen.queryByText('Lleva Calma en tu teléfono')).not.toBeInTheDocument()
  })

  it('en Android muestra "Instalar" solo cuando el navegador lo permite y abre su diálogo', async () => {
    const usuario = userEvent.setup()
    simularNavegador('Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36')
    render(<InstalarApp />)
    expect(screen.queryByRole('button', { name: 'Instalar' })).not.toBeInTheDocument()

    const evento = new Event('beforeinstallprompt')
    evento.prompt = vi.fn()
    evento.userChoice = Promise.resolve({ outcome: 'accepted' })
    act(() => window.dispatchEvent(evento))

    await usuario.click(screen.getByRole('button', { name: 'Instalar' }))
    expect(evento.prompt).toHaveBeenCalledOnce()
  })

  it('no aparece si la app ya está instalada', () => {
    simularNavegador('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1')
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(display-mode: standalone)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<InstalarApp />)
    expect(screen.queryByText('Lleva Calma en tu teléfono')).not.toBeInTheDocument()
    window.matchMedia = original
  })
})
