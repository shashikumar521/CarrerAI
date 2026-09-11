import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

export interface ThemeToggleProps {
  variant?: 'pill' | 'button' | 'dropdown' | 'compact';
  className?: string;
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'pill',
  className = '',
  showLabels = true,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // VARIANT 1: Sleek Segmented Pill Toggle (☀ Light / 🌙 Dark)
  if (variant === 'pill') {
    return (
      <div
        className={`relative inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs select-none ${className}`}
        role="group"
        aria-label="Theme mode selector"
      >
        {/* Light Option Button */}
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            resolvedTheme === 'light' && theme !== 'system'
              ? 'text-indigo-900 dark:text-indigo-200'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          aria-pressed={resolvedTheme === 'light' && theme !== 'system'}
          title="Switch to Light Mode"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300" />
          {showLabels && <span>Light</span>}
        </button>

        {/* Dark Option Button */}
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            resolvedTheme === 'dark' && theme !== 'system'
              ? 'text-indigo-900 dark:text-indigo-200'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          aria-pressed={resolvedTheme === 'dark' && theme !== 'system'}
          title="Switch to Dark Mode"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400 transition-transform duration-300" />
          {showLabels && <span>Dark</span>}
        </button>

        {/* Sliding Active Indicator Pill */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
          className={`absolute top-1 bottom-1 rounded-lg bg-white dark:bg-slate-700 shadow-xs pointer-events-none ${
            resolvedTheme === 'dark' ? 'right-1 left-1/2' : 'left-1 right-1/2'
          }`}
        />
      </div>
    );
  }

  // VARIANT 2: Compact Icon Button Toggle (One-Click Light <-> Dark with Dropdown for System)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div className="flex items-center rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 p-0.5 shadow-2xs">
        {/* Main Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
          title={`Currently ${resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode. Click to toggle.`}
          aria-label="Toggle theme mode"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 animate-in spin-in-180 duration-300" />
          )}
          {showLabels && (
            <span className="hidden sm:inline-block capitalize">
              {theme === 'system' ? 'Auto' : resolvedTheme}
            </span>
          )}
        </button>

        {/* Dropdown Chevron for choosing Light / Dark / System */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Theme options"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1 z-50 select-none"
          >
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>☀ Light</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>🌙 Dark</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                theme === 'system'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>💻 System</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
