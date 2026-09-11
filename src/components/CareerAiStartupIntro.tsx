import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CareerAiAnimation } from './CareerAiAnimation';

export interface CareerAiStartupIntroProps {
  onComplete: () => void;
}

export const CareerAiStartupIntro: React.FC<CareerAiStartupIntroProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Fallback timer: intro should last around 4.2 - 4.5 seconds then smoothly fade out
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleFinish = () => {
    setIsVisible(false);
    // Give time for exit animation fade to complete
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="careerai-startup-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-[120] bg-slate-950 flex flex-col items-center justify-center p-4 select-none"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Ambient indigo glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Centered official animation */}
          <div className="relative z-10 flex flex-col items-center justify-center max-w-lg w-full">
            <CareerAiAnimation
              size="fullscreen"
              loop={false}
              autoPlay={true}
              onEnded={handleFinish}
              transparentBg={true}
              theme="dark"
            />

            {/* Subtle brand tag under intro */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                AI Career Guidance &amp; Placement Readiness
              </p>
            </motion.div>
          </div>

          {/* Discreet skip intro button for accessibility and quick navigation */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.3 }}
            onClick={handleFinish}
            type="button"
            className="absolute bottom-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            aria-label="Skip startup animation"
          >
            Skip intro &rarr;
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CareerAiStartupIntro;
