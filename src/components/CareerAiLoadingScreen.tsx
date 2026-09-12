import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface CareerAiLoadingScreenProps {
  /** Whether the full-screen loading screen is visible */
  show: boolean;
  /** Primary status title */
  title?: string;
  /** Detailed sub-message */
  subtitle?: string;
  /** Whether running as startup/replay intro mode (single play with auto-exit) */
  isIntroMode?: boolean;
  /** Callback when intro finishes or user dismisses */
  onComplete?: () => void;
  /** Callback to dismiss loading screen */
  onDismiss?: () => void;
  /** Max timeout in ms before automatic dismissal to prevent locking UI (default: 14000) */
  timeoutMs?: number;
}

export const CareerAiLoadingScreen: React.FC<CareerAiLoadingScreenProps> = ({
  show,
  title = 'Loading CareerAI...',
  subtitle = 'Analyzing placement intelligence & career metrics',
  isIntroMode = false,
  onComplete,
  onDismiss,
  timeoutMs = 14000,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user preference for reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  // Keyboard accessibility: Escape key allows dismissing/skipping
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isIntroMode) {
          onComplete?.();
        } else {
          onDismiss?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, isIntroMode, onComplete, onDismiss]);

  // Video playback lifecycle management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (show) {
      // Autoplay muted when active
      video.currentTime = 0;
      if (!prefersReducedMotion) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('CareerAI video autoplay note:', err?.message || err);
          });
        }
      }
    } else {
      // Pause and reset when hidden to conserve CPU/GPU
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }, [show, prefersReducedMotion]);

  // Fallback safety timeout: Never leave user stuck on screen
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      console.warn('CareerAiLoadingScreen timeout reached. Auto-dismissing.');
      if (isIntroMode) {
        onComplete?.();
      } else {
        onDismiss?.();
      }
    }, isIntroMode ? 4800 : timeoutMs);

    return () => clearTimeout(timer);
  }, [show, isIntroMode, timeoutMs, onComplete, onDismiss]);

  const handleVideoEnded = () => {
    if (isIntroMode && onComplete) {
      onComplete();
    }
  };

  const handleDismiss = () => {
    if (isIntroMode) {
      onComplete?.();
    } else {
      onDismiss?.();
    }
  };

  // Transition parameters: 400-600ms smooth fade as specified
  const transitionConfig = prefersReducedMotion
    ? { duration: 0.2, ease: 'easeOut' as const }
    : { duration: 0.52, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="careerai-premium-global-loading-system"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitionConfig}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden"
          style={{
            backgroundColor: '#070B14',
            pointerEvents: 'auto',
          }}
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={isIntroMode ? 'CareerAI Intro' : title}
        >
          {/* Subtle secondary navy ambient glow (#151B35) & soft blue/purple depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 55% at 50% 45%, #151B35 0%, #070B14 75%)',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[560px] h-[420px] sm:h-[560px] rounded-full pointer-events-none blur-3xl opacity-30"
            style={{
              background:
                'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, rgba(37, 99, 235, 0.06) 45%, transparent 70%)',
            }}
          />

          {/* Centered Content Container */}
          <div className="relative z-10 flex flex-col items-center justify-center max-w-lg w-full text-center px-4">
            {/* Centered uploaded CareerAI video - Uncropped, unstretched, undistorted */}
            <div className="relative flex items-center justify-center w-56 h-56 sm:w-68 sm:h-68 md:w-80 md:h-80 aspect-square">
              {!videoError && !prefersReducedMotion ? (
                <video
                  ref={videoRef}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${
                    videoLoaded ? 'opacity-100' : 'opacity-90'
                  }`}
                  autoPlay={true}
                  muted={true}
                  playsInline={true}
                  loop={!isIntroMode}
                  controls={false}
                  preload="auto"
                  onLoadedData={() => setVideoLoaded(true)}
                  onEnded={handleVideoEnded}
                  onError={() => {
                    console.warn('Video failed to load, activating lightweight brand image fallback.');
                    setVideoError(true);
                  }}
                >
                  {/* Static assets served through CDN */}
                  <source src="/careerai-animation.webm" type="video/webm" />
                  <source src="/careerai-animation.mp4" type="video/mp4" />
                </video>
              ) : (
                /* Lightweight Premium CSS Fallback Animation if video fails or reduced motion */
                <div className="relative w-full h-full flex items-center justify-center">
                  <div
                    className="absolute inset-4 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, #151B35 0%, transparent 70%)',
                    }}
                  />
                  <motion.img
                    src="/careerai-logo.png"
                    alt="CareerAI"
                    className="w-44 h-44 sm:w-56 sm:h-56 object-contain relative z-10"
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            scale: [1, 1.025, 1],
                            opacity: [0.92, 1, 0.92],
                          }
                    }
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Status Information Typography */}
            <div className="mt-4 sm:mt-5 max-w-md w-full">
              {isIntroMode ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-200">
                    CareerAI
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-normal tracking-normal">
                    AI-Powered Career &amp; Placement Platform
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  {title && (
                    <p className="text-sm sm:text-base font-semibold tracking-normal text-slate-100 leading-tight">
                      {title}
                    </p>
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-xs text-slate-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
                      {subtitle}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Minimal Brand Assurance Indicator */}
              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                  CareerAI Intelligence Engine
                </span>
              </div>
            </div>

            {/* Skip / Emergency Dismiss Controls */}
            {isIntroMode ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                onClick={handleDismiss}
                type="button"
                className="mt-6 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white bg-[#151B35]/80 hover:bg-[#151B35] border border-slate-700/60 transition-colors cursor-pointer"
                aria-label="Skip intro animation"
              >
                Skip intro &rarr;
              </motion.button>
            ) : (
              (onDismiss || handleDismiss) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4.0, duration: 0.4 }}
                  onClick={handleDismiss}
                  type="button"
                  className="mt-6 text-[11px] text-slate-500 hover:text-slate-300 underline cursor-pointer transition-colors"
                  aria-label="Dismiss loading screen"
                >
                  Taking longer than expected? Dismiss
                </motion.button>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CareerAiLoadingScreen;
