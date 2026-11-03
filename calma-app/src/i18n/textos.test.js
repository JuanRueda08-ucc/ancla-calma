import { describe, expect, it } from 'vitest'

// Cada archivo de textos tiene que tener exactamente la misma forma en los
// dos idiomas: una clave que falta en inglés se vería como un hueco vacío.
const archivos = import.meta.glob('./textos/*.js', { eager: true })

function forma(valor) {
  if (Array.isArray(valor)) return valor.map(forma)
  if (typeof valor === 'function') return `función(${valor.length})`
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.keys(valor).sort().map((clave) => [clave, forma(valor[clave])]))
  }
  return typeof valor
}

describe('textos en español e inglés', () => {
  it('hay archivos de textos', () => {
    expect(Object.keys(archivos).length).toBeGreaterThan(10)
  })

  for (const [ruta, modulo] of Object.entries(archivos)) {
    it(`${ruta} tiene las mismas claves en los dos idiomas`, () => {
      const { es, en } = modulo.default
      expect(forma(en)).toEqual(forma(es))
    })
  }
})
