import React from 'react';
import { Rocket, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface EmptyStateBannerProps {
  onGoToProfile: () => void;
  onLoadDemo: () => void;
  title?: string;
  description?: string;
}

export const EmptyStateBanner: React.FC<EmptyStateBannerProps> = ({
  onGoToProfile,
  onLoadDemo,
  title = 'Your Career Journey Starts Here',
  description = 'Complete your profile to discover your career readiness. CareerAI evaluates your real engineering academic metrics (CGPA, Branch, Backlogs, Skills, and Projects) to calculate placement readiness, check company cutoffs, and pinpoint skill gaps.',
}) => {
  return (
    <div
      id="empty-state-banner"
      className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs mb-8 transition-all hover:border-slate-300"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="relative shrink-0">
            <img
              src="/careerai-logo.png"
              alt="CareerAI official logo"
              className="w-13 h-13 md:w-15 md:h-15 rounded-full object-contain border border-slate-200 shadow-xs relative z-10 bg-white"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Rocket className="w-3 h-3 text-indigo-600" />
                <span>Onboarding Mode</span>
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Private &amp; Secure
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            id="empty-state-fill-profile-btn"
            onClick={onGoToProfile}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-xs transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
          >
            <span>Enter Your Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="empty-state-load-demo-btn"
            onClick={onLoadDemo}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            title="Load a sample 3rd year CSE profile for testing"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Load Demo Data (Preview)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
