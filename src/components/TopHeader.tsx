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
  Star,
  ShieldCheck,
} from 'lucide-react';
import { PlacementReadinessReport, AuthUser } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { NavTab } from './Navbar';
import { NotificationPanel } from './NotificationPanel';

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
  onOpenRating?: () => void;
  isAdmin?: boolean;
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
  onOpenRating,
  isAdmin,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 select-none transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3">
          {/* Left: Mobile Toggle & Global Quick Search */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0 max-w-lg">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={onToggleMobile}
              className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer shrink-0 transition-colors"
              aria-label="Open navigation drawer"
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
                  placeholder="Search skills, jobs..."
                  className="w-full pl-8 sm:pl-9 pr-2 sm:pr-14 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden transition-all shadow-2xs truncate"
                />
                <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 pointer-events-none">
                  <kbd className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Search Dropdown / Quick Jumps */}
              {searchFocused && (
                <div className="absolute left-0 right-0 mt-2 w-full max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 ml-2">
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Demo Data Quick Action */}
            {isProfileEmpty ? (
              <button
                type="button"
                id="header-load-demo-btn"
                onClick={onLoadDemo}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Load sample 3rd year CSE profile for diagnostic testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Load Demo</span>
              </button>
            ) : (
              <button
                type="button"
                id="header-clear-profile-btn"
                onClick={() => setShowClearConfirm(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="Reset profile"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Notifications Trigger & Responsive Panel */}
            <div className="relative">
              <button
                type="button"
                id="header-notifications-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="min-w-[17px] h-[17px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 flex items-center justify-center absolute -top-0.5 -right-0.5 pointer-events-none shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                currentUser={currentUser}
                onSelectTab={onSelectTab}
                onOpenAuth={onOpenAuth}
                onUnreadCountChange={setUnreadCount}
              />
            </div>

            {/* Non-intrusive Rate CareerAI / Feedback Button for Logged-In Users */}
            {currentUser && onOpenRating && (
              <button
                type="button"
                id="header-rate-careerai-btn"
                onClick={onOpenRating}
                className="px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/80 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                title="Rate CareerAI & Feedback"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Rate CareerAI</span>
                <span className="sm:hidden">Rate</span>
              </button>
            )}

            {/* User Account / Profile Avatar Menu */}
            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  id="header-user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:pl-2 sm:pr-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs min-h-[40px]"
                  aria-expanded={userDropdownOpen}
                >
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold flex items-center justify-center text-[11px]">
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
                  <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-64 max-w-xs bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {currentUser.provider === 'google' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <GoogleIcon className="w-3 h-3" />
                            <span>Google Account</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <span>Email Account</span>
                          </span>
                        )}

                        {assessmentSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Assessed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
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
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>My Profile &amp; Assessment</span>
                      </button>

                      {onReplayIntro && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onReplayIntro();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Watch Brand Animation</span>
                        </button>
                      )}

                      {onOpenRating && (
                        <button
                          type="button"
                          id="user-dropdown-rate-btn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenRating();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Rate CareerAI &amp; Feedback</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          id="user-dropdown-admin-feedback-btn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onSelectTab('dashboard');
                            setTimeout(() => {
                              document.getElementById('admin-feedback-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Admin: User Feedback</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        id="user-dropdown-logout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  id="header-signin-btn"
                  onClick={() => onOpenAuth('signin')}
                  className="px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[38px] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="header-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-2.5 sm:px-3.5 py-1.5 min-h-[36px] sm:min-h-[38px] text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-102 shrink-0"
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
