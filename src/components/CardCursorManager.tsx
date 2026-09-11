import React, { useEffect } from 'react';

/**
 * CardCursorManager
 *
 * Provides delegated mouse tracking for all cards on the site:
 * - Computes relative cursor position for the internal radial light effect.
 * - Computes subtle 3D tilt angles (maximum 1–2 degrees).
 * - Smoothly handles enter and leave transitions.
 * - Respects prefers-reduced-motion and touch device constraints.
 */
export const CardCursorManager: React.FC = () => {
  useEffect(() => {
    // Only activate on pointer devices that support fine hover and user has not reduced motion
    const hasFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFineHover || prefersReducedMotion) {
      return;
    }

    let activeCard: HTMLElement | null = null;

    const findCard = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof HTMLElement)) return null;

      // Ignore modals, dropdowns, or explicitly excluded elements
      if (target.closest('.cai-no-tilt, [role="dialog"], #navbar-user-menu, .modal-backdrop')) {
        return null;
      }

      // Check for elements designed as cards (dashboard, skills, jobs, courses, placement, profile, etc.)
      return target.closest<HTMLElement>(
        '.cai-card, [data-cai-card], .bg-white.border.rounded-2xl, .bg-white.border.rounded-xl, .bg-slate-900\\/50.border.rounded-2xl'
      );
    };

    const handlePointerMove = (e: PointerEvent) => {
      const card = findCard(e.target);

      // If moved off previous card, reset it
      if (activeCard && activeCard !== card) {
        activeCard.style.setProperty('--cai-tilt-x', '0deg');
        activeCard.style.setProperty('--cai-tilt-y', '0deg');
        activeCard.style.setProperty('--cai-mouse-x', '-9999px');
        activeCard.style.setProperty('--cai-mouse-y', '-9999px');
        activeCard = null;
      }

      if (!card) return;

      activeCard = card;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates from 0 to 1
      const nx = Math.max(0, Math.min(1, x / rect.width));
      const ny = Math.max(0, Math.min(1, y / rect.height));

      // Calculate very slight 3D tilt (maximum 1.5 degrees)
      const tiltX = (ny - 0.5) * -1.8; // deg
      const tiltY = (nx - 0.5) * 1.8;  // deg

      card.style.setProperty('--cai-mouse-x', `${x.toFixed(1)}px`);
      card.style.setProperty('--cai-mouse-y', `${y.toFixed(1)}px`);
      card.style.setProperty('--cai-tilt-x', `${tiltX.toFixed(2)}deg`);
      card.style.setProperty('--cai-tilt-y', `${tiltY.toFixed(2)}deg`);
    };

    const handlePointerLeave = () => {
      if (activeCard) {
        activeCard.style.setProperty('--cai-tilt-x', '0deg');
        activeCard.style.setProperty('--cai-tilt-y', '0deg');
        activeCard.style.setProperty('--cai-mouse-x', '-9999px');
        activeCard.style.setProperty('--cai-mouse-y', '-9999px');
        activeCard = null;
      }
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      if (activeCard) {
        activeCard.style.setProperty('--cai-tilt-x', '0deg');
        activeCard.style.setProperty('--cai-tilt-y', '0deg');
      }
    };
  }, []);

  return null;
};
