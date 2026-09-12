import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  RotateCcw,
  User,
  LogOut,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Building2,
  Briefcase,
  GitBranch,
  Award,
} from 'lucide-react';
import { PlacementReadinessReport, AuthUser } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { NavTab } from './Navbar';

interface TopHeaderProps {
  onToggleMobile: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  report: PlacementReadinessReport;
  isProfileEmpty: boolean;
  onLoadDemo: () => void;
  onClearProfile: () => void;
  currentUser: AuthUser | null;
  assessmentSubmitted: boolean;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onLogout: () => void;
  onReplayIntro?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  category: 'company' | 'skill' | 'job';
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobile,
  onSelectTab,
  isProfileEmpty,
  onLoadDemo,
  onClearProfile,
  currentUser,
  assessmentSubmitted,
  onOpenAuth,
  onLogout,
  onReplayIntro,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Amazon & Google Cutoffs Updated',
      desc: 'Campus recruitment requirements for 2025/2026 graduated cohorts have been calibrated.',
      time: '10m ago',
      unread: true,
      category: 'company',
    },
    {
      id: '2',
      title: 'Skill Progress Milestone Reached',
      desc: 'Python & SQL competencies ready for SDE-1 placement rounds.',
      time: '1h ago',
      unread: true,
      category: 'skill',
    },
    {
      id: '3',
      title: 'New High-Match Job Openings',
      desc: '4 verified frontend and full-stack positions aligned with your active profile.',
      time: '3h ago',
      unread: false,
      category: 'job',
    },
  ]);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // User dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Clear confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setHasUnread(false);
  };

  // Search quick jump items
  const quickSearchItems = [
    { label: 'Campus Placement Eligibility', tab: 'eligibility' as NavTab, icon: Building2, tag: 'Recruiters' },
    { label: 'Live Job Openings & Internships', tab: 'jobs' as NavTab, icon: Briefcase, tag: 'Jobs' },
    { label: 'Skill Gap Remediation Roadmap', tab: 'skillgap' as NavTab, icon: GitBranch, tag: 'Roadmap' },
    { label: 'Industry Verified Courses & Certs', tab: 'courses' as NavTab, icon: Award, tag: 'Courses' },
  ].filter(
    (item) =>
      !searchQuery ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-900 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3">
          {/* Left: Mobile Toggle & Global Quick Search */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-lg">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={onToggleMobile}
              className="lg:hidden p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer shrink-0"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input with Command-K indicator */}
            <div ref={searchContainerRef} className="relative flex-1 min-w-0">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 sm:left-3 pointer-events-none shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search skills, companies, jobs..."
                  className="w-full pl-8 sm:pl-9 pr-2 sm:pr-14 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden transition-all shadow-2xs truncate"
                />
                <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 pointer-events-none">
                  <kbd className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Search Dropdown / Quick Jumps */}
              {searchFocused && (
                <div className="absolute left-0 right-0 mt-2 w-full max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Jump to Module
                  </div>
                  <div className="space-y-1 mt-1">
                    {quickSearchItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            onSelectTab(item.tab);
                            setSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0 ml-2">
                            {item.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Demo Trigger, Notifications Pulse, and User Profile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Demo Data Quick Action */}
            {isProfileEmpty ? (
              <button
                type="button"
                id="header-load-demo-btn"
                onClick={onLoadDemo}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Load sample 3rd year CSE profile for diagnostic testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Load Demo</span>
              </button>
            ) : (
              <button
                type="button"
                id="header-clear-profile-btn"
                onClick={() => setShowClearConfirm(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-600 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="Reset profile"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Notifications Popover with Subtle Pulse Indicator */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                id="header-notifications-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {hasUnread && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse absolute top-1.5 right-1.5 pointer-events-none" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-28px)] sm:w-88 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Placement Updates</span>
                      {hasUnread && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          New
                        </span>
                      )}
                    </div>
                    {hasUnread && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-slate-50 transition-colors ${
                          n.unread ? 'bg-indigo-50/25' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                            {n.title}
                          </h5>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        onSelectTab('eligibility');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>View All Eligibility Signals</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Account / Profile Avatar Menu */}
            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  id="header-user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  aria-expanded={userDropdownOpen}
                >
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold flex items-center justify-center text-[10px]">
                      {currentUser.name.charAt(0).toUpperCase() || 'S'}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate hidden sm:inline-block font-bold">
                    {currentUser.name.split(' ')[0] || currentUser.email}
                  </span>
                  {currentUser.provider === 'google' && (
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0 hidden sm:inline-block" />
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-28px)] sm:w-64 max-w-xs bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        {currentUser.provider === 'google' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <GoogleIcon className="w-3 h-3" />
                            <span>Google Account</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span>Email Account</span>
                          </span>
                        )}

                        {assessmentSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Assessed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>My Profile &amp; Assessment</span>
                      </button>

                      {onReplayIntro && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onReplayIntro();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Watch Brand Animation</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        id="user-dropdown-logout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id="header-signin-btn"
                  onClick={() => onOpenAuth('signin')}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="header-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-102 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Clear Profile */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Reset Profile Data?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will reset all your academic details, skills, and projects back to empty.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearProfile();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Reset Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
