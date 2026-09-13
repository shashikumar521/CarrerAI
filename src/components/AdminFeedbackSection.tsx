import React, { useState, useEffect } from 'react';
import {
  Star,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  User,
  Mail,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';
import type { AuthUser } from '../types';

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  page: string;
  createdAt: string;
}

interface FeedbackStats {
  averageRating: number;
  totalRatings: number;
  starCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface AdminFeedbackSectionProps {
  currentUser: AuthUser | null;
  isAdmin: boolean;
}

export const AdminFeedbackSection: React.FC<AdminFeedbackSectionProps> = ({
  currentUser,
  isAdmin,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);

  // Normal users must NOT be able to access admin feedback
  if (!isAdmin || !currentUser) {
    return null;
  }

  const fetchFeedbackData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        headers: {
          'x-user-email': currentUser.email,
        },
      });

      if (response.status === 403) {
        setError('Access restricted to administrators.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load feedback records');
      }

      const data = await response.json();
      if (data.success) {
        setFeedbacks(data.feedback || []);
        setStats(data.stats || null);
      } else {
        setError(data.error || 'Unable to retrieve feedback');
      }
    } catch (err: any) {
      console.error('Error fetching admin feedback:', err);
      setError('Failed to connect to feedback service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && currentUser) {
      fetchFeedbackData();
    }
  }, [isAdmin, currentUser?.email]);

  const filteredFeedbacks = selectedStarFilter
    ? feedbacks.filter((f) => Math.round(f.rating) === selectedStarFilter)
    : feedbacks;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id="admin-feedback-section"
      className="bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/50 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Real-time Feed
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>User Feedback &amp; Ratings</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Direct user reviews, star satisfaction metrics, and student suggestions
          </p>
        </div>

        <button
          type="button"
          id="admin-feedback-refresh-btn"
          onClick={fetchFeedbackData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer w-fit self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error ? (
        <div className="py-8 text-center">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Summary Cards & Distribution */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Average Rating Big Card */}
              <div className="md:col-span-4 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Average Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-slate-100">
                      {stats.totalRatings > 0 ? stats.averageRating : '0.0'}
                    </span>
                    <span className="text-base font-semibold text-slate-400">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= Math.round(stats.averageRating)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-900/30 text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Total Submissions</span>
                  <strong className="text-slate-900 dark:text-slate-100 font-bold">
                    {stats.totalRatings} {stats.totalRatings === 1 ? 'Rating' : 'Ratings'}
                  </strong>
                </div>
              </div>

              {/* Star Rating Breakdown Bars */}
              <div className="md:col-span-8 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Rating Distribution
                  </span>
                  <span className="text-[11px] text-slate-400">Click bar to filter</span>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((starsLevel) => {
                    const count = stats.starCounts[starsLevel as keyof typeof stats.starCounts] || 0;
                    const percent =
                      stats.totalRatings > 0
                        ? Math.round((count / stats.totalRatings) * 100)
                        : 0;
                    const isSelected = selectedStarFilter === starsLevel;

                    return (
                      <button
                        key={starsLevel}
                        type="button"
                        onClick={() =>
                          setSelectedStarFilter(isSelected ? null : starsLevel)
                        }
                        className={`w-full flex items-center gap-3 text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-amber-100/70 dark:bg-amber-950/60 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-1 w-12 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                          <span>{starsLevel}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                        </div>

                        <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="w-16 text-right shrink-0 font-medium text-slate-500 dark:text-slate-400 text-[11px]">
                          <span>{count}</span>
                          <span className="text-slate-400 ml-1">({percent}%)</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Feed Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                User Feedback History
              </h3>
              <span className="text-xs text-slate-400">({filteredFeedbacks.length})</span>
            </div>

            {selectedStarFilter && (
              <button
                type="button"
                onClick={() => setSelectedStarFilter(null)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Filter className="w-3 h-3" />
                <span>Clear {selectedStarFilter}★ Filter</span>
              </button>
            )}
          </div>

          {/* Feedback List Table/Cards */}
          {filteredFeedbacks.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {selectedStarFilter
                  ? `No ${selectedStarFilter}-star feedback entries found.`
                  : 'No ratings submitted yet.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Submissions from logged-in users will automatically stream here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedbacks.map((item) => {
                const numStars = Math.round(item.rating);
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      {/* User identity details */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {item.userName ? item.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {item.userName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {item.userEmail}
                          </span>
                        </div>
                      </div>

                      {/* Rating Stars Badge & Timestamp */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/50 rounded-lg">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            {item.rating} / 5
                          </span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= numStars
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Written Comment or default text */}
                    <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      {item.comment ? (
                        <p className="whitespace-pre-wrap">{item.comment}</p>
                      ) : (
                        <span className="italic text-slate-400 dark:text-slate-500">
                          No written feedback provided
                        </span>
                      )}
                    </div>

                    {/* Page Origin Tag */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>Submitted from:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/70 font-medium text-slate-700 dark:text-slate-300">
                          {item.page || 'Dashboard'}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        &#10004; Verified Submission
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
