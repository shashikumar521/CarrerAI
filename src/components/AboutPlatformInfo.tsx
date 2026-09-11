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
  Briefcase,
  TrendingUp,
  BookOpen,
  Building2,
  Bot,
} from 'lucide-react';

export const AboutPlatformInfo: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="about-careerai"
      aria-label="About CareerAI Platform"
      className="border-t border-slate-200 bg-white/80 py-10 mt-14 print:hidden transition-all text-slate-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Header Summary */}
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
                CareerAI – Placement Intelligence &amp; Career Acceleration
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                CareerAI is an AI-powered career and placement platform designed to help students track their skills, discover relevant jobs, identify skill gaps, find learning opportunities, and improve their career readiness.
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-2 rounded-lg border border-indigo-200 transition-colors cursor-pointer self-start md:self-auto shrink-0"
            aria-expanded={expanded}
          >
            <span>{expanded ? 'Collapse Detailed Breakdown' : 'Explore Platform Breakdown'}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* What is CareerAI? Section */}
        <div>
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>What is CareerAI?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              CareerAI serves as an all-in-one technical career companion for engineering students. It unites real-time skill measurement, market demand matching, and personalized interview readiness into one unified platform:
            </p>
          </div>

          {/* 7 Core Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {/* 1. AI-powered career guidance */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                  <Bot className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  AI-Powered Career Guidance
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Interactive mentorship and placement strategy powered by intelligent career advisors to help students make confident, informed career moves.
                </p>
              </div>
            </div>

            {/* 2. Skill tracking and progress */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  Skill Tracking &amp; Progress
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Continuous tracking of core languages, tools, and technical competencies with transparent milestones as coursework and projects advance.
                </p>
              </div>
            </div>

            {/* 3. Career readiness */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  Career Readiness
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Objective placement readiness scoring evaluating resume ATS compliance, academics, and practical skill depth against real recruiter benchmarks.
                </p>
              </div>
            </div>

            {/* 4. Skill gap analysis */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  Skill Gap Analysis
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Automated gap detection comparing current abilities to target job roles like SDE, Full-Stack, AI/ML, and DevOps with actionable roadmaps.
                </p>
              </div>
            </div>

            {/* 5. Learning recommendations */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  Learning Recommendations
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Curated course pathways, hands-on tutorials, and industry-recognized certifications mapped specifically to bridge each student's missing skills.
                </p>
              </div>
            </div>

            {/* 6. Job recommendations */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  Job Recommendations
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Personalized matching with verified engineering roles, internships, and recruiter opportunities tailored to the student's qualification profile.
                </p>
              </div>
            </div>

            {/* 7. Placement eligibility */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between sm:col-span-2 lg:col-span-3 xl:col-span-2">
              <div>
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  Placement Eligibility
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Automated eligibility screening across cutoffs, CGPA thresholds, and backlog criteria for 30+ top campus hiring companies and tech recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About CareerAI Section */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              About CareerAI
            </h3>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
            <p>
              CareerAI was created to solve the persistent disconnect between standard college curricula and the competitive requirements of modern software engineering recruitment. Rather than relying on guesswork, students use CareerAI to gain clear, diagnostic visibility into where they stand across technical, academic, and practical benchmarks.
            </p>
            <p>
              From the initial semester through campus placements and off-campus drives, CareerAI equips learners with the tools, practice drills, ATS resume compliance, and step-by-step guidance needed to turn career aspirations into realized offers.
            </p>
          </div>
        </div>

        {/* Expanded Educational Content */}
        {expanded && (
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>How CareerAI Works</span>
                </h4>
                <p>
                  Engineering students enter their academic scores, branch, active backlogs, technical stack, and projects. CareerAI instantly screens the student against cutoffs for 30+ top recruiters, computes a multi-dimensional placement readiness score (0–100), and flags critical placement obstacles before campus recruitment begins.
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
