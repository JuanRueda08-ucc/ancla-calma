import { describe, expect, it } from 'vitest'
import { agruparPorDia, etiquetaDia } from './historial'

// "Ahora" fijo (hora local): martes 3 de noviembre de 2026, 10:00
const AHORA = new Date(2026, 10, 3, 10, 0)
const en = (anio, mes, dia, hora = 12) => new Date(anio, mes, dia, hora).toISOString()

describe('etiquetaDia', () => {
  it('dice "Hoy" y "Ayer" aunque sea muy temprano o muy tarde', () => {
    expect(etiquetaDia(new Date(2026, 10, 3, 0, 5), AHORA)).toBe('Hoy')
    expect(etiquetaDia(new Date(2026, 10, 2, 23, 55), AHORA)).toBe('Ayer')
    expect(etiquetaDia(new Date(2026, 10, 2, 0, 1), AHORA)).toBe('Ayer')
  })

  it('días anteriores muestran el día de la semana y la fecha, con mayúscula inicial', () => {
    const etiqueta = etiquetaDia(new Date(2026, 9, 27, 9), AHORA)
    expect(etiqueta).toMatch(/^Martes/)
    expect(etiqueta).toMatch(/27/)
    expect(etiqueta).toMatch(/octubre/)
    expect(etiqueta).not.toMatch(/2026/)
  })

  it('si es de otro año, incluye el año', () => {
    expect(etiquetaDia(new Date(2025, 11, 31, 9), AHORA)).toMatch(/2025/)
  })
})

describe('agruparPorDia', () => {
  it('junta las entradas del mismo día y conserva el orden de la más nueva a la más vieja', () => {
    const entradas = [
      { id: 'a', fecha: en(2026, 10, 3, 9) },
      { id: 'b', fecha: en(2026, 10, 3, 8) },
      { id: 'c', fecha: en(2026, 10, 2, 20) },
      { id: 'd', fecha: en(2026, 9, 27, 9) },
    ]
    const grupos = agruparPorDia(entradas, AHORA)

    expect(grupos.map((g) => g.etiqueta.split(' ')[0])).toEqual(['Hoy', 'Ayer', 'Martes,'])
    expect(grupos.map((g) => g.entradas.map((e) => e.id))).toEqual([['a', 'b'], ['c'], ['d']])
  })

  it('sin entradas no hay grupos', () => {
    expect(agruparPorDia([], AHORA)).toEqual([])
  })
})
