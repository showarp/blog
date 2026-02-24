'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export default function AnimatedText({
  text,
  className = '',
  delay = 0,
  as = 'p',
}: AnimatedTextProps) {
  const Component = as;
  const textRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!textRef.current || hasAnimated.current) return;

    // Split text into characters wrapped in spans
    const content = textRef.current.textContent || text;
    textRef.current.innerHTML = content
      .split('')
      .map((char) => {
        if (char === ' ') return '<span class="char">&nbsp;</span>';
        return `<span class="char">${char}</span>`;
      })
      .join('');

    const chars = textRef.current.querySelectorAll('.char');

    animate(chars, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(30, { start: delay }),
      duration: 800,
      easing: 'easeOutExpo',
    });

    hasAnimated.current = true;
  }, [text, delay]);

  return (
    <Component ref={textRef} className={className}>
      {text}
    </Component>
  );
}
