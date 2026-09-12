import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Info,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import { StudentProfile, EligibilityResult, CompanyTier, EligibilityStatus } from '../types';
import { EmptyStateBanner } from './EmptyStateBanner';
import { NavTab } from './Navbar';

interface EligibilityViewProps {
  profile: StudentProfile;
  eligibilityResults: EligibilityResult[];
  isProfileEmpty: boolean;
  onNavigate: (tab: NavTab) => void;
  onLoadDemo: () => void;
}

export const EligibilityView: React.FC<EligibilityViewProps> = ({
  profile,
  eligibilityResults,
  isProfileEmpty,
  onNavigate,
  onLoadDemo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredResults = useMemo(() => {
    return eligibilityResults.filter((res) => {
      const matchesSearch = res.company.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesTier =
        selectedTier === 'All' || res.company.tier === selectedTier;

      const matchesStatus =
        selectedStatus === 'All' || res.status === selectedStatus;

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [eligibilityResults, searchTerm, selectedTier, selectedStatus]);

  const eligibleCount = eligibilityResults.filter((r) => r.status === 'eligible').length;
  const borderlineCount = eligibilityResults.filter((r) => r.status === 'borderline').length;
  const ineligibleCount = eligibilityResults.filter((r) => r.status === 'ineligible').length;

  const tiers: CompanyTier[] = [
    'Tier 1 Product',
    'Tier 2 High Growth',
    'IT Services / Mass',
    'Core & Electronics',
    'Fintech',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2] flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>Campus Placement Company Eligibility Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time evaluation against B.Tech CGPA, backlogs, branch, and 10th/12th cutoffs across 30+ top recruiters.
          </p>
        </div>

        {/* Student Quick Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <div>
            <span className="font-semibold text-slate-700 block">
              {profile.name ? profile.name : 'Unassigned Profile'}
            </span>
            <span className="text-[11px] text-slate-500">
              CGPA: <strong className="text-slate-800">{profile.cgpa ? Number(profile.cgpa).toFixed(2) : '—'}</strong> | Active Backlogs:{' '}
              <strong className={Number(profile.activeBacklogs) > 0 ? 'text-rose-600' : 'text-slate-800'}>
                {profile.activeBacklogs ?? 0}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {isProfileEmpty && (
        <EmptyStateBanner
          onGoToProfile={() => onNavigate('profile')}
          onLoadDemo={onLoadDemo}
          title="Student Profile Details Missing"
          description="Because no academic data has been entered yet, all companies below show an incomplete status. Fill in your CGPA, branch, and backlogs to see which companies you qualify for."
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company (Google, TCS, Amazon...)"
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden md:inline">Status:</span>
            {['All', 'eligible', 'borderline', 'ineligible'].map((status) => {
              const label =
                status === 'All'
                  ? `All (${eligibilityResults.length})`
                  : status === 'eligible'
                  ? `Eligible (${eligibleCount})`
                  : status === 'borderline'
                  ? `Borderline (${borderlineCount})`
                  : `Cutoff Gap (${ineligibleCount})`;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedStatus === status
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier Filter Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Hiring Tier:</span>
          <button
            onClick={() => setSelectedTier('All')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedTier === 'All'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Tiers
          </button>
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedTier === tier
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {filteredResults.length} hiring companies</span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResults.map((item) => {
          const { company, status, passedChecks, failedChecks, recommendation } = item;

          return (
            <div
              key={company.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Top Strip */}
                <div className="flex flex-col xs:flex-row sm:flex-row items-start justify-between gap-2.5 sm:gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-xs tracking-wider shrink-0">
                      {company.logoBadge}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-900 tracking-tight">
                        {company.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {company.tier}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-tight inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto whitespace-nowrap ${
                      status === 'eligible'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : status === 'borderline'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : status === 'ineligible'
                        ? 'bg-rose-50 text-rose-800 border border-rose-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>
                      {status === 'eligible'
                        ? 'ELIGIBLE'
                        : status === 'borderline'
                        ? 'ALMOST ELIGIBLE'
                        : status === 'ineligible'
                        ? 'NOT YET ELIGIBLE'
                        : 'INCOMPLETE'}
                    </span>
                  </span>
                </div>

                {/* Package & Key Cutoffs Table */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] sm:text-xs mb-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Typical CTC
                    </span>
                    <span className="font-bold text-slate-900">{company.typicalPackage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Min CGPA
                    </span>
                    <span className="font-bold text-slate-900">{company.minCgpa} / 10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Max Backlogs
                    </span>
                    <span className="font-bold text-slate-900">
                      {company.maxBacklogsAllowed === 0 ? '0 (Clean)' : company.maxBacklogsAllowed}
                    </span>
                  </div>
                </div>

                {/* Focus & Requirements */}
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  <strong className="text-slate-800">Hiring Focus:</strong> {company.hiringFocus}
                </p>

                {/* Structured Eligibility Analysis: Why? / What is missing? / Next steps */}
                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Why? */}
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Why?</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {status === 'eligible'
                        ? `Your current academic score, CGPA (${profile.cgpa || '0'}), active backlogs (${profile.activeBacklogs || 0}), and engineering branch satisfy ${company.name}'s campus placement criteria.`
                        : status === 'borderline'
                        ? `You are near the qualification threshold for ${company.name}. With minor score improvement or specific technical project showcases, you can convert to eligible.`
                        : `Your current profile does not satisfy ${company.name}'s required recruitment cutoff parameters.`}
                    </p>
                  </div>

                  {/* What is missing? */}
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">What is missing?</span>
                    {failedChecks.length > 0 ? (
                      <ul className="space-y-1">
                        {failedChecks.map((fail, idx) => (
                          <li
                            key={`fail-${idx}`}
                            className="flex items-start gap-1.5 text-rose-700 font-medium text-[11px]"
                          >
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{fail}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>All baseline cutoffs and requirements are fulfilled.</span>
                      </div>
                    )}
                  </div>

                  {/* What should I do next? */}
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                    <span className="font-bold text-indigo-950 block mb-0.5">Recommended Next Step:</span>
                    <p className="text-indigo-900 text-[11px] leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
