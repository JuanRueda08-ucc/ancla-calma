import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

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

    gl_FragColor = vec4(color, 1.0);
  }
`

export default function OceanShaderBackground({ interactive = false, intensity = 0.5 }) {
  const containerRef = useRef(null)
  const programRef = useRef(null)

  // `interactive` se conecta en un prompt posterior (interacción con puntero/mouse).
  // eslint-disable-next-line no-unused-vars
  void interactive

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const dpr = Math.min(window.devicePixelRatio, 2)
    const renderer = new Renderer({ dpr, alpha: false, depth: false, antialias: false })
    const gl = renderer.gl
    gl.canvas.style.display = 'block'
    container.appendChild(gl.canvas)

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: [window.innerWidth, window.innerHeight] },
        u_intensity: { value: intensity },
      },
    })
    programRef.current = program

    const geometry = new Triangle(gl)
    const mesh = new Mesh(gl, { geometry, program })

    const setSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      renderer.setSize(width, height)
      program.uniforms.u_resolution.value = [width, height]
    }
    setSize()

    const startTime = performance.now()
    let rafId = null

    const renderFrame = (time) => {
      rafId = requestAnimationFrame(renderFrame)
      program.uniforms.u_time.value = (time - startTime) / 1000
      renderer.render({ scene: mesh })
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
    window.addEventListener('resize', setSize)

    return () => {
      stopLoop()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('resize', setSize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      if (gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (programRef.current) {
      programRef.current.uniforms.u_intensity.value = intensity
    }
  }, [intensity])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    />
  )
}
