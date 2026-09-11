import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  Building2,
  GitBranch,
  Bot,
  FileText,
  BookOpen,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';
import { PlacementReadinessReport } from '../types';

export type NavTab =
  | 'dashboard'
  | 'profile'
  | 'eligibility'
  | 'skillgap'
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  report,
  isProfileEmpty,
  onLoadDemo,
  onClearProfile,
  eligibleCompanyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile' as NavTab, label: 'Student Profile', icon: User },
    {
      id: 'eligibility' as NavTab,
      label: 'Eligibility Checker',
      icon: Building2,
      badge: !isProfileEmpty && eligibleCompanyCount > 0 ? `${eligibleCompanyCount} Fit` : undefined,
    },
    { id: 'skillgap' as NavTab, label: 'Skill Gap & Roadmap', icon: GitBranch },
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
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-700 transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">CareerAI</span>
                  <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                    B.Tech
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                  Engineering Placement Engine
                </p>
              </div>
            </button>
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Readiness Gauge Badge */}
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${getScoreBadgeColor(
                report.grade
              )}`}
              title="Placement Readiness Assessment"
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>
                {isProfileEmpty ? 'Empty Profile' : `Readiness: ${report.overallScore}/100`}
              </span>
            </div>

            {/* Load Demo Profile Button */}
            {isProfileEmpty ? (
              <button
                id="navbar-load-demo-btn"
                onClick={onLoadDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Load sample 3rd year CSE profile for testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
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
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${getScoreBadgeColor(
                report.grade
              )}`}
            >
              {isProfileEmpty ? 'Empty Profile' : `Readiness: ${report.overallScore}/100`}
            </div>

            {isProfileEmpty ? (
              <button
                onClick={() => {
                  onLoadDemo();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Load Demo</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowClearConfirm(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Profile</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
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
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-clear-profile-btn"
                onClick={() => {
                  onClearProfile();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
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
