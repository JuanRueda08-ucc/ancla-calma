import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EjercicioRelajacionMuscular from './EjercicioRelajacionMuscular'

// Las transiciones de salida (AnimatePresence) dependen de requestAnimationFrame
// y con relojes falsos terminan a destiempo: aquí el contenido cambia directo.
vi.mock('framer-motion', async (original) => ({
  ...(await original()),
  AnimatePresence: ({ children }) => children,
}))

function abrir() {
  render(
    <MemoryRouter>
      <EjercicioRelajacionMuscular />
    </MemoryRouter>,
  )
}

// La fase en curso ("Tensa 5 s" / "Suelta 9 s") va en la región aria-live.
const fase = () => document.querySelector('[aria-live]')?.textContent ?? ''

const avanzar = (ms) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe('Relajación muscular con ritmo guiado', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('cada zona pasa sola de tensar a soltar y luego a la zona siguiente', async () => {
    abrir()
    expect(screen.getByRole('heading', { name: 'Mandíbula' })).toBeInTheDocument()
    expect(fase()).toMatch(/^Tensa/)

    await avanzar(5000)
    expect(fase()).toMatch(/^Suelta/)
    expect(screen.getByRole('heading', { name: 'Mandíbula' })).toBeInTheDocument()

    await avanzar(10000)
    expect(screen.getByRole('heading', { name: 'Hombros' })).toBeInTheDocument()
    expect(screen.getByText('Zona 2 de 7')).toBeInTheDocument()
  })

  it('en pausa el ritmo se detiene', async () => {
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    await avanzar(20000)
    expect(screen.getByRole('heading', { name: 'Mandíbula' })).toBeInTheDocument()
    expect(fase()).toMatch(/^Tensa/)

    fireEvent.click(screen.getByRole('button', { name: 'Reanudar' }))
    await avanzar(5000)
    expect(fase()).toMatch(/^Suelta/)
  })

  it('"Siguiente zona" salta; después de los pies muestra el cierre', async () => {
    abrir()
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente zona' }))
      await avanzar(0)
    }
    expect(screen.getByRole('heading', { name: 'Pies' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Finalizar' }))
    await avanzar(0)
    expect(document.querySelector('h2')).toHaveTextContent('Muy bien')
  })
})
