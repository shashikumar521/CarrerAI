import React from 'react';
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
    { id: 'courses' as NavTab, label: 'Courses & Certs', icon: Award },
    { id: 'jobs' as NavTab, label: 'Live Jobs', icon: Briefcase },
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
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Near Ready':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Developing':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 select-none overflow-y-auto">
      {/* Top Header: Logo & Branding */}
      <div>
        <div className="flex items-center justify-between pb-5 mb-4 border-b border-slate-100">
          <CareerAiBrand
            onClick={() => handleTabClick('dashboard')}
            subtitle="Placement Intelligence SaaS"
            badge="B.Tech"
            size="sidebar"
          />

          {/* Close button on mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm sm:text-[15px] font-medium tracking-normal leading-snug transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600 shadow-2xs translate-x-0.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-all duration-200 group-hover:scale-105 group-hover:translate-x-0.5 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Widget: Career Readiness Summary */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div
          onClick={() => handleTabClick('profile')}
          className="p-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
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

          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-700"
              style={{ width: `${isProfileEmpty ? 0 : report.overallScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-2 pt-1 border-t border-slate-200/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>30+ Cutoffs Calibrated</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Theme Mode Toggle in Sidebar */}
        <div className="px-1 flex justify-center">
          <ThemeToggle variant="pill" showLabels={true} className="w-full justify-center" />
        </div>

        <div className="px-1 text-center">
          <p className="text-[10px] text-slate-400 font-medium">CareerAI v2.4 • Production SaaS</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-white/95 backdrop-blur-md border-r border-slate-200 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 transition-transform duration-300 ease-out">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
