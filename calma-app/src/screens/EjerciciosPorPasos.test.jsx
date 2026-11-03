import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EjercicioGrounding from './EjercicioGrounding'
import EjercicioSensorial from './EjercicioSensorial'

// Igual que en la relajación muscular: sin las transiciones de salida, que con
// relojes falsos terminan a destiempo.
vi.mock('framer-motion', async (original) => ({
  ...(await original()),
  AnimatePresence: ({ children }) => children,
}))

const abrir = (Pantalla) =>
  render(
    <MemoryRouter>
      <Pantalla />
    </MemoryRouter>,
  )

const avanzar = (ms) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe('ejercicios guiados que avanzan solos', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('grounding: cada paso dura 36 s (3 min en 5 pasos) y pasa al siguiente sin tocar nada', () => {
    abrir(EjercicioGrounding)
    expect(screen.getByRole('heading', { name: '5 cosas que puedes ver' })).toBeInTheDocument()
    expect(screen.getByText('Sigue en 36 s')).toBeInTheDocument()

    avanzar(36000)
    expect(screen.getByRole('heading', { name: '4 cosas que puedes tocar' })).toBeInTheDocument()
  })

  it('sensoriales: un minuto por paso, la pausa detiene el reloj y al final aparece el cierre', () => {
    abrir(EjercicioSensorial)
    expect(screen.getByRole('heading', { name: 'Escucha atenta' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    avanzar(120000)
    expect(screen.getByRole('heading', { name: 'Escucha atenta' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reanudar' }))
    avanzar(60000)
    expect(screen.getByRole('heading', { name: 'Enfoque visual' })).toBeInTheDocument()

    // de a un paso: dentro de un solo act React no vuelve a pintar entre ticks
    for (let i = 0; i < 3; i++) avanzar(60000)
    expect(screen.getByRole('heading', { name: 'Muy bien' })).toBeInTheDocument()
  })

  it('"Continuar" adelanta el paso sin esperar', () => {
    abrir(EjercicioGrounding)
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('heading', { name: '4 cosas que puedes tocar' })).toBeInTheDocument()
  })
})
