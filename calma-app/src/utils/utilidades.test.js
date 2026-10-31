import { describe, expect, it } from 'vitest'
import { construirLinkMapa, construirLinkWhatsApp } from './compartirUbicacion'
import { normalizarTelefono } from './contactosStorage'
import {
  DURACIONES_MIN,
  construirEnlaceSeguimiento,
  distanciaMetros,
  etiquetaDuracion,
} from './ubicacionEnVivo'

describe('compartirUbicacion', () => {
  it('arma el enlace de Google Maps con la posición', () => {
    expect(construirLinkMapa(4.6097, -74.0817)).toBe('https://maps.google.com/?q=4.6097,-74.0817')
  })

  it('wa.me solo acepta dígitos: quita +, espacios, guiones y paréntesis', () => {
    expect(construirLinkWhatsApp('+57 (300) 123-4567', '')).toBe('https://wa.me/573001234567')
  })

  it('sin mensaje no agrega ?text=', () => {
    expect(construirLinkWhatsApp('+573001234567', '')).not.toContain('?text=')
  })

  it('codifica el mensaje para la URL', () => {
    expect(construirLinkWhatsApp('+573001234567', 'Hola, ¿estás?')).toBe(
      'https://wa.me/573001234567?text=Hola%2C%20%C2%BFest%C3%A1s%3F',
    )
  })
})

describe('normalizarTelefono', () => {
  it('conserva el + del código de país y quita el resto de símbolos', () => {
    expect(normalizarTelefono(' +57 300-123 4567 ')).toBe('+573001234567')
  })

  it('sin + devuelve solo dígitos', () => {
    expect(normalizarTelefono('(300) 123 4567')).toBe('3001234567')
  })
})

describe('ubicacionEnVivo', () => {
  it('las duraciones son exactamente 15 min, 1 h y 4 h (igual que la base de datos)', () => {
    expect(DURACIONES_MIN).toEqual([15, 60, 240])
  })

  it('muestra la duración en minutos u horas', () => {
    expect(etiquetaDuracion(15)).toBe('15 min')
    expect(etiquetaDuracion(60)).toBe('1 h')
    expect(etiquetaDuracion(240)).toBe('4 h')
  })

  it('el enlace de seguimiento usa el origen actual y el token', () => {
    expect(construirEnlaceSeguimiento('abc123')).toBe(`${window.location.origin}/ubicacion/abc123`)
  })

  it('la distancia entre el mismo punto es 0', () => {
    expect(distanciaMetros({ lat: 4.6, lng: -74.08 }, { lat: 4.6, lng: -74.08 })).toBe(0)
  })

  it('calcula distancias reales con un margen razonable', () => {
    // ~111 km por grado de latitud
    expect(distanciaMetros({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111195, -2)
    // dos puntos del centro de Bogotá a ~335 m
    const metros = distanciaMetros({ lat: 4.6097, lng: -74.0817 }, { lat: 4.6125, lng: -74.0805 })
    expect(metros).toBeGreaterThan(300)
    expect(metros).toBeLessThan(370)
  })
})
