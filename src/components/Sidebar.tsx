import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Building2,
  GitBranch,
  Briefcase,
  Bot,
  FileText,
  BookOpen,
  Award,
  X,
  ShieldCheck,
  ChevronRight,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlacementReadinessReport, AuthUser } from '../types';
import { NavTab } from './Navbar';
import { ThemeToggle } from './ThemeToggle';
import { CareerAiBrand } from './CareerAiBrand';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  report: PlacementReadinessReport;
  isProfileEmpty: boolean;
  eligibleCompanyCount: number;
  currentUser: AuthUser | null;
  assessmentSubmitted: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  report,
  isProfileEmpty,
  eligibleCompanyCount,
  mobileOpen,
  onCloseMobile,
}) => {
  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

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
    onCloseMobile();
  };

  const getScoreBadgeColor = (grade: string) => {
    switch (grade) {
      case 'Placement Ready':
        return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
      case 'Near Ready':
        return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';
      case 'Developing':
        return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="h-full flex flex-col justify-between p-4 select-none overflow-y-auto bg-white dark:bg-slate-900 transition-colors">
      {/* Top Header: Logo & Branding */}
      <div>
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100 dark:border-slate-800">
          <CareerAiBrand
            onClick={() => handleTabClick('dashboard')}
            subtitle="Placement Intelligence SaaS"
            badge="B.Tech"
            size="sidebar"
          />

          {/* Close button on mobile drawer with 44px min tap area */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-item-${item.id}`}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between text-left px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium tracking-normal leading-snug transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border-l-4 border-indigo-600 dark:border-indigo-500 shadow-2xs translate-x-0.5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 text-left">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-all duration-200 group-hover:scale-105 group-hover:translate-x-0.5 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="text-left truncate">
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 ml-2">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Widget: Career Readiness Summary */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div
          onClick={() => handleTabClick('profile')}
          className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Readiness Score</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getScoreBadgeColor(
                report.grade
              )}`}
            >
              {isProfileEmpty ? 'Pending' : `${report.overallScore}%`}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${isProfileEmpty ? 0 : report.overallScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>30+ Cutoffs Calibrated</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Theme Mode Toggle in Sidebar */}
        <div className="px-1 flex justify-center">
          <ThemeToggle variant="pill" showLabels={true} className="w-full justify-center" />
        </div>

        <div className="px-1 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">CareerAI v2.4 • Production SaaS</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 z-30 shadow-xs">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer (Smooth animated slide-in with Backdrop) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs"
              onClick={onCloseMobile}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative flex-1 flex flex-col w-[82vw] max-w-[290px] sm:max-w-xs bg-white dark:bg-slate-900 shadow-2xl z-10 border-r border-slate-200 dark:border-slate-800"
            >
              {renderSidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
