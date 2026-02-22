'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import * as THREE from 'three'

// TouchTexture class - tracks mouse movement for distortion
class TouchTexture {
  size = 64
  width = this.size
  height = this.size
  maxAge = 64
  radius = 0.25 * this.size
  speed = 1 / this.maxAge
  trail: { x: number; y: number; age: number; force: number; vx: number; vy: number }[] = []
  last: { x: number; y: number } | null = null
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: THREE.Texture

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')!
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.texture = new THREE.Texture(this.canvas)
  }

  update() {
    this.clear()
    const speed = this.speed

    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i]
      const f = point.force * speed * (1 - point.age / this.maxAge)
      point.x += point.vx * f
      point.y += point.vy * f
      point.age++

      if (point.age > this.maxAge) {
        this.trail.splice(i, 1)
      } else {
        this.drawPoint(point)
      }
    }
    this.texture.needsUpdate = true
  }

  clear() {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  addTouch(point: { x: number; y: number }) {
    let force = 0
    let vx = 0
    let vy = 0
    const last = this.last

    if (last) {
      const dx = point.x - last.x
      const dy = point.y - last.y
      if (dx === 0 && dy === 0) return
      const dd = dx * dx + dy * dy
      const d = Math.sqrt(dd)
      vx = dx / d
      vy = dy / d
      force = Math.min(dd * 20000, 2.0)
    }

    this.last = { x: point.x, y: point.y }
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy })
  }

  drawPoint(point: { x: number; y: number; age: number; force: number; vx: number; vy: number }) {
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height,
    }

    let intensity = 1
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2))
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7)
      intensity = -t * (t - 2)
    }
    intensity *= point.force

    const radius = this.radius
    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`
    const offset = this.size * 5
    this.ctx.shadowOffsetX = offset
    this.ctx.shadowOffsetY = offset
    this.ctx.shadowBlur = radius * 1
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`

    this.ctx.beginPath()
    this.ctx.fillStyle = 'rgba(255,0,0,1)'
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }
}

// Theme-based color configurations
const DARK_THEME_COLORS = {
  bg: new THREE.Vector3(0.039, 0.039, 0.039), // #0a0a0a
  accent: new THREE.Vector3(0.91, 1.0, 0.278), // #e8ff47 electric lime
  color1: new THREE.Vector3(0.91, 1.0, 0.278), // electric lime #e8ff47
  color2: new THREE.Vector3(0.039, 0.039, 0.039), // dark #0a0a0a
  color3: new THREE.Vector3(0.698, 1.0, 0.184), // lime #b2ff2e
  color4: new THREE.Vector3(0.0, 0.6, 0.525), // teal #00996c
  color5: new THREE.Vector3(1.0, 0.6, 0.2), // coral #ff9933
  color6: new THREE.Vector3(0.133, 0.133, 0.133), // charcoal #222222
}

const LIGHT_THEME_COLORS = {
  bg: new THREE.Vector3(1.0, 1.0, 1.0), // #ffffff
  accent: new THREE.Vector3(0.145, 0.388, 0.918), // #2563eb royal blue
  color1: new THREE.Vector3(0.145, 0.388, 0.918), // royal blue #2563eb
  color2: new THREE.Vector3(1.0, 1.0, 1.0), // white #ffffff
  color3: new THREE.Vector3(0.231, 0.510, 0.969), // bright blue #3b82f6
  color4: new THREE.Vector3(0.541, 0.329, 0.929), // purple #7c3aed
  color5: new THREE.Vector3(0.118, 0.251, 0.686), // deep blue #1e40af
  color6: new THREE.Vector3(0.941, 0.941, 0.941), // light gray #f0f0f0
}

export default function LiquidGradient() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Select colors based on theme
    const colors = theme === 'dark' ? DARK_THEME_COLORS : LIGHT_THEME_COLORS

    // Renderer - optimized for performance
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      depth: false,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    container.appendChild(renderer.domElement)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
    camera.position.z = 50

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(colors.bg.x, colors.bg.y, colors.bg.z)

    // Clock
    const clock = new THREE.Clock()

    // Touch texture
    const touchTexture = new TouchTexture()

    // Get view size
    const getViewSize = () => {
      const fovInRadians = (camera.fov * Math.PI) / 180
      const height = Math.abs(camera.position.z * Math.tan(fovInRadians / 2) * 2)
      return { width: height * camera.aspect, height }
    }

    // Uniforms - optimized for performance
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uColor1: { value: colors.color1 },
      uColor2: { value: colors.color2 },
      uColor3: { value: colors.color3 },
      uColor4: { value: colors.color4 },
      uColor5: { value: colors.color5 },
      uColor6: { value: colors.color6 },
      uSpeed: { value: 0.6 },
      uIntensity: { value: 1.0 },
      uTouchTexture: { value: touchTexture.texture },
      uGrainIntensity: { value: 0.02 },
      uZoom: { value: 1.0 },
      uDarkNavy: { value: colors.bg },
      uGradientSize: { value: 0.7 },
      uGradientCount: { value: 4.0 },
      uColor1Weight: { value: 0.35 },
      uColor2Weight: { value: 0.8 },
    }

    // Create mesh
    const viewSize = getViewSize()
    const geometry = new THREE.PlaneGeometry(viewSize.width, viewSize.height, 1, 1)

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vec3 pos = position.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform vec3 uColor5;
        uniform vec3 uColor6;
        uniform float uSpeed;
        uniform float uIntensity;
        uniform sampler2D uTouchTexture;
        uniform float uGrainIntensity;
        uniform float uZoom;
        uniform vec3 uDarkNavy;
        uniform float uGradientSize;
        uniform float uGradientCount;
        uniform float uColor1Weight;
        uniform float uColor2Weight;

        varying vec2 vUv;

        #define PI 3.14159265359

        float grain(vec2 uv, float time) {
          vec2 grainUv = uv * uResolution * 0.5;
          float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
          return grainValue * 2.0 - 1.0;
        }

        vec3 getGradientColor(vec2 uv, float time) {
          float gradientRadius = uGradientSize;

          vec2 center1 = vec2(0.5 + sin(time * uSpeed * 0.4) * 0.4, 0.5 + cos(time * uSpeed * 0.5) * 0.4);
          vec2 center2 = vec2(0.5 + cos(time * uSpeed * 0.6) * 0.5, 0.5 + sin(time * uSpeed * 0.45) * 0.5);
          vec2 center3 = vec2(0.5 + sin(time * uSpeed * 0.35) * 0.45, 0.5 + cos(time * uSpeed * 0.55) * 0.45);
          vec2 center4 = vec2(0.5 + cos(time * uSpeed * 0.5) * 0.4, 0.5 + sin(time * uSpeed * 0.4) * 0.4);
          vec2 center5 = vec2(0.5 + sin(time * uSpeed * 0.7) * 0.35, 0.5 + cos(time * uSpeed * 0.6) * 0.35);
          vec2 center6 = vec2(0.5 + cos(time * uSpeed * 0.45) * 0.5, 0.5 + sin(time * uSpeed * 0.65) * 0.5);

          vec2 center7 = vec2(0.5 + sin(time * uSpeed * 0.55) * 0.38, 0.5 + cos(time * uSpeed * 0.48) * 0.42);
          vec2 center8 = vec2(0.5 + cos(time * uSpeed * 0.65) * 0.36, 0.5 + sin(time * uSpeed * 0.52) * 0.44);
          vec2 center9 = vec2(0.5 + sin(time * uSpeed * 0.42) * 0.41, 0.5 + cos(time * uSpeed * 0.58) * 0.39);
          vec2 center10 = vec2(0.5 + cos(time * uSpeed * 0.48) * 0.37, 0.5 + sin(time * uSpeed * 0.62) * 0.43);
          vec2 center11 = vec2(0.5 + sin(time * uSpeed * 0.68) * 0.33, 0.5 + cos(time * uSpeed * 0.44) * 0.46);
          vec2 center12 = vec2(0.5 + cos(time * uSpeed * 0.38) * 0.39, 0.5 + sin(time * uSpeed * 0.56) * 0.41);

          float dist1 = length(uv - center1);
          float dist2 = length(uv - center2);
          float dist3 = length(uv - center3);
          float dist4 = length(uv - center4);
          float dist5 = length(uv - center5);
          float dist6 = length(uv - center6);
          float dist7 = length(uv - center7);
          float dist8 = length(uv - center8);
          float dist9 = length(uv - center9);
          float dist10 = length(uv - center10);
          float dist11 = length(uv - center11);
          float dist12 = length(uv - center12);

          float influence1 = 1.0 - smoothstep(0.0, gradientRadius, dist1);
          float influence2 = 1.0 - smoothstep(0.0, gradientRadius, dist2);
          float influence3 = 1.0 - smoothstep(0.0, gradientRadius, dist3);
          float influence4 = 1.0 - smoothstep(0.0, gradientRadius, dist4);
          float influence5 = 1.0 - smoothstep(0.0, gradientRadius, dist5);
          float influence6 = 1.0 - smoothstep(0.0, gradientRadius, dist6);
          float influence7 = 1.0 - smoothstep(0.0, gradientRadius, dist7);
          float influence8 = 1.0 - smoothstep(0.0, gradientRadius, dist8);
          float influence9 = 1.0 - smoothstep(0.0, gradientRadius, dist9);
          float influence10 = 1.0 - smoothstep(0.0, gradientRadius, dist10);
          float influence11 = 1.0 - smoothstep(0.0, gradientRadius, dist11);
          float influence12 = 1.0 - smoothstep(0.0, gradientRadius, dist12);

          vec2 rotatedUv1 = uv - 0.5;
          float angle1 = time * uSpeed * 0.15;
          rotatedUv1 = vec2(
            rotatedUv1.x * cos(angle1) - rotatedUv1.y * sin(angle1),
            rotatedUv1.x * sin(angle1) + rotatedUv1.y * cos(angle1)
          );
          rotatedUv1 += 0.5;

          vec2 rotatedUv2 = uv - 0.5;
          float angle2 = -time * uSpeed * 0.12;
          rotatedUv2 = vec2(
            rotatedUv2.x * cos(angle2) - rotatedUv2.y * sin(angle2),
            rotatedUv2.x * sin(angle2) + rotatedUv2.y * cos(angle2)
          );
          rotatedUv2 += 0.5;

          float radialGradient1 = length(rotatedUv1 - 0.5);
          float radialGradient2 = length(rotatedUv2 - 0.5);
          float radialInfluence1 = 1.0 - smoothstep(0.0, 0.8, radialGradient1);
          float radialInfluence2 = 1.0 - smoothstep(0.0, 0.8, radialGradient2);

          vec3 color = vec3(0.0);
          color += uColor1 * influence1 * (0.55 + 0.45 * sin(time * uSpeed)) * uColor1Weight;
          color += uColor2 * influence2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2)) * uColor2Weight;
          color += uColor3 * influence3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8)) * uColor1Weight;
          color += uColor4 * influence4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3)) * uColor2Weight;
          color += uColor5 * influence5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1)) * uColor1Weight;
          color += uColor6 * influence6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9)) * uColor2Weight;

          if (uGradientCount > 6.0) {
            color += uColor1 * influence7 * (0.55 + 0.45 * sin(time * uSpeed * 1.4)) * uColor1Weight;
            color += uColor2 * influence8 * (0.55 + 0.45 * cos(time * uSpeed * 1.5)) * uColor2Weight;
            color += uColor3 * influence9 * (0.55 + 0.45 * sin(time * uSpeed * 1.6)) * uColor1Weight;
            color += uColor4 * influence10 * (0.55 + 0.45 * cos(time * uSpeed * 1.7)) * uColor2Weight;
          }
          if (uGradientCount > 10.0) {
            color += uColor5 * influence11 * (0.55 + 0.45 * sin(time * uSpeed * 1.8)) * uColor1Weight;
            color += uColor6 * influence12 * (0.55 + 0.45 * cos(time * uSpeed * 1.9)) * uColor2Weight;
          }

          color += mix(uColor1, uColor3, radialInfluence1) * 0.45 * uColor1Weight;
          color += mix(uColor2, uColor4, radialInfluence2) * 0.4 * uColor2Weight;

          color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;

          float luminance = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(vec3(luminance), color, 1.35);

          color = pow(color, vec3(0.92));

          float brightness1 = length(color);
          float mixFactor1 = max(brightness1 * 1.2, 0.15);
          color = mix(uDarkNavy, color, mixFactor1);

          float maxBrightness = 1.0;
          float brightness = length(color);
          if (brightness > maxBrightness) {
            color = color * (maxBrightness / brightness);
          }

          return color;
        }

        void main() {
          vec2 uv = vUv;

          // Reduced touch distortion for performance and to fix black artifact issue
          vec4 touchTex = texture2D(uTouchTexture, uv);
          float vx = -(touchTex.r * 2.0 - 1.0);
          float vy = -(touchTex.g * 2.0 - 1.0);
          float intensity = touchTex.b;
          // Reduced distortion strength
          uv.x += vx * 0.25 * intensity;
          uv.y += vy * 0.25 * intensity;

          vec2 center = vec2(0.5);
          float dist = length(uv - center);
          // Reduced ripple effect
          float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.02 * intensity;
          float wave = sin(dist * 15.0 - uTime * 2.0) * 0.015 * intensity;
          uv += vec2(ripple + wave);

          vec3 color = getGradientColor(uv, uTime);

          // Reduced grain for performance
          float grainValue = grain(uv, uTime);
          color += grainValue * uGrainIntensity;

          float timeShift = uTime * 0.5;
          color.r += sin(timeShift) * 0.015;
          color.g += cos(timeShift * 1.4) * 0.02;
          color.b += sin(timeShift * 1.2) * 0.02;

          float brightness2 = length(color);
          // Increased minimum brightness to fix black artifact in dark mode
          float mixFactor2 = max(brightness2 * 1.3, 0.25);
          color = mix(uDarkNavy, color, mixFactor2);

          color = clamp(color, vec3(0.02), vec3(1.0));

          float maxBrightness = 1.0;
          float brightness = length(color);
          if (brightness > maxBrightness) {
            color = color * (maxBrightness / brightness);
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.z = 0
    scene.add(mesh)

    // Mouse handling
    let mouse: { x: number; y: number } | null = null

    const onMouseMove = (ev: MouseEvent) => {
      mouse = {
        x: ev.clientX / window.innerWidth,
        y: 1 - ev.clientY / window.innerHeight,
      }
      if (mouse) {
        touchTexture.addTouch(mouse)
      }
    }

    const onTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0]
      mouse = {
        x: touch.clientX / window.innerWidth,
        y: 1 - touch.clientY / window.innerHeight,
      }
      if (mouse) {
        touchTexture.addTouch(mouse)
      }
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)

      const viewSize = getViewSize()
      mesh.geometry.dispose()
      mesh.geometry = new THREE.PlaneGeometry(viewSize.width, viewSize.height, 1, 1)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('resize', onResize)

    // Animation loop
    const animate = () => {
      const delta = clock.getDelta()
      uniforms.uTime.value += delta

      touchTexture.update()
      renderer.render(scene, camera)

      requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      mesh.geometry.dispose()
      ;(material as THREE.ShaderMaterial).dispose()
      container.removeChild(renderer.domElement)
    }
  }, [theme]) // Add theme as dependency to re-render on theme change

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}
