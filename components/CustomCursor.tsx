'use client'

import { useEffect, useRef, useState } from 'react'

// 配置常量
const TRAIL_DOTS = 30  // 拖尾圆点数量
const LERP_FACTOR = 0.9  // lerp 延迟系数 (越大跟随越快)
const MAIN_CURSOR_SIZE = 20  // 主光标大小
const THEME_COLOR = '#ffffff'  // 主题色
// z-index must be higher than lightbox overlay (999999) to appear on top
const CURSOR_Z_INDEX = 1000000  // 高于灯箱的 z-index

// Lerp 插值函数
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor
}

export default function CustomCursor() {
  const mainCursorRef = useRef<HTMLDivElement>(null)
  const trailDotsRef = useRef<HTMLDivElement[]>([])
  const [isHovering, setIsHovering] = useState(false)
  const [isInput, setIsInput] = useState(false)

  // 鼠标位置
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  // 记录每个圆点的当前位置
  const dotPositions = useRef<{ x: number; y: number }[]>(
    Array(TRAIL_DOTS).fill({ x: 0, y: 0 })
  )

  // 动画帧ID
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const mainCursor = mainCursorRef.current
    const trailDots = trailDotsRef.current
    if (!mainCursor || trailDots.length === 0) return

    // 初始化位置在屏幕外
    mouseX.current = -100
    mouseY.current = -100

    // 初始化所有拖尾点位置
    dotPositions.current = Array(TRAIL_DOTS).fill({ x: -100, y: -100 })

    const onMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX
      mouseY.current = e.clientY
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // 检测输入框元素 - 优先级更高
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('contenteditable') === 'true' ||
        target.classList.contains('input') ||
        target.closest('input') ||
        target.closest('textarea')

      if (isInputElement) {
        setIsInput(true)
        setIsHovering(false)
        return
      }

      // 检测可点击元素
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('card') ||
        target.classList.contains('post-card') ||
        target.classList.contains('tag') ||
        target.classList.contains('category-btn') ||
        target.classList.contains('nav-link') ||
        target.classList.contains('theme-toggle') ||
        target.classList.contains('btn') ||
        target.classList.contains('footer-link')

      setIsHovering(!!isInteractive)
      setIsInput(false)
    }

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // 检查是否移出了交互区域
      const relatedTarget = e.relatedTarget as HTMLElement

      // 如果移到了非交互元素，重置状态
      if (!relatedTarget) {
        setIsHovering(false)
        setIsInput(false)
        return
      }

      // 检查是否仍然在输入框上
      const isStillInput =
        relatedTarget.tagName === 'INPUT' ||
        relatedTarget.tagName === 'TEXTAREA' ||
        relatedTarget.getAttribute('contenteditable') === 'true' ||
        relatedTarget.closest('input') ||
        relatedTarget.closest('textarea')

      if (isStillInput) {
        setIsInput(true)
        setIsHovering(false)
        return
      }

      // 检查是否仍然在可点击元素上
      const isStillInteractive =
        relatedTarget.tagName === 'A' ||
        relatedTarget.tagName === 'BUTTON' ||
        relatedTarget.closest('a') ||
        relatedTarget.closest('button') ||
        relatedTarget.classList.contains('card')

      setIsHovering(!!isStillInteractive)
      setIsInput(false)
    }

    // 动画循环
    const animate = () => {
      // 主光标直接跟随鼠标
      mainCursor.style.left = mouseX.current + 'px'
      mainCursor.style.top = mouseY.current + 'px'

      // 拖尾点使用 lerp 依次跟随
      trailDots.forEach((dot, index) => {
        if (!dot) return

        // 当前位置
        const currentPos = dotPositions.current[index]

        // 每个点跟随前一个点的位置（第一个点跟随鼠标）
        const targetX = index === 0 ? mouseX.current : dotPositions.current[index - 1].x
        const targetY = index === 0 ? mouseY.current : dotPositions.current[index - 1].y

        // 应用 lerp 插值 - 越后面的点延迟稍微大一点，但整体更快
        const delayFactor = 1 - (index / TRAIL_DOTS) * 0.3
        const newX = lerp(currentPos.x, targetX, LERP_FACTOR * delayFactor)
        const newY = lerp(currentPos.y, targetY, LERP_FACTOR * delayFactor)

        // 更新位置
        dotPositions.current[index] = { x: newX, y: newY }
        dot.style.left = newX + 'px'
        dot.style.top = newY + 'px'
      })

      animationFrameId.current = requestAnimationFrame(animate)
    }

    // 启动动画
    animate()

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  // 根据状态计算主光标样式
  const getMainCursorStyle = () => {
    if (isInput) {
      // 输入框：竖线形状
      return {
        width: '3px',
        height: '24px',
        borderRadius: '2px',
      }
    } else if (isHovering) {
      // 可点击元素：大圆
      return {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
      }
    }
    // 默认：小圆
    return {
      width: `${MAIN_CURSOR_SIZE}px`,
      height: `${MAIN_CURSOR_SIZE}px`,
      borderRadius: '50%',
    }
  }

  const cursorStyle = getMainCursorStyle()

  return (
    <>
      {/* 拖尾圆点 - 从后到前渲染 */}
      {Array.from({ length: TRAIL_DOTS }).map((_, index) => {
        // 计算每个点的样式
        const progress = index / TRAIL_DOTS

        // 根据状态调整拖尾形状
        let size, borderRadius

        if (isInput) {
          // 输入框：竖线拖尾
          size = 3 * (1 - progress * 0.6)
          borderRadius = '2px'
        } else if (isHovering) {
          // 可点击：大圆拖尾
          size = 36 * (1 - progress * 0.8)
          borderRadius = '50%'
        } else {
          // 默认：小圆拖尾
          size = MAIN_CURSOR_SIZE * (1 - progress * 0.8)
          borderRadius = '50%'
        }

        const opacity = 0.7 * (1 - progress)
        const blur = progress * 3

        return (
          <div
            key={index}
            ref={(el) => {
              if (el) trailDotsRef.current[index] = el
            }}
            className="custom-cursor"
            style={{
              position: 'fixed',
              width: `${size}px`,
              height: `${size}px`,
              background: THEME_COLOR,
              borderRadius: borderRadius,
              pointerEvents: 'none',
              zIndex: CURSOR_Z_INDEX - index,
              transform: 'translate(-50%, -50%)',
              filter: `blur(${blur}px)`,
              opacity: opacity,
              transition: 'opacity 0.1s ease, width 0.2s ease, height 0.2s ease, border-radius 0.2s ease',
              willChange: 'left, top, transform, width, height, border-radius',
            }}
          />
        )
      })}

      {/* 主光标 */}
      <div
        ref={mainCursorRef}
        className="custom-cursor"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          background: THEME_COLOR,
          pointerEvents: 'none',
          zIndex: CURSOR_Z_INDEX,
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 10px ${THEME_COLOR}80, 0 0 20px ${THEME_COLOR}50`,
          transition: 'width 0.2s ease, height 0.2s ease, border-radius 0.2s ease, box-shadow 0.2s ease',
          willChange: 'left, top, transform, width, height, border-radius',
          ...cursorStyle,
        }}
      />
    </>
  )
}
