import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  X,
  BookOpen,
  Award,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Briefcase,
  Target,
  ChevronRight,
} from 'lucide-react';
import { AuthUser, UserNotification } from '../types';
import { NavTab } from './Navbar';
import {
  GUEST_NOTIFICATIONS,
  formatNotificationTime,
  getStoredUserNotifications,
  syncPersonalizedNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  clearAllNotifications,
  USER_NOTIFICATIONS_UPDATED_EVENT,
} from '../utils/userNotificationClient';
import { COURSE_PROGRESS_UPDATED_EVENT } from '../utils/courseSkillService';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onSelectTab: (tab: NavTab) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectTab,
  onOpenAuth,
  onUnreadCountChange,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  // Load and synchronize notifications
  const refreshNotifications = () => {
    if (currentUser?.email) {
      const syncd = syncPersonalizedNotifications(currentUser);
      setNotifications(syncd);
      const unreadCount = syncd.filter((n) => !n.read).length;
      onUnreadCountChange?.(unreadCount);
    } else {
      setNotifications(GUEST_NOTIFICATIONS);
      const unreadCount = GUEST_NOTIFICATIONS.filter((n) => !n.read).length;
      onUnreadCountChange?.(unreadCount);
    }
  };

  // Initial load and user change
  useEffect(() => {
    refreshNotifications();

    // Background fetch from server if logged in
    if (currentUser?.email) {
      fetch('/api/notifications', {
        headers: { 'x-user-email': currentUser.email },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.notifications && Array.isArray(data.notifications)) {
            // Re-sync with local
            const merged = syncPersonalizedNotifications(currentUser);
            setNotifications(merged);
            onUnreadCountChange?.(merged.filter((n) => !n.read).length);
          }
        })
        .catch(() => {});
    }
  }, [currentUser?.email, currentUser?.id]);

  // Listen for course progress updates & notification sync events
  useEffect(() => {
    const handleProgressUpdate = () => {
      refreshNotifications();
    };

    const handleNotificationsUpdated = () => {
      if (currentUser?.email) {
        const stored = getStoredUserNotifications(currentUser.email);
        setNotifications(stored);
        onUnreadCountChange?.(stored.filter((n) => !n.read).length);
      }
    };

    window.addEventListener(COURSE_PROGRESS_UPDATED_EVENT, handleProgressUpdate);
    window.addEventListener(USER_NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);

    return () => {
      window.removeEventListener(COURSE_PROGRESS_UPDATED_EVENT, handleProgressUpdate);
      window.removeEventListener(USER_NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
    };
  }, [currentUser?.email, currentUser?.id]);

  // Handle click outside and Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Prevent immediate close if clicking the notification trigger button
        const target = e.target as HTMLElement;
        if (target.closest('#header-notifications-btn')) return;
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Mark all as read
  const handleMarkAllRead = () => {
    if (currentUser?.email) {
      const updated = markAllNotificationsAsRead(currentUser.email);
      setNotifications(updated);
      onUnreadCountChange?.(0);
    } else {
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      onUnreadCountChange?.(0);
    }
  };

  // Mark single as read
  const handleMarkRead = (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    if (currentUser?.email) {
      const updated = markNotificationAsRead(currentUser.email, notifId);
      setNotifications(updated);
      onUnreadCountChange?.(updated.filter((n) => !n.read).length);
    } else {
      const updated = notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n));
      setNotifications(updated);
      onUnreadCountChange?.(updated.filter((n) => !n.read).length);
    }
  };

  // Dismiss single notification
  const handleDismiss = (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    if (currentUser?.email) {
      const updated = dismissNotification(currentUser.email, notifId);
      setNotifications(updated);
      onUnreadCountChange?.(updated.filter((n) => !n.read).length);
    } else {
      const updated = notifications.filter((n) => n.id !== notifId);
      setNotifications(updated);
      onUnreadCountChange?.(updated.filter((n) => !n.read).length);
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (currentUser?.email) {
      const updated = clearAllNotifications(currentUser.email);
      setNotifications(updated);
      onUnreadCountChange?.(0);
    } else {
      setNotifications([]);
      onUnreadCountChange?.(0);
    }
  };

  // Navigate on notification click
  const handleNotificationClick = (n: UserNotification) => {
    // Mark as read when clicked
    if (!n.read) {
      if (currentUser?.email) {
        const updated = markNotificationAsRead(currentUser.email, n.id);
        setNotifications(updated);
        onUnreadCountChange?.(updated.filter((item) => !item.read).length);
      }
    }

    onClose();

    if (n.type === 'course_start' || n.type === 'course_milestone' || n.type === 'course_completion' || n.type === 'continue_learning') {
      onSelectTab('courses');
    } else if (n.type === 'skill_progress') {
      onSelectTab('skillgap');
    } else {
      onSelectTab('eligibility');
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  // Icon and badge styling helper
  const getCategoryConfig = (type: UserNotification['type']) => {
    switch (type) {
      case 'course_start':
        return {
          icon: BookOpen,
          bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
          badge: 'Started',
          badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
        };
      case 'course_milestone':
        return {
          icon: Target,
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          badge: 'Milestone',
          badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
        };
      case 'course_completion':
        return {
          icon: Award,
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
          badge: 'Completed',
          badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
        };
      case 'continue_learning':
        return {
          icon: Sparkles,
          bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
          badge: 'In Progress',
          badgeColor: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300',
        };
      case 'skill_progress':
        return {
          icon: TrendingUp,
          bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
          badge: 'Skill Up',
          badgeColor: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
        };
      default:
        return {
          icon: Briefcase,
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          badge: 'Placement',
          badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        };
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (< 640px) to prevent clipped floating popups and close on tap */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-2xs z-40 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Responsive Panel Container:
          On mobile (< 640px): Centered safely with fixed insets (inset-x-2.5 top-16), never goes off-screen, max-w-[calc(100vw-20px)].
          On desktop (>= 640px): Beautifully anchored dropdown at right-0 top-full mt-2 w-[410px].
      */}
      <div
        ref={panelRef}
        id="careerai-notifications-panel"
        className="fixed inset-x-2.5 top-16 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[410px] max-w-[calc(100vw-20px)] sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[580px] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="CareerAI Notifications"
      >
        {/* Header Section */}
        <div className="px-3.5 sm:px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  Notifications
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser ? `Personalized for ${currentUser.name || 'You'}` : 'Platform Placement Updates'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {unreadCount > 0 && (
                <button
                  type="button"
                  id="notifications-mark-all-read-btn"
                  onClick={handleMarkAllRead}
                  className="px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer min-h-[32px]"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xs:inline">Mark read</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label="Close notifications panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills and Action Bar */}
          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer min-h-[28px] ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer min-h-[28px] flex items-center gap-1 ${
                  filter === 'unread'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      filter === 'unread'
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10px] font-semibold text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer py-1 px-1.5 rounded"
                title="Clear all notifications"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Notifications List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/70 overflow-y-auto overflow-x-hidden flex-1 overscroll-contain">
          {displayedNotifications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {filter === 'unread' ? 'No unread notifications' : 'All caught up!'}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                {currentUser
                  ? 'Start or progress through courses to receive real-time learning milestone updates.'
                  : 'Sign in to track your personalized courses, skill improvements, and placement signals.'}
              </p>
              {!currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('signin');
                  }}
                  className="mt-3.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Sign In to Personalize
                </button>
              )}
            </div>
          ) : (
            displayedNotifications.map((n) => {
              const config = getCategoryConfig(n.type);
              const IconComp = config.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 sm:p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex items-start gap-2.5 sm:gap-3 ${
                    !n.read
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'bg-transparent'
                  }`}
                >
                  {/* Category Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-2xs mt-0.5 ${config.bg}`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  {/* Notification Content (Word wrap protected, no clipping) */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${config.badgeColor}`}
                        >
                          {config.badge}
                        </span>
                        {!n.read && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"
                            title="Unread"
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                        {formatNotificationTime(n.createdAt)}
                      </span>
                    </div>

                    {/* Long course titles wrap correctly without breaking words */}
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 leading-snug break-words">
                      {n.title}
                    </h5>

                    {/* Notification message with graceful wrapping */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words whitespace-normal">
                      {n.message}
                    </p>

                    {/* Course progress bar preview if progress exists */}
                    {typeof n.progress === 'number' && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              n.progress >= 100
                                ? 'bg-emerald-500'
                                : n.progress >= 50
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.max(4, Math.min(100, n.progress))}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                          {n.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons (Mark Read / Dismiss) */}
                  <div className="flex flex-col items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkRead(e, n.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(e, n.id)}
                      className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation CTA */}
        <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectTab('courses');
            }}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Browse Courses &amp; Certs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectTab('eligibility');
            }}
            className="font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Eligibility Signals
          </button>
        </div>
      </div>
    </>
  );
};
