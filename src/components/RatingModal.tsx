import React, { useState, useEffect } from 'react';
import { Star, X, Loader2, Heart, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AuthUser } from '../types';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  currentPage?: string;
  onFeedbackSubmitted?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Good & Helpful',
  4: 'Very Good Platform',
  5: 'Outstanding Experience!',
};

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentPage = 'Dashboard',
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setSubmitting(false);
      setSubmitted(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted) return;

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating (1–5).');
      return;
    }

    if (!currentUser) {
      setErrorMessage('You must be signed in to submit a rating.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          rating,
          comment: comment.trim(),
          page: currentPage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
        // Gracefully auto-close after 2.8 seconds
        setTimeout(() => {
          onClose();
        }, 2800);
      } else {
        setErrorMessage(data.error || 'Failed to submit rating. Please try again.');
      }
    } catch (err: any) {
      console.error('Rating submission network error:', err);
      setErrorMessage('Unable to connect to feedback server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStarCount = hoverRating || rating;

  return (
    <AnimatePresence>
      <div
        id="rating-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={(e) => {
          if (e.target === e.currentTarget && !submitting) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Accent Strip */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-600" />

          {/* Close Button */}
          <button
            type="button"
            id="rating-modal-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close Rating Modal"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {submitted ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 px-4 text-center flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-full flex items-center justify-center mb-4 ring-8 ring-amber-100/50 dark:ring-amber-900/30">
                  <Heart className="w-8 h-8 fill-rose-500 text-rose-500 animate-pulse" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Thank you for your feedback! ❤️
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mb-6">
                  Your rating helps us continuously refine CareerAI to better support your placement journey.
                </p>

                <div className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Rating received &amp; permanently saved</span>
                </div>
              </motion.div>
            ) : (
              /* Rating Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Modal Title */}
                <div className="text-center pt-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>CareerAI Community Feedback</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    How would you rate CareerAI?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select 1 to 5 stars to rate your overall experience
                  </p>
                </div>

                {/* Star Rating Interactive Selector */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div
                    className="flex items-center gap-2 sm:gap-3"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((starNum) => {
                      const isFilled = starNum <= activeStarCount;
                      return (
                        <button
                          key={starNum}
                          type="button"
                          id={`star-btn-${starNum}`}
                          aria-label={`Rate ${starNum} star${starNum > 1 ? 's' : ''}`}
                          onMouseEnter={() => setHoverRating(starNum)}
                          onClick={() => {
                            setRating(starNum);
                            setErrorMessage(null);
                          }}
                          className="p-1 sm:p-1.5 rounded-lg transition-transform hover:scale-115 focus:outline-hidden cursor-pointer"
                        >
                          <Star
                            className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                                : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Label Preview */}
                  <div className="h-6 mt-2 flex items-center justify-center">
                    {activeStarCount > 0 ? (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 animate-fadeIn">
                        {activeStarCount} / 5 &bull; {RATING_LABELS[activeStarCount]}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Tap a star to select
                      </span>
                    )}
                  </div>
                </div>

                {/* What could we improve? Text Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="feedback-comment-input"
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      What could we improve?
                    </label>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Optional
                    </span>
                  </div>
                  <textarea
                    id="feedback-comment-input"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you love or how we can make CareerAI better for your placements..."
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none"
                    maxLength={2000}
                  />
                </div>

                {/* Logged-in User Context Confirmation */}
                {currentUser && (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-lg flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Submitting as <strong className="text-slate-700 dark:text-slate-300 font-semibold">{currentUser.name}</strong>
                    </span>
                    <span className="truncate max-w-[150px] font-mono text-[10px]">
                      {currentUser.email}
                    </span>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-feedback-btn"
                    disabled={submitting || rating === 0}
                    className="flex-2 py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Feedback</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
