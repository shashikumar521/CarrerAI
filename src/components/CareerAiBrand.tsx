import React from 'react';

export interface CareerAiBrandProps {
  onClick?: () => void;
  subtitle?: string;
  badge?: string;
  size?: 'navbar' | 'sidebar';
  className?: string;
}

/**
 * CareerAiBrand
 *
 * Distinctive, premium top-left CareerAI app branding:
 * - Authentic CareerAI logo icon + "CareerAI" typography.
 * - Premium AI startup brand appearance using Inter font (weight 600 / semi-bold).
 * - Perfectly aligned vertically.
 * - Subtle futuristic ambient glow around the logo.
 * - Slow, continuous, elegant AI gradient/shimmer across the "CareerAI" text.
 * - Occasional tiny light sweep across the logo (every ~8.5s).
 * - Very subtle gentle micro-float / rotation (max 1.5–2 degrees).
 * - Smooth hover micro-interaction: logo gently scales to 1.03 and whole branding gains a soft glow.
 * - Light and Dark mode calibrated.
 * - Fully responsive on mobile, tablet, and desktop.
 */
export const CareerAiBrand: React.FC<CareerAiBrandProps> = ({
  onClick,
  subtitle = 'Placement Intelligence Engine',
  badge = 'B.Tech',
  size = 'navbar',
  className = '',
}) => {
  const isSidebar = size === 'sidebar';

  return (
    <button
      type="button"
      onClick={onClick}
      id={isSidebar ? 'sidebar-brand-btn' : 'navbar-brand-btn'}
      aria-label="CareerAI Home"
      className={`relative group inline-flex items-center gap-2.5 sm:gap-3 text-left focus:outline-hidden cursor-pointer select-none transition-all duration-300 ${className}`}
    >
      {/* Ambient hover glow halo around the entire branding */}
      <div
        aria-hidden="true"
        className="absolute -inset-2 rounded-2xl bg-indigo-500/0 group-hover:bg-indigo-500/[0.04] dark:group-hover:bg-indigo-400/[0.07] transition-all duration-300 pointer-events-none blur-md -z-10"
      />

      {/* CareerAI Logo Icon Container */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Futuristic Ambient Glow behind logo */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500/30 via-sky-400/25 to-violet-500/25 blur-xs pointer-events-none opacity-80 group-hover:opacity-100 group-hover:blur-sm transition-all duration-300 dark:from-indigo-400/40 dark:via-cyan-400/35 dark:to-indigo-500/35"
        />

        {/* Micro-floating & subtle hover-scale wrapper */}
        <div className="cai-brand-logo-float relative z-10 transition-transform duration-300 ease-out group-hover:scale-[1.03]">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-indigo-500/30 shadow-xs flex items-center justify-center overflow-hidden p-0.5">
            {/* Authentic CareerAI Logo Image */}
            <img
              src="/careerai-logo.png"
              alt="CareerAI Logo"
              className="w-full h-full object-contain rounded-full relative z-10"
              referrerPolicy="no-referrer"
            />

            {/* Occasional subtle diagonal light sweep across logo */}
            <div
              aria-hidden="true"
              className="cai-brand-light-sweep absolute inset-0 pointer-events-none z-20"
            />
          </div>
        </div>
      </div>

      {/* Typography: CareerAI Title, Badge & Subtitle */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          {/* "CareerAI" Text with slow, elegant continuous AI gradient shimmer */}
          <span
            className={`cai-brand-text font-semibold tracking-[-0.015em] font-sans transition-all duration-300 ${
              isSidebar
                ? 'text-[18px] sm:text-[19px]'
                : 'text-[19px] sm:text-[21px]'
            }`}
          >
            CareerAI
          </span>

          {/* Clean tech badge */}
          {badge && (
            <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 transition-colors">
              {badge}
            </span>
          )}
        </div>

        {/* Platform Subtitle */}
        {subtitle && (
          <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
};
