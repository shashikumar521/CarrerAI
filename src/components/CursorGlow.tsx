import React, { useEffect, useRef, useState } from 'react';

/**
 * CursorGlow
 *
 * Implements a small, smooth cursor-following glow that follows the mouse
 * with slight delay/easing (lerp factor 0.14).
 *
 * - Subtle, premium appearance with smooth radial illumination.
 * - Hardware accelerated with translate3d and will-change: transform.
 * - Automatically disabled on mobile/touch devices and when reduced-motion is preferred.
 * - Fades in on mouse entry and fades out on mouse leave.
 */
export const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const targetPos = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const currentPos = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for pointer device with hover capability and user motion preference
    const hasFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFineHover || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      currentPos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };

    // Smooth animation loop using linear interpolation (lerp)
    const render = () => {
      const lerp = 0.14; // Slight delay/easing for premium fluid feel
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentPos.current.x.toFixed(1)}px, ${currentPos.current.y.toFixed(1)}px, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [visible]);

  if (!enabled) return null;

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none select-none z-30 transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: 'translate3d(-300px, -300px, 0)',
        willChange: 'transform',
      }}
    >
      {/* Outer ambient soft light aura (280px) */}
      <div className="w-[280px] h-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,rgba(99,102,241,0.02)_40%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(129,140,248,0.12)_0%,rgba(99,102,241,0.03)_45%,transparent_70%)] blur-xl" />

      {/* Inner subtle glow accent */}
      <div className="absolute top-0 left-0 w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 dark:bg-indigo-400/20 blur-xs" />
    </div>
  );
};
