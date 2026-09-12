import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

export interface FloatingRocketProps {
  className?: string;
  size?: 'default' | 'circle';
}

/**
 * FloatingRocket
 *
 * Restores the authentic CareerAI floating rocket companion.
 * - Engineered in CareerAI brand palette (indigo, cyan, clean white, slate accents).
 * - Gentle multi-axis floating (vertical heave + slight sway + subtle banking rotation).
 * - Occasional slow, smooth upward drift cycle and gentle glide back down.
 * - Gently reacts when the cursor comes near it with tiny movement (3-5px) and rotation (1-2 deg).
 * - Soft pulsing exhaust jet and subtle fading trail vapor.
 * - Responsive: desktop (full size, smooth float), tablet (scaled), mobile (compact, calm).
 * - Strictly pointer-events-none and non-obstructive: never covers text, buttons, or cards.
 * - Respects prefers-reduced-motion.
 */
export const FloatingRocket: React.FC<FloatingRocketProps> = ({
  className = '',
  size = 'default',
}) => {
  const isCircle = size === 'circle';
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [cursorOffset, setCursorOffset] = useState<{ x: number; y: number; rotate: number }>({
    x: 0,
    y: 0,
    rotate: 0,
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    const hasFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasFineHover || mq.matches) {
      return () => mq.removeEventListener('change', handler);
    }

    let isNear = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rocketCenterX = rect.left + rect.width / 2;
      const rocketCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - rocketCenterX;
      const dy = e.clientY - rocketCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const threshold = isCircle ? 120 : 220;
      if (dist < threshold && dist > 0) {
        isNear = true;
        // Smooth falloff factor
        const proximity = Math.pow(1 - dist / threshold, 1.4);
        // Scaled movement for circle containment vs open banner
        const multiplier = isCircle ? -2.0 : -4.5;
        const offsetX = (dx / dist) * multiplier * proximity;
        const offsetY = (dy / dist) * multiplier * proximity;
        const rotateOffset = (dx / threshold) * (isCircle ? 1.0 : 2.2) * proximity;

        setCursorOffset({
          x: offsetX,
          y: offsetY,
          rotate: rotateOffset,
        });
      } else if (isNear) {
        isNear = false;
        setCursorOffset({ x: 0, y: 0, rotate: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      mq.removeEventListener('change', handler);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [prefersReducedMotion, isCircle]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative pointer-events-none select-none ${className}`}
    >
      {/* Interactive Cursor Proximity Reaction Wrapper (Gentle spring physics) */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { x: 0, y: 0, rotate: 0 }
            : {
                x: cursorOffset.x,
                y: cursorOffset.y,
                rotate: cursorOffset.rotate,
              }
        }
        transition={{
          type: 'spring',
          damping: 22,
          stiffness: 150,
          mass: 0.6,
        }}
      >
        {/* Outer Motion Wrapper: Slow graceful floating cycle */}
        <motion.div
          animate={
            prefersReducedMotion
              ? { y: 0, x: 0, rotate: 0 }
              : isCircle
              ? {
                  y: [0, -3, -0.5, -4, -1, -3, 0],
                  x: [0, 1, -0.8, 1, -0.5, 0],
                  rotate: [0, 0.8, -0.8, 0.8, 0],
                }
              : {
                  // Gentle heave with occasional upward drift and smooth recovery
                  y: [0, -10, -3, -18, -6, -24, -8, 0],
                  x: [0, 3, -2, 4, -1, 3, -2, 0],
                  rotate: [0, 2, -1.5, 3, -1, 2.5, -1, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: isCircle ? 6.5 : 9.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
          className="relative flex flex-col items-center"
        >
        {/* Ambient Subtle Glow behind Rocket (Soft in light mode, slightly brighter accent in dark mode) */}
        <div
          className={`absolute ${
            isCircle
              ? '-inset-1 blur-sm bg-indigo-400/15 dark:bg-indigo-500/20'
              : '-inset-2 blur-md bg-indigo-400/10 dark:bg-indigo-500/25'
          } rounded-full pointer-events-none transition-colors duration-300`}
        />

        {/* ------------------------------------------------------------- */}
        {/* CAREERAI HIGH-CRAFT VECTOR ROCKET SVG                         */}
        {/* ------------------------------------------------------------- */}
        <svg
          viewBox="0 0 80 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={
            isCircle
              ? 'w-9 h-12 sm:w-10 sm:h-13 drop-shadow-xs dark:drop-shadow-[0_2px_8px_rgba(99,102,241,0.25)] transition-all'
              : 'w-14 h-20 sm:w-18 sm:h-24 md:w-20 md:h-28 lg:w-22 lg:h-30 drop-shadow-sm dark:drop-shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition-all'
          }
        >
          <defs>
            {/* Fuselage Gradient: Clean white to light slate */}
            <linearGradient id="caiRocketBody" x1="25" y1="12" x2="55" y2="78" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* Nose Cone Gradient: CareerAI Indigo */}
            <linearGradient id="caiRocketNose" x1="40" y1="6" x2="40" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            {/* Left Fin Gradient */}
            <linearGradient id="caiRocketFinLeft" x1="12" y1="50" x2="28" y2="78" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>

            {/* Right Fin Gradient */}
            <linearGradient id="caiRocketFinRight" x1="68" y1="50" x2="52" y2="78" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>

            {/* Porthole Glass Gradient */}
            <linearGradient id="caiRocketWindow" x1="33" y1="33" x2="47" y2="47" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>

            {/* Flame Plume Gradient */}
            <linearGradient id="caiRocketFlame" x1="40" y1="78" x2="40" y2="104" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="90%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>

            {/* Soft Inner Core Flame */}
            <linearGradient id="caiRocketFlameInner" x1="40" y1="78" x2="40" y2="94" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* LEFT WING / FIN */}
          <path
            d="M26 56 C26 56, 12 66, 10 82 C10 83, 16 83, 23 79 C24 73, 26 66, 26 56 Z"
            fill="url(#caiRocketFinLeft)"
            stroke="#3730a3"
            strokeWidth="0.75"
          />

          {/* RIGHT WING / FIN */}
          <path
            d="M54 56 C54 56, 68 66, 70 82 C70 83, 64 83, 57 79 C56 73, 54 66, 54 56 Z"
            fill="url(#caiRocketFinRight)"
            stroke="#312e81"
            strokeWidth="0.75"
          />

          {/* MAIN FUSELAGE / ROCKET BODY */}
          <path
            d="M40 8 C48 18, 56 36, 55 64 C55 74, 52 78, 40 78 C28 78, 25 74, 25 64 C24 36, 32 18, 40 8 Z"
            fill="url(#caiRocketBody)"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* NOSE CONE */}
          <path
            d="M40 8 C44 14, 48 20, 50 26 C45 27, 35 27, 30 26 C32 20, 36 14, 40 8 Z"
            fill="url(#caiRocketNose)"
          />

          {/* CENTER FIN / SPINE ACCENT */}
          <path
            d="M39 52 L41 52 L41.5 78 L38.5 78 Z"
            fill="#4f46e5"
            opacity="0.85"
          />

          {/* REAR ENGINE NOZZLE */}
          <path
            d="M34 78 L46 78 L44 83 L36 83 Z"
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="0.75"
          />

          {/* CABIN PORTHOLE WINDOW RING */}
          <circle cx="40" cy="40" r="9" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="40" cy="40" r="7.5" fill="url(#caiRocketWindow)" />
          {/* Glass reflection highlight */}
          <path
            d="M36 36 Q38 34 42 35 Q39 37 36 36"
            fill="#ffffff"
            opacity="0.65"
          />

          {/* SUBTLE BRAND STRIPE ACROSS BODY */}
          <path
            d="M26.5 60 C32 62, 48 62, 53.5 60 L54 62 C48 64, 32 64, 26 62 Z"
            fill="#6366f1"
            opacity="0.5"
          />
        </svg>

        {/* ------------------------------------------------------------- */}
        {/* SOFT SUBTLE EXHAUST FLAME & TRAIL                             */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`relative ${
            isCircle ? '-mt-2.5' : '-mt-4 sm:-mt-5'
          } flex flex-col items-center`}
        >
          {/* Outer Plume Flame */}
          <motion.div
            animate={
              prefersReducedMotion
                ? { scaleY: 1, opacity: 0.8 }
                : {
                    scaleY: [0.85, 1.18, 0.9, 1.12, 0.85],
                    scaleX: [0.95, 1.05, 0.98, 1.02, 0.95],
                    opacity: [0.75, 0.95, 0.8, 1, 0.75],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: 1.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
            className={`${
              isCircle
                ? 'w-2.5 h-4 blur-[0.3px]'
                : 'w-4 h-7 sm:w-5 sm:h-9 blur-[0.5px]'
            } origin-top rounded-b-full bg-gradient-to-b from-amber-200 via-orange-500 to-indigo-500/0`}
          />

          {/* Inner Hot Core Flame */}
          <motion.div
            animate={
              prefersReducedMotion
                ? { scaleY: 1 }
                : {
                    scaleY: [0.9, 1.25, 0.85, 1.15, 0.9],
                    opacity: [0.85, 1, 0.8, 0.95, 0.85],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: 0.95,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
            className={`absolute top-0 ${
              isCircle ? 'w-1.5 h-2.5' : 'w-2 h-4 sm:w-2.5 sm:h-5'
            } origin-top rounded-b-full bg-gradient-to-b from-white via-sky-300 to-indigo-600/0`}
          />

          {/* Fading Subtle Trail Vapor Particles (Drifting downward smoothly) */}
          {!prefersReducedMotion && !isCircle && (
            <div className="absolute top-5 flex flex-col items-center pointer-events-none">
              <motion.div
                animate={{
                  y: [0, 14, 26],
                  opacity: [0.55, 0.25, 0],
                  scale: [0.6, 1.1, 1.6],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0,
                }}
                className="w-2.5 h-2.5 rounded-full bg-indigo-300/40 blur-xs"
              />
              <motion.div
                animate={{
                  y: [0, 16, 32],
                  opacity: [0.45, 0.2, 0],
                  scale: [0.5, 1, 1.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.8,
                }}
                className="absolute top-2 w-2 h-2 rounded-full bg-sky-300/35 blur-xs"
              />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  </div>
);
};
