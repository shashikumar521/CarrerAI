import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Code2,
  Cloud,
  Target,
  Sparkles,
} from 'lucide-react';

export const CareerAi3DOrbVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device to disable mouse parallax and optimize mobile battery/performance
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Calculate tilt transform for desktop 3D perspective (disabled on touch devices)
  // Calculate subtle tilt transform for desktop 3D perspective (disabled on touch devices)
  const tiltX = isHovered && !isTouchDevice ? -mousePos.y * 10 : 0;
  const tiltY = isHovered && !isTouchDevice ? mousePos.x * 12 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[310px] min-[360px]:max-w-[340px] min-[390px]:max-w-[370px] min-[430px]:max-w-[400px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[530px] h-[310px] min-[360px]:h-[340px] min-[390px]:h-[370px] sm:h-[450px] lg:h-[480px] xl:h-[490px] mx-auto flex items-center justify-center select-none"
      style={{ perspective: '1100px' }}
      aria-hidden="true"
    >
      {/* =========================================================================
          AMBIENT BACK-LIGHTING HALO (Soft Purple & Sky Ambient Depth)
          ========================================================================= */}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-[#5945E8]/18 via-[#7868F5]/14 to-sky-400/10 rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: isTouchDevice ? undefined : `scale(${isHovered ? 1.05 : 1}) translate(${mousePos.x * 14}px, ${mousePos.y * 14}px)`,
        }}
      />
      <div className="absolute w-40 h-40 sm:w-60 sm:h-60 bg-violet-400/12 rounded-full blur-2xl pointer-events-none cai-breathing-glow" />

      {/* =========================================================================
          3D STAGE WRAPPER (Tilts gently with desktop mouse parallax)
          ========================================================================= */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isTouchDevice ? undefined : `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        }}
      >
        {/* SVG CONSTELLATION, AMBIENT PARTICLES & ORBITAL GUIDE RINGS */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="orbGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5945E8" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#7868F5" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.12" />
            </linearGradient>

            <linearGradient id="orbGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7868F5" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#4F46E5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.06" />
            </linearGradient>

            <radialGradient id="particleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="60%" stopColor="#7868F5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#5945E8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Dashed Orbit - Clockwise Slow (42s) */}
          <g className="cai-orbit-spin-slow" style={{ transformOrigin: '250px 250px' }}>
            <ellipse
              cx="250"
              cy="250"
              rx="205"
              ry="110"
              stroke="url(#orbGrad1)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
          </g>

          {/* Secondary Counter Orbit - Counter-Clockwise (34s) */}
          <g className="cai-orbit-spin-reverse" style={{ transformOrigin: '250px 250px' }}>
            <ellipse
              cx="250"
              cy="250"
              rx="175"
              ry="135"
              transform="rotate(-30 250 250)"
              stroke="url(#orbGrad2)"
              strokeWidth="1.5"
              strokeDasharray="6 8"
            />
          </g>

          {/* Inner Tilted Orbit - Clockwise (26s) */}
          <g className="cai-orbit-spin-inner" style={{ transformOrigin: '250px 250px' }}>
            <ellipse
              cx="250"
              cy="250"
              rx="135"
              ry="75"
              transform="rotate(45 250 250)"
              stroke="#5945E8"
              strokeOpacity="0.38"
              strokeWidth="1.25"
            />
          </g>

          {/* Constellation Connection Beams to Nodes */}
          <line x1="250" y1="250" x2="110" y2="120" stroke="#7868F5" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="250" y1="250" x2="390" y2="145" stroke="#5945E8" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="250" y1="250" x2="385" y2="375" stroke="#38BDF8" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="250" y1="250" x2="115" y2="350" stroke="#A855F7" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 3" />

          {/* Ambient Glowing Celestial Particles */}
          <g className="cai-particle-drift-1" style={{ transformOrigin: '250px 250px' }}>
            <circle cx="195" cy="180" r="2.2" fill="#38BDF8" fillOpacity="0.85" filter="drop-shadow(0 0 3px #38BDF8)" />
          </g>

          <g className="cai-particle-drift-2" style={{ transformOrigin: '250px 250px' }}>
            <circle cx="310" cy="185" r="2" fill="#A855F7" fillOpacity="0.8" filter="drop-shadow(0 0 3px #A855F7)" />
          </g>

          <g className="cai-particle-drift-3" style={{ transformOrigin: '250px 250px' }}>
            <circle cx="230" cy="325" r="2.4" fill="#7868F5" fillOpacity="0.85" filter="drop-shadow(0 0 3px #7868F5)" />
          </g>

          <g className="cai-particle-drift-4" style={{ transformOrigin: '250px 250px' }}>
            <circle cx="285" cy="295" r="1.8" fill="#38BDF8" fillOpacity="0.75" />
          </g>

          <circle cx="160" cy="90" r="2" fill="#FFFFFF" fillOpacity="0.85" className="animate-ping" style={{ animationDuration: '3.5s' }} />
          <circle cx="340" cy="80" r="1.6" fill="#7868F5" fillOpacity="0.8" />
          <circle cx="430" cy="270" r="2" fill="#38BDF8" fillOpacity="0.6" />
          <circle cx="70" cy="240" r="1.5" fill="#5945E8" fillOpacity="0.5" />
          <circle cx="280" cy="420" r="2" fill="#7868F5" fillOpacity="0.65" />
        </svg>

        {/* =========================================================================
            CENTRAL LUMINOUS 3D ORB
            Layered realistic lighting, depth, subtle breathing glow, stable logo
            ========================================================================= */}
        <div className="relative z-20 flex items-center justify-center cai-orb-float">
          {/* External Rotating Light Halo */}
          <div className="absolute w-28 h-28 min-[360px]:w-32 min-[360px]:h-32 sm:w-44 sm:h-44 md:w-50 md:h-50 rounded-full border border-violet-400/35 cai-orbit-spin-slow pointer-events-none" />

          {/* Luminous Corona with Breathing Glow */}
          <div className="absolute w-24 h-24 min-[360px]:w-28 min-[360px]:h-28 sm:w-38 sm:h-38 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-[#5945E8] via-[#7868F5] to-cyan-400 opacity-75 blur-md cai-breathing-glow pointer-events-none" />

          {/* Core 3D Shaded Sphere (Realistic Layered Multi-Point Depth & Lighting) */}
          <div className="relative w-20 h-20 min-[360px]:w-22 min-[360px]:h-22 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#6366F1] shadow-[inset_-8px_-8px_20px_rgba(0,0,0,0.7),inset_8px_8px_20px_rgba(255,255,255,0.45),0_0_36px_rgba(89,69,232,0.6),0_10px_25px_rgba(20,33,61,0.18)] flex items-center justify-center border border-white/50 overflow-hidden">
            {/* Ambient Surface Rotation */}
            <div className="absolute inset-0 cai-orb-axial-spin pointer-events-none opacity-40">
              <div className="absolute inset-1 rounded-full border border-white/25" />
              <div className="absolute inset-2 sm:inset-3 rounded-full border border-violet-300/30" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/45" />
            </div>

            {/* Inner Shimmer Reflection Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent cai-shimmer-sweep pointer-events-none" />

            {/* Core Neural Icon & CareerAI Brand (Stable, Readable) */}
            <div className="relative z-10 flex flex-col items-center justify-center text-white pointer-events-none">
              <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_2px_8px_rgba(0,0,0,0.3)]">
                <Sparkles className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white cai-sparkle-breathe" />
              </div>
              <span className="text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] mt-0.5 sm:mt-1">
                CareerAI
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FLOATING SKILL & CAREER PATH CARDS
            Independent Desynchronized Floating Animations
            Light Glass-Like SaaS Surfaces & Smooth Hover Elevation
            Balanced Spacing Around Central Sphere (No Overlaps)
            ========================================================================= */}

        {/* Card 1: AI Mentorship (Upper-Left) */}
        <div
          className="absolute top-1 left-0.5 min-[360px]:top-1.5 min-[360px]:left-1 sm:top-5 sm:left-2 lg:top-7 lg:left-3 z-30 transition-transform duration-500 ease-out pointer-events-auto"
          style={{
            transform: isTouchDevice ? undefined : `translate3d(${mousePos.x * -12}px, ${mousePos.y * -12}px, 25px)`,
          }}
        >
          <div className="cai-float-card-1">
            <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-2.5 px-2 py-1.5 min-[360px]:px-2.5 min-[360px]:py-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_16px_rgba(20,33,61,0.06),0_1px_3px_rgba(89,69,232,0.04)] hover:shadow-[0_12px_28px_rgba(89,69,232,0.18)] hover:border-[#5945E8]/60 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-[#5945E8]/10 text-[#5945E8] flex items-center justify-center group-hover:bg-[#5945E8] group-hover:text-white transition-colors duration-200 shrink-0">
                <Bot className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] min-[360px]:text-[11px] font-bold text-[#14213D] leading-none whitespace-nowrap">
                  AI Mentorship
                </span>
                <span className="text-[8px] min-[360px]:text-[9px] text-[#5945E8] font-medium mt-0.5 whitespace-nowrap">
                  <span className="hidden min-[360px]:inline">Career Path </span>Guidance
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Core Engineering (Upper-Right) */}
        <div
          className="absolute top-10 right-0.5 min-[360px]:top-11 min-[360px]:right-1 sm:top-6 sm:right-2 lg:top-8 lg:right-3 z-30 transition-transform duration-500 ease-out pointer-events-auto"
          style={{
            transform: isTouchDevice ? undefined : `translate3d(${mousePos.x * 14}px, ${mousePos.y * 12}px, 30px)`,
          }}
        >
          <div className="cai-float-card-2">
            <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-2.5 px-2 py-1.5 min-[360px]:px-2.5 min-[360px]:py-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_16px_rgba(20,33,61,0.06),0_1px_3px_rgba(89,69,232,0.04)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.18)] hover:border-emerald-500/60 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200 shrink-0">
                <Code2 className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] min-[360px]:text-[11px] font-bold text-[#14213D] leading-none whitespace-nowrap">
                  Core Engineering
                </span>
                <span className="text-[8px] min-[360px]:text-[9px] text-emerald-600 font-medium mt-0.5 whitespace-nowrap">
                  DSA · <span className="hidden min-[360px]:inline">System </span>Design
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Industry Courses (Lower-Right) */}
        <div
          className="absolute bottom-1 right-0.5 min-[360px]:bottom-1.5 min-[360px]:right-1 sm:bottom-5 sm:right-2 lg:bottom-7 lg:right-3 z-30 transition-transform duration-500 ease-out pointer-events-auto"
          style={{
            transform: isTouchDevice ? undefined : `translate3d(${mousePos.x * -12}px, ${mousePos.y * 14}px, 20px)`,
          }}
        >
          <div className="cai-float-card-3">
            <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-2.5 px-2 py-1.5 min-[360px]:px-2.5 min-[360px]:py-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_16px_rgba(20,33,61,0.06),0_1px_3px_rgba(89,69,232,0.04)] hover:shadow-[0_12px_28px_rgba(56,189,248,0.20)] hover:border-[#38BDF8]/65 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors duration-200 shrink-0">
                <Cloud className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] min-[360px]:text-[11px] font-bold text-[#14213D] leading-none whitespace-nowrap">
                  Industry Courses
                </span>
                <span className="text-[8px] min-[360px]:text-[9px] text-sky-600 font-medium mt-0.5 whitespace-nowrap">
                  <span className="hidden min-[360px]:inline">Verified </span>Tech Roadmaps
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Interview Prep (Lower-Left) */}
        <div
          className="absolute bottom-10 left-0.5 min-[360px]:bottom-11 min-[360px]:left-1 sm:bottom-6 sm:left-2 lg:bottom-8 lg:left-3 z-30 transition-transform duration-500 ease-out pointer-events-auto"
          style={{
            transform: isTouchDevice ? undefined : `translate3d(${mousePos.x * 14}px, ${mousePos.y * -12}px, 25px)`,
          }}
        >
          <div className="cai-float-card-4">
            <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-2.5 px-2 py-1.5 min-[360px]:px-2.5 min-[360px]:py-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_16px_rgba(20,33,61,0.06),0_1px_3px_rgba(89,69,232,0.04)] hover:shadow-[0_12px_28px_rgba(168,85,247,0.18)] hover:border-violet-500/60 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors duration-200 shrink-0">
                <Target className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] min-[360px]:text-[11px] font-bold text-[#14213D] leading-none whitespace-nowrap">
                  Interview Prep
                </span>
                <span className="text-[8px] min-[360px]:text-[9px] text-violet-600 font-medium mt-0.5 whitespace-nowrap">
                  <span className="hidden min-[360px]:inline">STAR </span>Drills &amp; Mocks
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS Keyframe Animations (Strictly Compositor-Friendly & Reduced-Motion Compliant) */}
      <style>{`
        @keyframes caiOrbitSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes caiOrbitReverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes caiOrbitInner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes caiShimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }
        @keyframes caiOrbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes caiBreathingGlow {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.12); opacity: 0.88; }
        }
        @keyframes caiAxialSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes caiSparkleBreathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        /* 4 Truly Independent Desynchronized Card Floats (Unshared prime cycle times & phase offsets) */
        @keyframes caiFloatCard1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes caiFloatCard2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(6px); }
        }
        @keyframes caiFloatCard3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes caiFloatCard4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(5px); }
        }

        /* Ambient Celestial Particles Drift */
        @keyframes caiParticleDrift1 {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.85; }
          50% { transform: translate(-7px, -5px); opacity: 0.45; }
        }
        @keyframes caiParticleDrift2 {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.8; }
          50% { transform: translate(5px, -7px); opacity: 0.35; }
        }
        @keyframes caiParticleDrift3 {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.85; }
          50% { transform: translate(-4px, 6px); opacity: 0.4; }
        }
        @keyframes caiParticleDrift4 {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.75; }
          50% { transform: translate(7px, 4px); opacity: 0.3; }
        }

        .cai-orbit-spin-slow {
          animation: caiOrbitSlow 42s linear infinite;
        }
        .cai-orbit-spin-reverse {
          animation: caiOrbitReverse 34s linear infinite;
        }
        .cai-orbit-spin-inner {
          animation: caiOrbitInner 26s linear infinite;
        }
        .cai-shimmer-sweep {
          animation: caiShimmer 6.5s ease-in-out infinite;
        }
        .cai-orb-float {
          animation: caiOrbFloat 5.6s ease-in-out infinite;
        }
        .cai-breathing-glow {
          animation: caiBreathingGlow 4.8s ease-in-out infinite;
        }
        .cai-orb-axial-spin {
          animation: caiAxialSpin 38s linear infinite;
        }
        .cai-sparkle-breathe {
          animation: caiSparkleBreathe 2.8s ease-in-out infinite;
        }

        .cai-float-card-1 {
          animation: caiFloatCard1 5.6s ease-in-out infinite;
        }
        .cai-float-card-2 {
          animation: caiFloatCard2 6.8s ease-in-out infinite 0.8s;
        }
        .cai-float-card-3 {
          animation: caiFloatCard3 5.4s ease-in-out infinite 1.6s;
        }
        .cai-float-card-4 {
          animation: caiFloatCard4 7.2s ease-in-out infinite 0.4s;
        }

        .cai-particle-drift-1 {
          animation: caiParticleDrift1 8s ease-in-out infinite;
        }
        .cai-particle-drift-2 {
          animation: caiParticleDrift2 9.5s ease-in-out infinite 1s;
        }
        .cai-particle-drift-3 {
          animation: caiParticleDrift3 7.5s ease-in-out infinite 0.5s;
        }
        .cai-particle-drift-4 {
          animation: caiParticleDrift4 10s ease-in-out infinite 2s;
        }

        @media (prefers-reduced-motion: reduce) {
          .cai-orbit-spin-slow,
          .cai-orbit-spin-reverse,
          .cai-orbit-spin-inner,
          .cai-shimmer-sweep,
          .cai-orb-float,
          .cai-breathing-glow,
          .cai-orb-axial-spin,
          .cai-sparkle-breathe,
          .cai-float-card-1,
          .cai-float-card-2,
          .cai-float-card-3,
          .cai-float-card-4,
          .cai-particle-drift-1,
          .cai-particle-drift-2,
          .cai-particle-drift-3,
          .cai-particle-drift-4 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
