import React from 'react';
import { UserCheck, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface EmptyStateBannerProps {
  onGoToProfile: () => void;
  onLoadDemo: () => void;
  title?: string;
  description?: string;
}

export const EmptyStateBanner: React.FC<EmptyStateBannerProps> = ({
  onGoToProfile,
  onLoadDemo,
  title = 'Your Student Profile is Currently Empty',
  description = 'CareerAI analyzes your real academic metrics (CGPA, Branch, Backlogs, Skills, Projects) to calculate placement readiness, check company cutoffs, and pinpoint skill gaps.',
}) => {
  return (
    <div
      id="empty-state-banner"
      className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-xs mb-8 transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl">
          <img
            src="/careerai-logo.png"
            alt="CareerAI official logo"
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-contain border border-amber-200 shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Fresh Start
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                No default data loaded
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            id="empty-state-fill-profile-btn"
            onClick={onGoToProfile}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span>Enter Your Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="empty-state-load-demo-btn"
            onClick={onLoadDemo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            title="Load a sample 3rd year CSE profile for testing"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Load Demo Data (Preview)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
