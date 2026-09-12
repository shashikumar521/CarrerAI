import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  Building2,
  GitBranch,
  Briefcase,
  Bot,
  FileText,
  BookOpen,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  LogIn,
  LogOut,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  Award,
} from 'lucide-react';
import { PlacementReadinessReport, AuthUser } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { CareerAiBrand } from './CareerAiBrand';

export type NavTab =
  | 'dashboard'
  | 'profile'
  | 'eligibility'
  | 'skillgap'
  | 'courses'
  | 'jobs'
  | 'counselor'
  | 'resume'
  | 'prep';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  report: PlacementReadinessReport;
  isProfileEmpty: boolean;
  onLoadDemo: () => void;
  onClearProfile: () => void;
  eligibleCompanyCount: number;
  currentUser: AuthUser | null;
  assessmentSubmitted: boolean;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onLogout: () => void;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  report,
  isProfileEmpty,
  onLoadDemo,
  onClearProfile,
  eligibleCompanyCount,
  currentUser,
  assessmentSubmitted,
  onOpenAuth,
  onLogout,
  onReplayIntro,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
    {
      id: 'eligibility' as NavTab,
      label: 'Eligibility Checker',
      icon: Building2,
      badge: !isProfileEmpty && eligibleCompanyCount > 0 ? `${eligibleCompanyCount} Fit` : undefined,
    },
    { id: 'skillgap' as NavTab, label: 'Skill Gap & Roadmap', icon: GitBranch },
    { id: 'courses' as NavTab, label: 'Courses & Certifications', icon: Award },
    { id: 'jobs' as NavTab, label: 'Jobs & Internships', icon: Briefcase },
    { id: 'counselor' as NavTab, label: 'AI Counselor', icon: Bot },
    { id: 'resume' as NavTab, label: 'Resume & ATS', icon: FileText },
    { id: 'prep' as NavTab, label: 'Interview Prep', icon: BookOpen },
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const getScoreBadgeColor = (grade: string) => {
    switch (grade) {
      case 'Placement Ready':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Near Ready':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Developing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Empty Profile':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <CareerAiBrand
              onClick={() => handleTabClick('dashboard')}
              subtitle="Placement Intelligence Engine"
              badge="B.Tech"
              size="navbar"
            />
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm sm:text-[15px] font-medium tracking-normal leading-snug transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.badge}
                    </span>
                  )}
                  {/* Small animated underline */}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0.5 left-2.5 right-2.5 h-0.5 rounded-full bg-indigo-600 transition-all duration-200 ${
                      isActive
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Readiness Gauge Badge */}
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${getScoreBadgeColor(
                report.grade
              )}`}
              title="Placement Readiness Assessment"
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              <span>
                {isProfileEmpty ? 'Profile Pending' : `Readiness: ${report.overallScore}%`}
              </span>
            </div>

            {/* Authentication Buttons / User Account Dropdown */}
            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  id="navbar-user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
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
                  <span className="max-w-[110px] truncate">{currentUser.name || currentUser.email}</span>
                  {currentUser.provider === 'google' && (
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
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
              <div className="flex items-center gap-1.5">
                <button
                  id="navbar-signin-btn"
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="navbar-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Load Demo Profile Button */}
            {isProfileEmpty ? (
              <button
                id="navbar-load-demo-btn"
                onClick={onLoadDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
                title="Load sample 3rd year CSE profile for testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Load Demo</span>
              </button>
            ) : (
              <button
                id="navbar-clear-profile-btn"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                title="Reset profile to completely empty"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3">
          {/* User Status / Login Banner on Mobile */}
          {currentUser ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 truncate">
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold flex items-center justify-center text-xs shrink-0">
                    {currentUser.name.charAt(0).toUpperCase() || 'S'}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                    {currentUser.provider === 'google' && <GoogleIcon className="w-3 h-3" />}
                    <span>{currentUser.email}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg cursor-pointer shrink-0"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-1">
              <button
                onClick={() => {
                  onOpenAuth('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg cursor-pointer text-center"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer text-center"
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-sm sm:text-[15px] font-medium tracking-normal leading-snug transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-left whitespace-normal sm:whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 ml-2">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${getScoreBadgeColor(
                report.grade
              )}`}
            >
              {isProfileEmpty ? 'Profile Pending' : `Readiness: ${report.overallScore}%`}
            </div>

            {isProfileEmpty ? (
              <button
                onClick={() => {
                  onLoadDemo();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Load Demo</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowClearConfirm(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Profile</span>
              </button>
            )}

            {onReplayIntro && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReplayIntro();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Watch Intro</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset to Empty Profile?</h3>
                <p className="text-xs text-slate-500">
                  This will wipe all currently entered profile data and return to a blank state.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure? You can start typing fresh data or load demo data whenever needed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-clear-profile-btn"
                onClick={() => {
                  onClearProfile();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
