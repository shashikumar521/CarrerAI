import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Target,
  FileCheck,
  Compass,
} from 'lucide-react';

export const AboutPlatformInfo: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="about-careerai"
      aria-label="About CareerAI and CarrerAI Platform"
      className="border-t border-slate-200 bg-white/70 py-10 mt-14 print:hidden transition-all text-slate-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <img
                src="/careerai-logo.png"
                alt="CareerAI official logo"
                className="w-12 h-12 md:w-14 md:h-14 object-contain rounded-full border border-slate-200 shadow-xs shrink-0 mt-0.5 bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Platform Guide &amp; Overview
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Official Knowledge Base
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 tracking-tight">
                About CareerAI — AI-Powered Career Platform for Engineering Students
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                <strong>CareerAI</strong> is an AI-powered career and placement platform engineered to guide students from initial academic tracking to recruitment success through real-time company cutoff screening, skill gap analysis, curated courses, and personalized interview readiness roadmaps.
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-2 rounded-lg border border-indigo-200 transition-colors cursor-pointer self-start md:self-auto shrink-0"
            aria-expanded={expanded}
          >
            <span>{expanded ? 'Collapse Detailed Overview' : 'Explore Platform Breakdown'}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Highlight Grid (Always visible for accessibility & crawlers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Who It Is For
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed for B.Tech &amp; engineering students across Computer Science (CSE), IT, ECE, EEE, Mechanical, and Civil streams navigating campus hiring and off-campus tech recruitment.
            </p>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Academic Analysis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluates B.Tech CGPA, 10th and 12th percentages, and active backlogs to identify cutoff risks and provide realistic backlog clearance and placement recovery plans.
            </p>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Skill-Gap Analysis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Benchmarks individual skills against real industry profiles (SDE, Full-Stack, Cloud/DevOps, AI/ML, Data Analyst, Embedded) with missing-skill alerts and learning timelines.
            </p>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Personalized Roadmaps
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides structured 4-phase preparation timelines covering coding fundamentals, core CS subjects (OS, DBMS, Networks), project deliverables, and interview drilling.
            </p>
          </div>
        </div>

        {/* Expanded Educational Content */}
        {expanded && (
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>How CareerAI Works</span>
                </h4>
                <p>
                  Engineering students enter their real academic scores, branch, active backlogs, technical stack, and projects. CareerAI instantly screens the student against cutoffs for 30+ top recruiters, computes a multi-dimensional placement readiness score (0–100), and flags critical placement obstacles before campus recruitment begins.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Placement Readiness &amp; Recruiter Cutoff Screening</span>
                </h4>
                <p>
                  The platform evaluates student eligibility across Tier-1 Product Companies (Google, Microsoft, Amazon, Cisco, Oracle), Tier-2 High Growth Tech Unicorns (Swiggy, Zomato, Razorpay, PhonePe), IT Services &amp; Mass Recruiters (TCS, Infosys, Wipro, Accenture), and Core/Fintech firms.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>ATS Resume Audit &amp; Technical Interview Preparation</span>
                </h4>
                <p>
                  CareerAI includes an automated single-column ATS resume generator that verifies contact formatting, quantified engineering project metrics, and skill taxonomies. The Interview Drill Hub covers fundamental concepts in Operating Systems, Database Management Systems, Computer Networks, and HR STAR methodology.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>AI Career Counselor &amp; Mentorship</span>
                </h4>
                <p>
                  Powered by Google Gemini, the built-in AI Counselor answers placement questions, strategizes backlog recovery paths, and suggests tailored project ideas based on the student's unique academic standing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
