import React, { useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Target,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  calculatePlacementRadarAnalysis,
  RadarDimensionScore,
  DEFAULT_RADAR_WEIGHTS,
} from '../utils/placementRadarCalculator';

interface PlacementRadarChartProps {
  profile: StudentProfile;
  onNavigateToTab?: (tab: string) => void;
}

// Custom Tooltip component for Recharts Radar
const CustomRadarTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ payload: RadarDimensionScore }>;
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs max-w-xs z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {data.dimension}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              data.score >= 75
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : data.score >= 50
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {data.status}
          </span>
        </div>

        <div className="py-2 space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>Current Score:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {data.score} / 100
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Industry Benchmark:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {data.benchmark} / 100
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Heuristic Weight:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {Math.round(data.weight * 100)}%
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800 leading-tight">
          {data.description}
        </p>
      </div>
    );
  }
  return null;
};

export const PlacementRadarChart: React.FC<PlacementRadarChartProps> = ({
  profile,
  onNavigateToTab,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [showMethodology, setShowMethodology] = useState(false);
  const [selectedDimensionKey, setSelectedDimensionKey] = useState<string | null>(null);

  const analysis = calculatePlacementRadarAnalysis(profile);
  const {
    dimensions,
    overallReadiness,
    strongestArea,
    improvementArea,
    grade,
    heuristicRankBenchmark,
  } = analysis;

  // Formatting for Recharts data
  const chartData = dimensions.map((d) => ({
    ...d,
    // Provide short label on small screens if needed, otherwise full label
    shortDimension: d.dimension,
  }));

  // Selected dimension detail (either user clicked or defaulting to strongest/improvement)
  const activeDetail =
    dimensions.find((d) => d.key === selectedDimensionKey) || strongestArea;

  return (
    <div
      id="placement-readiness-radar-container"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 transition-colors"
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Spider Chart Analytics
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              7-Dimension Recruiter Calibration
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2 tracking-normal leading-snug">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Placement Readiness Radar</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            Multi-dimensional placement readiness evaluated on a normalized 0–100 scale across technical, problem-solving, and professional hiring criteria.
          </p>
        </div>

        {/* Overall Readiness Pill Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
              Overall Readiness
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {grade}
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight px-3 py-1 rounded-lg ${
              overallReadiness >= 75
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : overallReadiness >= 50
                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
            }`}
          >
            {overallReadiness}%
          </div>
        </div>
      </div>

      {/* 2. Key Diagnostic Interpretations (Strongest & Improvement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Strongest Area Card */}
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              Strongest Dimension
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              Your strongest area is <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{strongestArea.dimension}</strong> ({strongestArea.score}/100).
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {strongestArea.recommendation}
            </p>
          </div>
        </div>

        {/* Improvement Area Card */}
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
              Priority Focus Area
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              Your biggest improvement area is <strong className="text-rose-700 dark:text-rose-400 font-bold">{improvementArea.dimension}</strong> ({improvementArea.score}/100).
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {improvementArea.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Visual Radar Chart & Detailed Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Spider Canvas Container */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center relative min-h-[340px]">
          <div className="w-full h-[320px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="75%"
                data={chartData}
                margin={{ top: 15, right: 25, bottom: 15, left: 25 }}
              >
                <PolarGrid
                  stroke={isDark ? '#334155' : '#e2e8f0'}
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="shortDimension"
                  tick={{
                    fill: isDark ? '#cbd5e1' : '#475569',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }}
                  stroke={isDark ? '#475569' : '#cbd5e1'}
                />
                <Radar
                  name="Placement Readiness"
                  dataKey="score"
                  stroke={isDark ? '#818cf8' : '#4f46e5'}
                  fill={isDark ? '#818cf8' : '#4f46e5'}
                  fillOpacity={isDark ? 0.35 : 0.25}
                  strokeWidth={2.5}
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              <span>Current Score (0–100)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-b-2 border-dashed border-slate-400 dark:border-slate-500" />
              <span>Scale: 0 Min to 100 Max</span>
            </span>
          </div>
        </div>

        {/* Dimension Breakdown & Accessible Text Metrics */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              7 Dimension Metrics
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Click to inspect
            </span>
          </div>

          <div className="space-y-1.5">
            {dimensions.map((dim) => {
              const isSelected = selectedDimensionKey === dim.key;
              const isStrongest = dim.key === strongestArea.key;
              const isLowest = dim.key === improvementArea.key;

              return (
                <button
                  key={dim.key}
                  type="button"
                  onClick={() => setSelectedDimensionKey(dim.key)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20 shadow-2xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {dim.dimension}
                      </span>
                      {isStrongest && (
                        <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Highest
                        </span>
                      )}
                      {isLowest && (
                        <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                          Priority Gap
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {dim.score}
                        <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                          /100
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Horizontal visual progress meter for accessibility */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        dim.score >= 75
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : dim.score >= 50
                          ? 'bg-amber-500 dark:bg-amber-400'
                          : 'bg-rose-500 dark:bg-rose-400'
                      }`}
                      style={{ width: `${Math.max(4, dim.score)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Dimension Quick Insight */}
          {activeDetail && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>{activeDetail.dimension} Diagnostic</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Target: {activeDetail.benchmark}/100
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeDetail.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Exam / Project Methodology: Normalization, Heuristics, & Weighted Scoring */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center justify-between w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Calculation Methodology: Data Normalization &amp; Heuristic Scoring Rules</span>
          </div>
          {showMethodology ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showMethodology && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-600 dark:text-slate-300 animate-in fade-in duration-200">
            {/* Concept 1: Data Normalization */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>1. Data Normalization</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Diverse scales are converted into an aligned 0–100 range. For example:
              </p>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[10px] text-indigo-700 dark:text-indigo-300">
                normalizedCGPA = (CGPA / 10) * 100
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Prevents mixing raw 10-point grades with percentage or volume metrics.
              </p>
            </div>

            {/* Concept 2: Heuristic Rules */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>2. Rule-Based Heuristics</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Deterministic rules evaluate skills, algorithmic competencies, and ATS compliance against industry recruiter standards.
              </p>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300">
                Benchmark: <strong>{heuristicRankBenchmark.estimatedPercentile}</strong>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                {heuristicRankBenchmark.disclaimer}
              </p>
            </div>

            {/* Concept 3: Weighted Scoring */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>3. Configurable Weights</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                All 7 dimensions combine via configurable coefficients summing to 100%:
              </p>
              <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                <li>• Technical Skills: <strong>{DEFAULT_RADAR_WEIGHTS.technicalSkills * 100}%</strong></li>
                <li>• DSA / Problem Solving: <strong>{DEFAULT_RADAR_WEIGHTS.dsa * 100}%</strong></li>
                <li>• Projects &amp; Repositories: <strong>{DEFAULT_RADAR_WEIGHTS.projects * 100}%</strong></li>
                <li>• Aptitude &amp; Academics: <strong>{DEFAULT_RADAR_WEIGHTS.aptitude * 100}%</strong></li>
                <li>• Resume ATS Audit: <strong>{DEFAULT_RADAR_WEIGHTS.resumeATS * 100}%</strong></li>
                <li>• Communication &amp; Interview: <strong>20%</strong></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
