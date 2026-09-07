import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle, Geometry } from 'ogl'

const MAX_RIPPLES = 12
const RIPPLE_LIFETIME = 2.0
const PARTICLE_COUNT = 60

// WebGL reporta los uniform arrays (u_rippleOrigins[12], etc.) como uniforms
// individuales por índice (u_rippleOrigins[0], u_rippleOrigins[1]...) y nunca
// reciben valor real vía OGL. Se generan en su lugar 12 pares de uniforms
// nombrados (u_ripple{i}Origin / u_ripple{i}Time), programáticamente, no a mano.
const RIPPLE_UNIFORMS_GLSL = Array.from(
  { length: MAX_RIPPLES },
  (_, i) => `uniform vec2 u_ripple${i}Origin;\n  uniform float u_ripple${i}Time;`,
).join('\n  ')

// Un tiempo de inicio "sentinela" (-1000, ver initRippleUniforms más abajo) indica
// que ese slot no tiene ripple activo — edad quedará muy fuera de [0, RIPPLE_LIFETIME].
const RIPPLE_GLOW_BLOCKS_GLSL = Array.from(
  { length: MAX_RIPPLES },
  (_, i) => `
    {
      float edad = u_time - u_ripple${i}Time;
      if (edad >= 0.0 && edad <= ${RIPPLE_LIFETIME.toFixed(1)}) {
        float radio = edad * speed;
        float dist = distance(uv, u_ripple${i}Origin);
        float ring = smoothstep(radio - thickness, radio, dist) - smoothstep(radio, radio + thickness, dist);
        float intensidadRipple = 1.0 - edad / ${RIPPLE_LIFETIME.toFixed(1)};
        total += ring * intensidadRipple;
      }
    }`,
).join('\n')

const RIPPLE_BOOST_BLOCKS_GLSL = Array.from(
  { length: MAX_RIPPLES },
  (_, i) => `
    {
      float edad = u_time - u_ripple${i}Time;
      if (edad >= 0.0 && edad <= ${RIPPLE_LIFETIME.toFixed(1)}) {
        float d = distance(uv, u_ripple${i}Origin);
        float proximity = 1.0 - smoothstep(0.0, 0.28, d);
        float fade = 1.0 - edad / ${RIPPLE_LIFETIME.toFixed(1)};
        boost = max(boost, proximity * fade);
      }
    }`,
).join('\n')

const VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

// El ruido simplex 3D inline es la implementación estándar de Ashima Arts / Ian
// McEwan (webgl-noise, MIT) — se usa u_time como tercera dimensión para animarlo.
const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_intensity;
  ${RIPPLE_UNIFORMS_GLSL}

  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Anillo de luz que crece y se desvanece durante RIPPLE_LIFETIME segundos.
  vec3 rippleGlow(vec2 uv) {
    vec3 total = vec3(0.0);
    const float speed = 0.32;
    const float thickness = 0.035;
${RIPPLE_GLOW_BLOCKS_GLSL}

    return total;
  }

  void main() {
    vec2 uv = vec2(vUv.x * (u_resolution.x / u_resolution.y), vUv.y);
    float t = u_time * 0.05;

    // 3 octavas animadas a distinta frecuencia/velocidad/peso para simular caustics.
    float n1 = snoise(vec3(uv * 2.0, t));
    float n2 = snoise(vec3(uv * 4.0 + 10.0, t * 1.4));
    float n3 = snoise(vec3(uv * 8.0 + 20.0, t * 2.1));

    float caustics = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    caustics = caustics * 0.5 + 0.5;
    caustics = pow(clamp(caustics, 0.0, 1.0), 3.0);

    vec3 navy = vec3(0.0, 0.1804, 0.4196);
    vec3 teal = vec3(0.4353, 0.8902, 0.8392);

    vec3 color = mix(navy, teal, caustics * u_intensity);

    // Luz cálida (blanco con tinte teal) sumada de forma aditiva y suave, no un overlay plano.
    vec3 warmLight = vec3(0.9, 0.98, 0.96);
    color += rippleGlow(uv) * warmLight * 0.55;

    gl_FragColor = vec4(color, 1.0);
  }
`

// Partículas ambientales tipo "plancton bioluminiscente": derivan lento hacia arriba y
// se reciclan abajo. Comparten los mismos uniforms de ripple que el fondo (Prompt B)
// para brillar levemente cerca de una interacción reciente.
const PARTICLE_VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute float aSeed;
  attribute float aSize;

  uniform float u_time;
  uniform float u_dpr;
  uniform vec2 u_resolution;
  ${RIPPLE_UNIFORMS_GLSL}

  varying float vSeed;
  varying float vRippleBoost;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void main() {
    // Deriva lenta hacia arriba, desincronizada por partícula (plancton, no lluvia).
    float speed = 0.02 + aSeed * 0.025;
    float rawY = position.y + u_time * speed;

    // Cada vez que completa una vuelta (sale por arriba, entra por abajo) obtiene
    // una X pseudoaleatoria nueva a partir de un hash de su seed + nº de vuelta.
    float cycle = floor((rawY + 1.0) / 2.0);
    float y = mod(rawY + 1.0, 2.0) - 1.0;
    float baseX = hash(aSeed * 91.7 + cycle) * 2.0 - 1.0;

    float sway = sin(u_time * 0.5 + aSeed * 6.2831) * 0.05;
    vec2 pos = vec2(baseX + sway, y);

    // Distancia a los ripples activos, en el mismo espacio uv-aspecto del fondo.
    vec2 uv = vec2((pos.x * 0.5 + 0.5) * (u_resolution.x / u_resolution.y), pos.y * 0.5 + 0.5);
    float boost = 0.0;
${RIPPLE_BOOST_BLOCKS_GLSL}

    vSeed = aSeed;
    vRippleBoost = boost;

    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = aSize * u_dpr * (1.0 + boost * 0.8);
  }
`

const PARTICLE_FRAGMENT = /* glsl */ `
  precision highp float;

  varying float vSeed;
  varying float vRippleBoost;

  void main() {
    vec2 coord = gl_PointCoord * 2.0 - 1.0;
    float d = length(coord);
    float circle = smoothstep(1.0, 0.0, d);
    if (circle <= 0.0) discard;

    vec3 particleColor = mix(vec3(1.0), vec3(0.4353, 0.8902, 0.8392), fract(vSeed * 13.0) * 0.6);
    float baseOpacity = 0.15 + fract(vSeed * 7.0) * 0.2;
    float opacity = baseOpacity * circle * (1.0 + vRippleBoost * 1.6);

    gl_FragColor = vec4(particleColor * opacity, opacity);
  }
`

// 24 uniforms (2 por ripple slot), generados programáticamente. -1000 como startTime
// sentinela: edad siempre queda fuera de [0, RIPPLE_LIFETIME], así que ese slot no
// contribuye hasta que se le asigne un ripple real.
function createRippleUniforms() {
  const uniforms = {}
  for (let i = 0; i < MAX_RIPPLES; i++) {
    uniforms[`u_ripple${i}Origin`] = { value: [0, 0] }
    uniforms[`u_ripple${i}Time`] = { value: -1000 }
  }
  return uniforms
}

export default function OceanShaderBackground({ interactive = false, intensity = 0.5 }) {
  const containerRef = useRef(null)
  const programRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const dpr = Math.min(window.devicePixelRatio, 2)
    const renderer = new Renderer({ dpr, alpha: false, depth: false, antialias: false })
    const gl = renderer.gl
    gl.canvas.style.display = 'block'
    container.appendChild(gl.canvas)

    // Buffer circular de ripples activos: {x, y, startTime} en espacio uv corregido por aspecto.
    let ripples = []
    const addRipple = (x, y, startTime) => {
      ripples.push({ x, y, startTime })
      if (ripples.length > MAX_RIPPLES) ripples.shift()
    }

    // Array mutado in-place (no reemplazado) para que el programa de partículas,
    // que apunta a esta misma referencia, vea también los resizes. Valor inicial
    // provisional (se sobreescribe de inmediato con setSize() más abajo).
    const resolution = [1, 1]

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: resolution },
        u_intensity: { value: intensity },
        ...createRippleUniforms(),
      },
    })
    programRef.current = program

    const geometry = new Triangle(gl)
    const mesh = new Mesh(gl, { geometry, program })

    // Partículas: posición inicial y semilla aleatorias, tamaño 2-5px variable.
    const particlePositions = new Float32Array(PARTICLE_COUNT * 2)
    const particleSeeds = new Float32Array(PARTICLE_COUNT)
    const particleSizes = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 2] = Math.random() * 2 - 1
      particlePositions[i * 2 + 1] = Math.random() * 2 - 1
      particleSeeds[i] = Math.random()
      particleSizes[i] = 2 + Math.random() * 3
    }

    const particleGeometry = new Geometry(gl, {
      position: { size: 2, data: particlePositions },
      aSeed: { size: 1, data: particleSeeds },
      aSize: { size: 1, data: particleSizes },
    })

    const particleProgram = new Program(gl, {
      vertex: PARTICLE_VERTEX,
      fragment: PARTICLE_FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        u_time: { value: 0 },
        u_dpr: { value: dpr },
        u_resolution: { value: resolution },
        ...createRippleUniforms(),
      },
    })
    // Glow aditivo real (no alpha-blend normal) para que sumen luz sobre el fondo.
    particleProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE)

    const particleMesh = new Mesh(gl, { geometry: particleGeometry, program: particleProgram, mode: gl.POINTS })

    // Mide el contenedor (nunca window): así el mismo componente sirve tanto para un
    // fondo a pantalla completa como para vivir dentro de un elemento más pequeño
    // (ej. una tarjeta), ajustándose siempre a su propio tamaño real.
    const setSize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      resolution[0] = width
      resolution[1] = height
      renderer.setSize(width, height)
    }
    setSize()

    const startTime = performance.now()

    // Convierte una coordenada de pantalla (CSS px) al espacio uv-aspecto usado en el shader.
    const toShaderSpace = (clientX, clientY) => {
      const rect = gl.canvas.getBoundingClientRect()
      const aspect = program.uniforms.u_resolution.value[0] / program.uniforms.u_resolution.value[1]
      const nx = ((clientX - rect.left) / rect.width) * aspect
      // vUv.y=0 corresponde a la parte INFERIOR del canvas (convención estándar de textura/NDC de
      // WebGL, con Y+ hacia arriba) — se invierte porque clientY crece hacia abajo.
      // Verificado empíricamente: sin este flip, un ripple con y pequeño aparecía abajo, no arriba.
      const ny = 1 - (clientY - rect.top) / rect.height
      return [nx, ny]
    }

    const nowSeconds = () => (performance.now() - startTime) / 1000

    const handleMouseDown = (event) => {
      const [x, y] = toShaderSpace(event.clientX, event.clientY)
      addRipple(x, y, nowSeconds())
    }

    const handleTouchStart = (event) => {
      const time = nowSeconds()
      for (const touch of event.touches) {
        const [x, y] = toShaderSpace(touch.clientX, touch.clientY)
        addRipple(x, y, time)
      }
    }

    if (interactive) {
      gl.canvas.addEventListener('mousedown', handleMouseDown)
      gl.canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    }

    let rafId = null

    const renderFrame = (time) => {
      rafId = requestAnimationFrame(renderFrame)

      const elapsed = (time - startTime) / 1000
      program.uniforms.u_time.value = elapsed
      particleProgram.uniforms.u_time.value = elapsed

      // Poda los ripples ya extintos del estado en JS, no solo del shader.
      if (ripples.length) {
        ripples = ripples.filter((r) => elapsed - r.startTime <= RIPPLE_LIFETIME)
      }

      // Un par de uniforms nombrados por slot: los ocupados reciben el ripple real,
      // el resto vuelve al sentinela (-1000) para no contribuir en el shader.
      for (let i = 0; i < MAX_RIPPLES; i++) {
        const ripple = ripples[i]
        const origin = ripple ? [ripple.x, ripple.y] : [0, 0]
        const startTimeValue = ripple ? ripple.startTime : -1000

        program.uniforms[`u_ripple${i}Origin`].value = origin
        program.uniforms[`u_ripple${i}Time`].value = startTimeValue
        particleProgram.uniforms[`u_ripple${i}Origin`].value = origin
        particleProgram.uniforms[`u_ripple${i}Time`].value = startTimeValue
      }

      // Mismo frame, mismo renderer: fondo primero (limpia el buffer), partículas
      // encima sin limpiar, para que el glow aditivo se sume sobre las caustics.
      renderer.render({ scene: mesh })
      renderer.render({ scene: particleMesh, clear: false })
    }

    const startLoop = () => {
      if (rafId === null) rafId = requestAnimationFrame(renderFrame)
    }
    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    startLoop()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        startLoop()
      } else {
        stopLoop()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    // ResizeObserver en vez de window resize: el tamaño del contenedor puede cambiar
    // sin que la ventana cambie (ej. una tarjeta cuyo contenido varía de alto).
    const resizeObserver = new ResizeObserver(() => {
      setSize()
    })
    resizeObserver.observe(container)

    return () => {
      stopLoop()
      document.removeEventListener('visibilitychange', handleVisibility)
      resizeObserver.disconnect()
      if (interactive) {
        gl.canvas.removeEventListener('mousedown', handleMouseDown)
        gl.canvas.removeEventListener('touchstart', handleTouchStart)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      if (gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive])

  useEffect(() => {
    if (programRef.current) {
      programRef.current.uniforms.u_intensity.value = intensity
    }
  }, [intensity])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 z-0 overflow-hidden ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
    />
  )
}
