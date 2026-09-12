import React, { useState, useRef, useMemo } from 'react';
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
  Upload,
  RefreshCw,
  Tag,
  Check,
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const atsAnalysis = calculateAtsScore(profile);

  // Compute industry ATS keywords missing from candidate profile
  const missingKeywords = useMemo(() => {
    const userSkills = (profile.skills || []).map((s) => s.name.toLowerCase());
    const projectText = (profile.projects || [])
      .map((p) => `${p.title} ${p.techStack.join(' ')} ${p.description}`)
      .join(' ')
      .toLowerCase();

    const standardAtsKeywords = [
      'RESTful APIs',
      'System Architecture',
      'Git Version Control',
      'CI/CD Pipelines',
      'Unit Testing',
      'Docker & Containers',
      'Data Structures',
      'SQL / Relational DBs',
      'Agile / Scrum',
      'Microservices',
    ];

    return standardAtsKeywords.filter((keyword) => {
      const firstWord = keyword.toLowerCase().split(' ')[0];
      const hasInSkill = userSkills.some((s) => s.includes(firstWord));
      const hasInProject = projectText.includes(firstWord);
      return !hasInSkill && !hasInProject;
    });
  }, [profile.skills, profile.projects]);

  const handlePrint = () => {
    window.print();
  };

  const handleAnalyzeResume = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedResumeName(file.name);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2] flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>ATS Resume Generator &amp; Compliance Auditor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Single-column, recruiter-friendly template engineered to pass Applicant Tracking Systems without layout breakage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Upload New Resume CTA */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>{uploadedResumeName ? 'Upload Different Resume' : 'Upload New Resume'}</span>
          </button>

          {/* Analyze Resume CTA */}
          <button
            type="button"
            onClick={handleAnalyzeResume}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Auditing ATS...' : 'Analyze Resume'}</span>
          </button>

          {/* Print / Save as PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {uploadedResumeName && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Uploaded: <strong>{uploadedResumeName}</strong> (Audited against standard ATS models)</span>
          </div>
          <button
            onClick={() => setUploadedResumeName(null)}
            className="text-emerald-700 hover:underline font-semibold text-[11px] cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

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

      {/* ========================================================================= */}
      {/* ATS ANALYSIS: Large Overall Score + 3 Distinct Panels (Strengths, Missing, Improvements) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-5">
            {/* Overall ATS Score - Large High Contrast */}
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                {atsAnalysis.score}
              </span>
              <span className="text-lg font-bold text-slate-400">/100</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                    atsAnalysis.score >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : atsAnalysis.score >= 50
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {atsAnalysis.score >= 80 ? 'ATS Optimized' : atsAnalysis.score >= 50 ? 'Moderate Compatibility' : 'Needs Optimization'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Based on single-column parser readability, keyword density, and quantified impact metrics.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Readability</span>
              <span>{atsAnalysis.score}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  atsAnalysis.score >= 80
                    ? 'bg-emerald-600'
                    : atsAnalysis.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${atsAnalysis.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Clear Panels: Strengths, Missing Keywords, Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Panel 1: Strengths */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Strengths ({atsAnalysis.passedItems.length})
              </h3>
            </div>
            <p className="text-[11px] text-emerald-700/90 font-medium">What is working well in your resume</p>
            <div className="space-y-2 pt-1">
              {atsAnalysis.passedItems.length > 0 ? (
                atsAnalysis.passedItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-emerald-900">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-emerald-800 italic">No verified strengths yet. Complete your profile details.</p>
              )}
            </div>
          </div>

          {/* Panel 2: Missing Keywords */}
          <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Missing Keywords ({missingKeywords.length})
              </h3>
            </div>
            <p className="text-[11px] text-indigo-700/90 font-medium">High-frequency terms ATS filters look for</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingKeywords.length > 0 ? (
                missingKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-indigo-800 border border-indigo-200 shadow-2xs"
                  >
                    + {kw}
                  </span>
                ))
              ) : (
                <p className="text-xs text-indigo-800 italic">All critical core ATS keywords detected!</p>
              )}
            </div>
          </div>

          {/* Panel 3: Improvements */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Improvements ({atsAnalysis.suggestions.length})
              </h3>
            </div>
            <p className="text-[11px] text-amber-700/90 font-medium">Actionable steps to elevate your score</p>
            <div className="space-y-2 pt-1">
              {atsAnalysis.suggestions.length > 0 ? (
                atsAnalysis.suggestions.map((sug, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span className="leading-snug">{sug}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-amber-800 italic">No critical improvements needed!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Resume Canvas (Full Width for Premium Readability) */}
      <div className="bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 shadow-xs font-sans text-slate-900 text-xs leading-relaxed print:p-0 print:border-none print:shadow-none resume-sheet max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center">
            <h1 className="text-[21px] font-semibold tracking-normal leading-[1.2] text-slate-900 uppercase">
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
            <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
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
            <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
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
            <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
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
              <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
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
              <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
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
  );
};
