import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

export interface CareerAiAnimationProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  /** Whether the animation loops continuously (for loading screens) or plays once */
  loop?: boolean;
  /** Callback fired when single-play animation completes */
  onEnded?: () => void;
  /** Optional status title displayed below the animation */
  label?: string;
  /** Optional subtitle or explanatory text */
  sublabel?: string;
  /** Extra CSS classes */
  className?: string;
  /** Clean light background or transparent */
  transparentBg?: boolean;
  /** Auto play video */
  autoPlay?: boolean;
  /** Theme mode for typography */
  theme?: 'light' | 'dark';
}

export const CareerAiAnimation: React.FC<CareerAiAnimationProps> = ({
  size = 'md',
  loop = true,
  onEnded,
  label,
  sublabel,
  className = '',
  transparentBg = false,
  autoPlay = true,
  theme = 'light',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Fallback safety timer for single-play (e.g. startup intro)
  useEffect(() => {
    if (!loop && onEnded) {
      // Safety timeout: transition after 4.6 seconds even if video event fails
      const timer = setTimeout(() => {
        onEnded();
      }, 4600);
      return () => clearTimeout(timer);
    }
  }, [loop, onEnded]);

  // Size styling maps
  const sizeClasses = {
    sm: 'w-24 h-24 sm:w-28 sm:h-28',
    md: 'w-36 h-36 sm:w-44 sm:h-44',
    lg: 'w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72',
    xl: 'w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96',
    fullscreen: 'w-64 h-64 sm:w-80 sm:h-80 md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px]',
  }[size];

  const playPromiseRef = useRef<Promise<void> | null>(null);
  const isPlayingIntentRef = useRef<boolean>(false);

  // Safe video playback lifecycle management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    if (autoPlay) {
      isPlayingIntentRef.current = true;
      const promise = video.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise
          .then(() => {
            if (!isPlayingIntentRef.current && isMounted && videoRef.current) {
              try {
                videoRef.current.pause();
              } catch {
                // ignore
              }
            }
          })
          .catch((err: any) => {
            // Standard benign HTML5 video cancellation when interrupted
            if (
              err?.name === 'AbortError' ||
              err?.message?.includes('interrupted') ||
              err?.message?.includes('pause')
            ) {
              return;
            }
            if (err?.name === 'NotAllowedError') {
              return;
            }
            console.warn('CareerAI video autoplay note:', err?.message || err);
          })
          .finally(() => {
            playPromiseRef.current = null;
          });
      }
    } else {
      isPlayingIntentRef.current = false;
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (!isPlayingIntentRef.current && videoRef.current) {
              try {
                videoRef.current.pause();
              } catch {
                // ignore
              }
            }
          })
          .catch(() => {});
      } else {
        try {
          video.pause();
        } catch {
          // ignore
        }
      }
    }

    return () => {
      isMounted = false;
      isPlayingIntentRef.current = false;
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {
          // ignore
        }
      }
    };
  }, [autoPlay]);

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        transparentBg ? 'bg-transparent' : 'bg-white'
      } ${className}`}
      role="status"
      aria-label={label || 'CareerAI is loading'}
    >
      <div className={`relative flex items-center justify-center ${sizeClasses} aspect-square`}>
        {!videoError ? (
          <video
            ref={videoRef}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              videoLoaded ? 'opacity-100' : 'opacity-90'
            }`}
            loop={loop}
            muted
            playsInline
            controls={false}
            preload="auto"
            onLoadedData={() => setVideoLoaded(true)}
            onEnded={() => {
              if (!loop && onEnded) {
                onEnded();
              }
            }}
            onError={() => {
              console.warn('CareerAI video failed to load, switching to official brand image fallback.');
              setVideoError(true);
            }}
          >
            <source src="/careerai-animation.webm" type="video/webm" />
            <source src="/careerai-animation.mp4" type="video/mp4" />
          </video>
        ) : (
          /* Official CareerAI Brand Image Fallback if browser video is unavailable */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Ambient golden glow */}
            <div className="absolute inset-2 rounded-full bg-amber-400/15 blur-xl animate-pulse" />
            <motion.img
              src="/careerai-logo.png"
              alt="CareerAI Official Logo"
              className="w-full h-full object-contain relative z-10"
              animate={{
                scale: [1, 1.025, 1],
                y: [0, -4, 0],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        )}
      </div>

      {/* Label and status text */}
      {(label || sublabel) && (
        <div className="mt-4 text-center px-4 max-w-sm">
          {label && (
            <p
              className={`text-sm sm:text-base font-semibold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}
            >
              {label}
            </p>
          )}
          {sublabel && (
            <p
              className={`text-xs mt-1 leading-relaxed ${
                theme === 'dark' ? 'text-amber-200/80' : 'text-slate-600'
              }`}
            >
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerAiAnimation;
