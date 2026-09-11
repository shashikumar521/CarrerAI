import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CareerAiAnimation } from './CareerAiAnimation';

export interface CareerAiLoadingScreenProps {
  /** Whether the full-screen loading screen is visible */
  show: boolean;
  /** Primary status message */
  title?: string;
  /** Detailed sub-message */
  subtitle?: string;
  /** Solid white background (true) or light semi-transparent backdrop blur (false) */
  solidBg?: boolean;
  /** Optional callback to force-dismiss in case of network issue */
  onDismiss?: () => void;
  /** Max timeout in ms before automatic dismissal to prevent locking UI (default: 12000) */
  timeoutMs?: number;
}

export const CareerAiLoadingScreen: React.FC<CareerAiLoadingScreenProps> = ({
  show,
  title = 'Loading CareerAI...',
  subtitle = 'Analyzing placement intelligence & career metrics',
  solidBg = false,
  onDismiss,
  timeoutMs = 12000,
}) => {
  // Safety timeout: Never leave user stranded if an API call hangs
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      console.warn('CareerAiLoadingScreen safety timeout reached. Auto-dismissing.');
      onDismiss?.();
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [show, timeoutMs, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="careerai-global-loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 select-none ${
            solidBg ? 'bg-white' : 'bg-white/95 backdrop-blur-md'
          }`}
          style={{ pointerEvents: 'auto' }}
          aria-live="polite"
          aria-busy="true"
        >
          {/* Ambient subtle glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Centered Proportional CareerAI Animation */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
            <CareerAiAnimation
              size="lg"
              loop={true}
              transparentBg={true}
              theme="light"
              label={title}
              sublabel={subtitle}
            />

            {/* Subtle brand assurance pill */}
            <div className="mt-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>CareerAI Intelligence Engine</span>
            </div>

            {/* Emergency dismiss button if taking longer than 6 seconds */}
            {onDismiss && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5.0 }}
                onClick={onDismiss}
                type="button"
                className="mt-6 text-xs text-slate-500 hover:text-indigo-600 underline cursor-pointer transition-colors"
              >
                Taking longer than expected? Dismiss
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CareerAiLoadingScreen;
