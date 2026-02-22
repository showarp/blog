'use client'

import { useEffect, useRef, useState } from 'react'

interface WaveLayer {
  y: number
  amplitude: number
  frequency: number
  speed: number
  opacity: number
  color: string
}

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    // Detect theme
    const detectTheme = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light'
      setTheme(isLight ? 'light' : 'dark')
    }
    detectTheme()

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      detectTheme()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const waveLayers: WaveLayer[] = [
      // Layer 1 - Large slow wave
      {
        y: 0.3,
        amplitude: 80,
        frequency: 0.8,
        speed: 0.015,
        opacity: 0.08,
        color: theme === 'dark' ? '#e8ff47' : '#2563eb',
      },
      // Layer 2 - Medium wave
      {
        y: 0.45,
        amplitude: 60,
        frequency: 1.2,
        speed: 0.02,
        opacity: 0.12,
        color: theme === 'dark' ? '#e8ff47' : '#3b82f6',
      },
      // Layer 3 - Smaller faster wave
      {
        y: 0.6,
        amplitude: 45,
        frequency: 1.6,
        speed: 0.025,
        opacity: 0.15,
        color: theme === 'dark' ? '#c5d94a' : '#60a5fa',
      },
      // Layer 4 - Small fast wave
      {
        y: 0.75,
        amplitude: 30,
        frequency: 2.0,
        speed: 0.03,
        opacity: 0.18,
        color: theme === 'dark' ? '#a3b040' : '#93c5fd',
      },
      // Layer 5 - Tiny very fast wave
      {
        y: 0.88,
        amplitude: 20,
        frequency: 2.5,
        speed: 0.035,
        opacity: 0.1,
        color: theme === 'dark' ? '#8a9635' : '#bfdbfe',
      },
    ]

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawWave = (layer: WaveLayer, offset: number) => {
      const { y, amplitude, frequency, speed, opacity, color } = layer
      const yPos = canvas.height * y

      ctx.beginPath()
      ctx.moveTo(0, canvas.height)

      for (let x = 0; x <= canvas.width; x += 5) {
        const waveY =
          yPos +
          Math.sin(x * frequency * 0.01 + time * speed + offset) * amplitude +
          Math.sin(x * frequency * 0.005 + time * speed * 0.5) *
            amplitude *
            0.3

        ctx.lineTo(x, waveY)
      }

      ctx.lineTo(canvas.width, canvas.height)
      ctx.closePath()

      // Create gradient
      const gradient = ctx.createLinearGradient(0, yPos - amplitude, 0, canvas.height)
      gradient.addColorStop(0, `${color}`)
      gradient.addColorStop(0.3, `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.fill()
    }

    const drawFloatingParticles = () => {
      const particleCount = 15

      for (let i = 0; i < particleCount; i++) {
        const x = (i * canvas.width) / particleCount + Math.sin(time * 0.02 + i) * 50
        const baseY = (i % 3) * (canvas.height / 3) + canvas.height * 0.2
        const y = baseY + Math.sin(time * 0.03 + i * 0.5) * 30
        const size = 3 + Math.sin(i) * 2
        const opacity = 0.15 + Math.sin(time * 0.05 + i) * 0.1
        const color = theme === 'dark' ? '#e8ff47' : '#2563eb'

        ctx.beginPath()
        ctx.arc(x % canvas.width, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw wave layers
      waveLayers.forEach((layer, index) => {
        drawWave(layer, index * 0.5)
      })

      // Draw floating particles
      drawFloatingParticles()

      time++
      animationId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  )
}
