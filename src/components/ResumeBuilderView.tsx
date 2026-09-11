import React from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Mail,
  Phone,
  Linkedin,
  Github,
  Award,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { calculateAtsScore } from '../utils/readinessCalculator';
import { EmptyStateBanner } from './EmptyStateBanner';
import { NavTab } from './Navbar';

interface ResumeBuilderViewProps {
  profile: StudentProfile;
  isProfileEmpty: boolean;
  onNavigate: (tab: NavTab) => void;
  onLoadDemo: () => void;
}

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({
  profile,
  isProfileEmpty,
  onNavigate,
  onLoadDemo,
}) => {
  const atsAnalysis = calculateAtsScore(profile);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>ATS Resume Generator & Compliance Auditor</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Single-column, recruiter-friendly template engineered to pass Applicant Tracking Systems without layout breakage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {isProfileEmpty && (
        <div className="print:hidden">
          <EmptyStateBanner
            onGoToProfile={() => onNavigate('profile')}
            onLoadDemo={onLoadDemo}
            title="Resume is Awaiting Your Data"
            description="The resume template dynamically renders from your profile information. Input your contact details, education, skills, and projects in the Student Profile tab or load demo data to view a filled resume."
          />
        </div>
      )}

      {/* Grid: ATS Audit on Left, Resume Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ATS Audit Diagnostics (Hidden in Print) */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ATS Compatibility Score
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  atsAnalysis.score >= 80
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : atsAnalysis.score >= 50
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {atsAnalysis.score >= 80 ? 'ATS Optimized' : atsAnalysis.score >= 50 ? 'Moderate' : 'Needs Work'}
              </span>
            </div>

            <div className="text-4xl font-black text-slate-900 tracking-tight my-2">
              {atsAnalysis.score} <span className="text-base text-slate-400 font-normal">/ 100</span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  atsAnalysis.score >= 80
                    ? 'bg-emerald-600'
                    : atsAnalysis.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${atsAnalysis.score}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Standardized ATS parsers look for single-column layout, plain text headings, quantifiable project metrics, and technical skill categorizations.
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Audit Checklist
            </h4>

            {atsAnalysis.passedItems.length > 0 && (
              <div className="space-y-2">
                {atsAnalysis.passedItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {atsAnalysis.suggestions.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-amber-800 block">
                  Recommended Improvements:
                </span>
                {atsAnalysis.suggestions.map((sug, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Clean White ATS Resume Sheet */}
        <div className="lg:col-span-8 bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 shadow-sm font-sans text-slate-900 text-xs leading-relaxed print:p-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {profile.name || 'YOUR FULL NAME'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {profile.college ? `${profile.branch || 'Engineering'} • ${profile.college}` : 'Engineering Candidate'}
            </p>

            {/* Contact details line */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-[11px] text-slate-700">
              {profile.email && <span>{profile.email}</span>}
              {profile.phone && <span>• {profile.phone}</span>}
              {profile.linkedinUrl && (
                <span>
                  • <a href={profile.linkedinUrl} className="text-indigo-700 hover:underline">LinkedIn</a>
                </span>
              )}
              {profile.githubUrl && (
                <span>
                  • <a href={profile.githubUrl} className="text-indigo-700 hover:underline">GitHub</a>
                </span>
              )}
              {profile.portfolioUrl && (
                <span>
                  • <a href={profile.portfolioUrl} className="text-indigo-700 hover:underline">Portfolio</a>
                </span>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="mb-5">
            <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
              Education
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-900">
                    {profile.college || 'Engineering College / University'}
                  </span>
                  <p className="text-[11px] text-slate-700">
                    Bachelor of Technology in {profile.branch || 'Your Branch'}
                  </p>
                </div>
                <div className="text-right text-[11px]">
                  <span className="font-bold text-slate-900">
                    CGPA: {profile.cgpa ? `${Number(profile.cgpa).toFixed(2)} / 10.0` : '—'}
                  </span>
                  <p className="text-slate-500">{profile.year || '2023 - 2027'}</p>
                </div>
              </div>

              {(profile.tenthPercent || profile.twelfthPercent) && (
                <div className="text-[11px] text-slate-600 flex gap-4 pt-1">
                  {profile.twelfthPercent && (
                    <span>Class XII / Intermediate: <strong>{profile.twelfthPercent}%</strong></span>
                  )}
                  {profile.tenthPercent && (
                    <span>Class X: <strong>{profile.tenthPercent}%</strong></span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Technical Skills */}
          <div className="mb-5">
            <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
              Technical Skills
            </h2>
            {(!profile.skills || profile.skills.length === 0) ? (
              <p className="text-slate-400 italic text-[11px]">No technical skills added yet.</p>
            ) : (
              <div className="space-y-1.5 text-[11px]">
                <div>
                  <strong className="text-slate-900">Languages & Core: </strong>
                  <span>
                    {profile.skills
                      .filter((s) => s.category === 'Languages' || s.category === 'Core CS')
                      .map((s) => s.name)
                      .join(', ') || 'C++, Java, Python, DSA'}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-900">Frameworks & Tools: </strong>
                  <span>
                    {profile.skills
                      .filter((s) => s.category === 'Frontend' || s.category === 'Backend' || s.category === 'Cloud & DevOps')
                      .map((s) => s.name)
                      .join(', ') || 'React, Node.js, Express, Docker, Git'}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-900">Databases & Cloud: </strong>
                  <span>
                    {profile.skills
                      .filter((s) => s.category === 'Databases')
                      .map((s) => s.name)
                      .join(', ') || 'PostgreSQL, MongoDB, Redis'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Engineering Projects */}
          <div className="mb-5">
            <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
              Technical Projects
            </h2>

            {(!profile.projects || profile.projects.length === 0) ? (
              <p className="text-slate-400 italic text-[11px]">No projects added yet.</p>
            ) : (
              <div className="space-y-3.5">
                {profile.projects.map((p) => (
                  <div key={p.id}>
                    <div className="flex justify-between items-baseline">
                      <div className="font-bold text-slate-900 text-xs">
                        {p.title}
                        {p.techStack && (
                          <span className="font-normal text-slate-600 text-[11px] ml-2">
                            | {p.techStack}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-indigo-700">
                        {p.githubUrl && <span>GitHub Repo</span>}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                      • {p.description}
                    </p>
                    {p.impact && (
                      <p className="text-[11px] text-slate-800 font-medium mt-0.5">
                        • Key Result: {p.impact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internships & Experience */}
          {profile.internships && profile.internships.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
                Work Experience
              </h2>
              <div className="space-y-3">
                {profile.internships.map((int) => (
                  <div key={int.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-xs">
                        {int.role} — <span className="font-medium text-slate-700">{int.company}</span>
                      </span>
                      <span className="text-[11px] text-slate-500">{int.duration}</span>
                    </div>
                    {int.description && (
                      <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                        • {int.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {profile.certifications && profile.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
                Certifications
              </h2>
              <div className="space-y-1 text-[11px]">
                {profile.certifications.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span className="font-medium text-slate-900">
                      • {c.title} — <span className="text-slate-600">{c.issuer}</span>
                    </span>
                    <span className="text-slate-500">{c.issueYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
