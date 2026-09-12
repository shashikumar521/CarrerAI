import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';

export interface LoadingOptions {
  title?: string;
  subtitle?: string;
  minDisplayMs?: number;
}

interface ActiveLoadingItem {
  key: string;
  title?: string;
  subtitle?: string;
  startTime: number;
}

interface LoadingContextType {
  /** Start a loading operation with a unique key and optional messaging */
  startLoading: (key: string, options?: LoadingOptions) => void;
  /** Stop a loading operation for a specific key */
  stopLoading: (key: string) => void;
  /** Wrap an existing Promise with the global loading system */
  withLoading: <T>(key: string, promise: Promise<T>, options?: LoadingOptions) => Promise<T>;
  /** Whether any loading task is active */
  isLoading: boolean;
  /** Whether the full-screen visual overlay is currently displayed (past delay threshold) */
  isOverlayVisible: boolean;
  /** Active title */
  title: string;
  /** Active subtitle */
  subtitle: string;
  /** Force-dismiss all loading (emergency fallback / timeout) */
  dismissAll: () => void;
  /** Whether the first-visit / replay startup intro is active */
  isIntroActive: boolean;
  /** Complete startup intro */
  completeIntro: () => void;
  /** Trigger/replay startup intro */
  triggerIntro: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const INTRO_SESSION_KEY = 'careerai_startup_shown_v1';
const DELAY_THRESHOLD_MS = 280; // Only show full-screen overlay if operation takes > 280ms
const MIN_VISIBLE_DISPLAY_MS = 400; // Minimum time overlay remains visible to avoid visual jitter
const SAFETY_TIMEOUT_MS = 14000; // Maximum safety timeout before auto-dismissal

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTasks, setActiveTasks] = useState<Map<string, ActiveLoadingItem>>(new Map());
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [activeTitle, setActiveTitle] = useState('Loading CareerAI...');
  const [activeSubtitle, setActiveSubtitle] = useState(
    'Analyzing placement intelligence & career metrics'
  );

  // First visit intro state: Check if intro was already seen in this session
  const [isIntroActive, setIsIntroActive] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return sessionStorage.getItem(INTRO_SESSION_KEY) !== 'true';
    } catch {
      return false;
    }
  });

  const thresholdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const visibleStartTimeRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all pending timers on unmount
  useEffect(() => {
    return () => {
      if (thresholdTimerRef.current) clearTimeout(thresholdTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  const dismissAll = useCallback(() => {
    if (thresholdTimerRef.current) {
      clearTimeout(thresholdTimerRef.current);
      thresholdTimerRef.current = null;
    }
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    visibleStartTimeRef.current = null;
    setActiveTasks(new Map());
    setIsOverlayVisible(false);
  }, []);

  const startLoading = useCallback(
    (key: string, options?: LoadingOptions) => {
      const title = options?.title || 'Loading CareerAI...';
      const subtitle =
        options?.subtitle || 'Analyzing placement intelligence & career metrics';

      setActiveTasks((prev) => {
        const next = new Map(prev);
        next.set(key, {
          key,
          title,
          subtitle,
          startTime: Date.now(),
        });
        return next;
      });

      setActiveTitle(title);
      setActiveSubtitle(subtitle);

      // Setup safety timeout to never trap the user if an API hangs
      if (!safetyTimeoutRef.current) {
        safetyTimeoutRef.current = setTimeout(() => {
          console.warn('CareerAI loading safety timeout reached. Auto-dismissing overlay.');
          dismissAll();
        }, SAFETY_TIMEOUT_MS);
      }

      // If overlay is already visible, just update messaging
      if (isOverlayVisible) return;

      // Start the delay threshold timer:
      // If the operation finishes within DELAY_THRESHOLD_MS, isOverlayVisible remains FALSE (instant feel!)
      if (!thresholdTimerRef.current) {
        thresholdTimerRef.current = setTimeout(() => {
          thresholdTimerRef.current = null;
          visibleStartTimeRef.current = Date.now();
          setIsOverlayVisible(true);
        }, DELAY_THRESHOLD_MS);
      }
    },
    [isOverlayVisible, dismissAll]
  );

  const stopLoading = useCallback(
    (key: string) => {
      setActiveTasks((prev) => {
        const next = new Map(prev);
        next.delete(key);

        if (next.size === 0) {
          // If all tasks finished before delay threshold fired, cancel threshold timer:
          // Result: Overlay never appears, interface feels instant!
          if (thresholdTimerRef.current) {
            clearTimeout(thresholdTimerRef.current);
            thresholdTimerRef.current = null;
          }

          if (safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
          }

          // If overlay was actually shown, ensure minimum display duration to prevent flicker
          if (visibleStartTimeRef.current !== null) {
            const elapsed = Date.now() - visibleStartTimeRef.current;
            const remaining = Math.max(0, MIN_VISIBLE_DISPLAY_MS - elapsed);

            if (remaining > 0) {
              if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
              dismissTimerRef.current = setTimeout(() => {
                visibleStartTimeRef.current = null;
                setIsOverlayVisible(false);
                dismissTimerRef.current = null;
              }, remaining);
            } else {
              visibleStartTimeRef.current = null;
              setIsOverlayVisible(false);
            }
          } else {
            setIsOverlayVisible(false);
          }
        } else {
          // Update message to the next active task if available
          const nextTask = next.values().next().value;
          if (nextTask) {
            if (nextTask.title) setActiveTitle(nextTask.title);
            if (nextTask.subtitle) setActiveSubtitle(nextTask.subtitle);
          }
        }

        return next;
      });
    },
    []
  );

  const withLoading = useCallback(
    async <T,>(key: string, promise: Promise<T>, options?: LoadingOptions): Promise<T> => {
      startLoading(key, options);
      try {
        const result = await promise;
        return result;
      } catch (err) {
        // Stop loading immediately so existing error UI can render without delay
        stopLoading(key);
        throw err;
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading]
  );

  const completeIntro = useCallback(() => {
    setIsIntroActive(false);
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch (e) {
      console.warn('Session storage note:', e);
    }
  }, []);

  const triggerIntro = useCallback(() => {
    setIsIntroActive(true);
  }, []);

  const isLoading = activeTasks.size > 0;

  const value: LoadingContextType = {
    startLoading,
    stopLoading,
    withLoading,
    isLoading,
    isOverlayVisible,
    title: activeTitle,
    subtitle: activeSubtitle,
    dismissAll,
    isIntroActive,
    completeIntro,
    triggerIntro,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
