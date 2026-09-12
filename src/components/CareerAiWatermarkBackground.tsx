import React, { useEffect, useRef, useState } from 'react';

/**
 * CareerAiWatermarkBackground
 *
 * Provides a subtle, elegant, animated CareerAI logo watermark background.
 * - Uses the authentic CareerAI logo (/careerai-logo.png) without altering design or colors.
 * - Extremely subtle opacity (3-6%) ensuring zero interference with card legibility or text contrast.
 * - Multi-layer composition: Base app background -> Watermark logos -> Soft ambient tech orbs -> Content.
 * - Sophisticated slow floating, rotation (2-4 deg), gentle breathing pulse (8-16s),
 *   smooth mouse parallax with fluid damping, and scroll parallax.
 * - Fully responsive (reduced count on tablet/mobile) and respects prefers-reduced-motion.
 */
export const CareerAiWatermarkBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Smooth mouse coordinates with lerp damping
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollOffsetRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // References to individual watermark elements for parallax transforms
  const wm1Ref = useRef<HTMLDivElement>(null);
  const wm2Ref = useRef<HTMLDivElement>(null);
  const wm3Ref = useRef<HTMLDivElement>(null);
  const wm4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // If reduced motion is requested, do not run mouse/scroll animation loops
    if (mediaQuery.matches) {
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }

    // Passive mouse move handler with normalized coordinates (-1 to 1)
    const handleMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseTargetRef.current = {
        x: (e.clientX - halfW) / halfW,
        y: (e.clientY - halfH) / halfH,
      };
    };

    // Passive scroll handler
    const handleScroll = () => {
      scrollOffsetRef.current = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Smooth 60fps animation loop using linear interpolation (lerp)
    const renderLoop = () => {
      // Lerp mouse coordinates with gentle damping factor
      const lerpFactor = 0.04;
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * lerpFactor;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * lerpFactor;

      const mx = mouseCurrentRef.current.x;
      const my = mouseCurrentRef.current.y;
      const sy = scrollOffsetRef.current;

      // Parallax shifts (very subtle, calm, only a few pixels: 3-5px max)
      if (wm1Ref.current) {
        const px = mx * 5;
        const py = my * 4 + sy * 0.025;
        wm1Ref.current.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }

      if (wm2Ref.current) {
        const px = mx * -4.5;
        const py = my * -3.5 + sy * 0.035;
        wm2Ref.current.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }

      if (wm3Ref.current) {
        const px = mx * 4;
        const py = my * 4.5 + sy * 0.02;
        wm3Ref.current.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }

      if (wm4Ref.current) {
        const px = mx * -3.5;
        const py = my * 3 + sy * 0.03;
        wm4Ref.current.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none print:hidden"
    >
      {/* ------------------------------------------------------------- */}
      {/* LAYER 3: Extremely Subtle Soft Atmospheric Orbs & Blobs       */}
      {/* Delicate blur gradients with slow drift (Adapted for Light & Dark) */}
      {/* ------------------------------------------------------------- */}
      <div className={`absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-indigo-400/[0.025] dark:bg-indigo-500/[0.065] blur-[120px] transform-gpu pointer-events-none transition-colors duration-500 ${prefersReducedMotion ? '' : 'animate-careerai-blob-1'}`} />
      <div className={`absolute top-[35%] -left-32 w-[450px] h-[450px] rounded-full bg-cyan-400/[0.02] dark:bg-cyan-400/[0.05] blur-[100px] transform-gpu pointer-events-none transition-colors duration-500 ${prefersReducedMotion ? '' : 'animate-careerai-blob-2'}`} />
      <div className={`absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-violet-400/[0.022] dark:bg-violet-500/[0.06] blur-[120px] transform-gpu pointer-events-none transition-colors duration-500 ${prefersReducedMotion ? '' : 'animate-careerai-blob-1'}`} />
      <div className={`absolute bottom-[20%] left-[10%] w-[380px] h-[380px] rounded-full bg-indigo-300/[0.015] dark:bg-indigo-400/[0.045] blur-[90px] transform-gpu pointer-events-none transition-colors duration-500 ${prefersReducedMotion ? '' : 'animate-careerai-blob-2'}`} />

      {/* Floating Micro-Particles (Extremely subtle, 12 non-distracting 2-3px dots) */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[12%] left-[15%] w-1.5 h-1.5 rounded-full bg-indigo-400/20 animate-careerai-particle" style={{ animationDuration: '18s', animationDelay: '0s' }} />
          <div className="absolute top-[28%] right-[22%] w-2 h-2 rounded-full bg-cyan-400/20 animate-careerai-particle" style={{ animationDuration: '22s', animationDelay: '3s' }} />
          <div className="absolute top-[48%] left-[28%] w-1 h-1 rounded-full bg-violet-400/25 animate-careerai-particle" style={{ animationDuration: '15s', animationDelay: '5s' }} />
          <div className="absolute top-[64%] right-[14%] w-1.5 h-1.5 rounded-full bg-indigo-500/20 animate-careerai-particle" style={{ animationDuration: '20s', animationDelay: '2s' }} />
          <div className="absolute top-[82%] left-[40%] w-2 h-2 rounded-full bg-cyan-500/20 animate-careerai-particle" style={{ animationDuration: '24s', animationDelay: '7s' }} />
          <div className="absolute top-[20%] left-[65%] w-1.5 h-1.5 rounded-full bg-indigo-300/25 animate-careerai-particle" style={{ animationDuration: '17s', animationDelay: '4s' }} />
          <div className="absolute top-[75%] left-[18%] w-1 h-1 rounded-full bg-slate-400/20 animate-careerai-particle" style={{ animationDuration: '21s', animationDelay: '1s' }} />
          <div className="absolute top-[40%] right-[35%] w-2 h-2 rounded-full bg-violet-300/20 animate-careerai-particle" style={{ animationDuration: '19s', animationDelay: '6s' }} />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LAYER 2: CareerAI Logo Watermarks Composition                   */}
      {/* ------------------------------------------------------------- */}

      {/* 1. TOP-RIGHT: Large Faint Logo (partially offscreen) */}
      <div
        ref={wm1Ref}
        className="absolute -top-12 -right-12 sm:-top-8 sm:-right-8 md:-top-4 md:-right-6 w-72 sm:w-96 md:w-[460px] lg:w-[540px] aspect-square transition-transform duration-75 ease-out"
      >
        <div
          className={`w-full h-full flex items-center justify-center ${
            prefersReducedMotion ? 'opacity-[0.045]' : 'animate-careerai-wm-1'
          }`}
        >
          <img
            src="/careerai-logo.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain pointer-events-none select-none filter contrast-105"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* 2. MIDDLE-LEFT: Small Faint Logo */}
      <div
        ref={wm2Ref}
        className="absolute top-[36%] -left-10 sm:-left-8 md:-left-6 w-44 sm:w-56 md:w-64 lg:w-72 aspect-square transition-transform duration-75 ease-out"
      >
        <div
          className={`w-full h-full flex items-center justify-center ${
            prefersReducedMotion ? 'opacity-[0.035]' : 'animate-careerai-wm-2'
          }`}
        >
          <img
            src="/careerai-logo.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain pointer-events-none select-none filter contrast-105"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* 3. BOTTOM-RIGHT: Medium Faint Logo (hidden on small mobile) */}
      <div
        ref={wm3Ref}
        className="hidden sm:block absolute top-[68%] -right-10 md:-right-6 w-56 sm:w-64 md:w-80 lg:w-96 aspect-square transition-transform duration-75 ease-out"
      >
        <div
          className={`w-full h-full flex items-center justify-center ${
            prefersReducedMotion ? 'opacity-[0.04]' : 'animate-careerai-wm-3'
          }`}
        >
          <img
            src="/careerai-logo.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain pointer-events-none select-none filter contrast-105"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* 4. BOTTOM-LEFT: Very Small Faint Logo (desktop & large tablet) */}
      <div
        ref={wm4Ref}
        className="hidden lg:block absolute top-[85%] left-6 lg:left-12 w-36 sm:w-44 lg:w-52 aspect-square transition-transform duration-75 ease-out"
      >
        <div
          className={`w-full h-full flex items-center justify-center ${
            prefersReducedMotion ? 'opacity-[0.032]' : 'animate-careerai-wm-4'
          }`}
        >
          <img
            src="/careerai-logo.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain pointer-events-none select-none filter contrast-105"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
