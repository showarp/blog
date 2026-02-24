'use client';

import { animate, stagger, type AnimationParams } from 'animejs';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Get theme-aware colors for animations
 */
export const getThemeColors = () => {
  const isLight = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') === 'light'
    : false;

  return {
    accent: isLight ? '#2563eb' : '#e8ff47',
    accentDim: isLight ? '#1e40af' : '#b8c93a',
  };
};

/**
 * Hook: Animate elements when they enter viewport
 */
export function useInViewAnimation(
  animationParams: { [key: string]: any },
  options?: {
    threshold?: number;
    triggerOnce?: boolean;
    rootMargin?: string;
  }
) {
  const elementRef = useRef<HTMLElement | null>(null);
  const animationRef = useRef<any>(null);

  const observe = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const { threshold = 0.1, triggerOnce = true, rootMargin = '0px' } = options || {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animationRef.current = animate(element, animationParams);

            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animationParams, options]);

  useEffect(() => {
    const cleanup = observe();
    return cleanup;
  }, [observe]);

  return elementRef;
}

/**
 * Hook: Stagger animation for multiple elements
 */
export function useStaggerAnimation(
  selector: string,
  options?: {
    delay?: number;
    duration?: number;
    offsetY?: number;
    trigger?: 'load' | 'scroll' | 'manual';
  }
) {
  const containerRef = useRef<HTMLElement | null>(null);
  const hasAnimated = useRef(false);

  const animate_fn = useCallback(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0 || hasAnimated.current) return;

    const { delay = 0, duration = 600, offsetY = 30 } = options || {};

    animate(elements, {
      opacity: [0, 1],
      translateY: [offsetY, 0],
      delay: stagger(80, { start: delay }),
      duration,
      easing: 'easeOutExpo',
    });

    hasAnimated.current = true;
  }, [selector, options]);

  useEffect(() => {
    if (options?.trigger === 'load') {
      animate_fn();
    } else if (options?.trigger === 'scroll' || options?.trigger === undefined) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            animate_fn();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      const element = containerRef.current;
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }
  }, [animate_fn, options?.trigger]);

  return { containerRef, animate: animate_fn };
}

/**
 * Utility: Text reveal animation
 */
export const textReveal = (selector: string, delay = 0) => {
  const element = document.querySelector(selector);
  if (!element) return;

  animate(element, {
    opacity: [0, 1],
    translateY: [20, 0],
    delay,
    duration: 800,
    easing: 'easeOutExpo',
  });
};

/**
 * Utility: Spring hover effect
 */
export const springHover = (element: HTMLElement) => {
  animate(element, {
    scale: [1, 1.02, 0.98, 1],
    duration: 400,
    easing: 'easeOutElastic(1, .8)',
  });
};

/**
 * Utility: Ripple effect on click
 */
export const createRipple = (element: HTMLElement, event: MouseEvent) => {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.background = 'var(--accent)';
  ripple.style.opacity = '0.3';
  ripple.style.pointerEvents = 'none';
  ripple.style.transform = 'scale(0)';

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

  element.appendChild(ripple);

  animate(ripple, {
    scale: [0, 2],
    opacity: [0.3, 0],
    duration: 600,
    easing: 'easeOutQuad',
    complete: () => ripple.remove(),
  });
};

/**
 * Hook: Parallax effect on scroll
 */
export function useParallax(speed = 0.5) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const offset = rect.top * speed;
      element.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return elementRef;
}
