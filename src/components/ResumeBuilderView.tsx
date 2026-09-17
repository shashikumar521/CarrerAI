import React, { useState, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
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
  Download,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { calculateAtsScore } from '../utils/readinessCalculator';
import { EmptyStateBanner } from './EmptyStateBanner';
import { NavTab } from './Navbar';

// Helper to convert any modern CSS color functions (like oklch/oklab) into standard RGB format
// to ensure html2canvas never fails with "unsupported color function oklch".
function oklchToRgb(colorStr: string): string {
  if (!colorStr || (!colorStr.includes('oklch') && !colorStr.includes('oklab'))) {
    return colorStr;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = colorStr;
      const res = ctx.fillStyle;
      if (res && !res.includes('oklch') && !res.includes('oklab')) {
        return res;
      }
    }
  } catch {
    // Fallback if canvas context fails
  }

  // Safe fallback to dark slate for text/borders if conversion fails
  return '#0f172a';
}

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
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const isGeneratingRef = useRef(false);

  const atsAnalysis = calculateAtsScore(profile);

  // Compute industry ATS keywords missing from candidate profile
  const missingKeywords = useMemo(() => {
    const userSkills = (profile.skills || []).map((s) => s.name.toLowerCase());
    const projectText = (profile.projects || [])
      .map((p) => {
        const stackStr = Array.isArray(p.techStack)
          ? p.techStack.join(' ')
          : typeof p.techStack === 'string'
          ? p.techStack
          : '';
        return `${p.title || ''} ${stackStr} ${p.description || ''}`;
      })
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

  // Clean candidate filename formatter (e.g. Abhishek_Resume.pdf or Jane_Doe_Resume.pdf)
  const getCandidateFilename = (name?: string): string => {
    if (name && name.trim()) {
      const sanitized = name
        .trim()
        .replace(/[^a-zA-Z0-9\s_-]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      if (sanitized) return `${sanitized}_Resume.pdf`;
    }
    return 'Resume.pdf';
  };

  // 1. Native Print Resume: opens browser print dialog and prints ONLY the resume sheet
  const handlePrint = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const resumeEl = resumeRef.current;
    if (!resumeEl) {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Failed to trigger window.print():', err);
      }
      return;
    }

    try {
      // Clean up any previously created print iframe
      const oldFrame = document.getElementById('careerai-resume-print-iframe');
      if (oldFrame) {
        oldFrame.remove();
      }

      const printFrame = document.createElement('iframe');
      printFrame.id = 'careerai-resume-print-iframe';
      printFrame.setAttribute(
        'style',
        'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;visibility:hidden;'
      );
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!frameDoc) {
        window.focus();
        window.print();
        return;
      }

      // Collect all current document stylesheets to ensure identical typography and spacing
      const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((tag) => tag.outerHTML)
        .join('\n');

      const candidateTitle = profile.name ? `${profile.name.trim()} - Resume` : 'Candidate Resume';

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${candidateTitle}</title>
            ${styleTags}
            <style>
              @page {
                size: A4 portrait;
                margin: 10mm 12mm;
              }
              *, *::before, *::after {
                box-sizing: border-box;
              }
              html, body {
                background: #ffffff !important;
                background-color: #ffffff !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #careerai-printable-resume, .resume-sheet {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                background: #ffffff !important;
              }
              .resume-section {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                margin-bottom: 1.15rem !important;
              }
              .resume-section-heading {
                break-after: avoid !important;
                page-break-after: avoid !important;
              }
              .resume-item {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              a {
                color: #0f172a !important;
                text-decoration: none !important;
              }
            </style>
          </head>
          <body>
            <div id="careerai-printable-resume" class="resume-sheet">
              ${resumeEl.innerHTML}
            </div>
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          if (printFrame.contentWindow) {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
          } else {
            window.focus();
            window.print();
          }
        } catch (err) {
          console.warn('Iframe print failed, falling back to window.print():', err);
          window.focus();
          window.print();
        }
      }, 250);
    } catch (err) {
      console.warn('Error in isolated print setup, falling back to window.print():', err);
      try {
        window.focus();
        window.print();
      } catch (fallbackErr) {
        console.error('window.print() fallback failed:', fallbackErr);
      }
    }
  };

  // 2. Save Resume: generates and downloads high-quality A4 PDF with current profile data
  const handleSaveResume = async () => {
    if (isGeneratingRef.current || isSavingPdf) {
      return;
    }

    const resumeElement = resumeRef.current;
    if (!resumeElement) {
      setSaveFeedback({
        type: 'error',
        message: 'Unable to save your resume. Please try again.',
      });
      return;
    }

    isGeneratingRef.current = true;
    setIsSavingPdf(true);
    setSaveStatus('saving');
    setSaveFeedback(null);

    try {
      const filename = getCandidateFilename(profile.name);

      // Persist snapshot to localStorage as backup
      try {
        localStorage.setItem(
          'careerai_saved_resume_snapshot',
          JSON.stringify({
            profile,
            timestamp: new Date().toISOString(),
            score: atsAnalysis.score,
          })
        );
      } catch {
        // Non-blocking
      }

      // Capture resume with high-resolution settings for crystal-clear text
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 820,
        onclone: (clonedDoc) => {
          // 1. Sanitize all <style> tags in cloned document to convert any oklch colors into rgb
          clonedDoc.querySelectorAll('style').forEach((styleTag) => {
            if (styleTag.textContent && (styleTag.textContent.includes('oklch') || styleTag.textContent.includes('oklab'))) {
              styleTag.textContent = styleTag.textContent
                .replace(/oklch\([^)]+\)/g, (match) => oklchToRgb(match))
                .replace(/oklab\([^)]+\)/g, (match) => oklchToRgb(match));
            }
          });

          // 2. Intercept getComputedStyle on the cloned document's window
          // This guarantees that any property queried by html2canvas returns standard rgb colors instead of oklch
          const win = clonedDoc.defaultView || window;
          if (win && win.getComputedStyle) {
            const origGetComputedStyle = win.getComputedStyle.bind(win);
            win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
              const decl = origGetComputedStyle(elt, pseudoElt);
              return new Proxy(decl, {
                get(target, prop, receiver) {
                  const val = Reflect.get(target, prop, receiver);
                  if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                    return val
                      .replace(/oklch\([^)]+\)/g, (m) => oklchToRgb(m))
                      .replace(/oklab\([^)]+\)/g, (m) => oklchToRgb(m));
                  }
                  if (prop === 'getPropertyValue') {
                    return (propertyName: string) => {
                      const raw = target.getPropertyValue(propertyName);
                      if (raw && (raw.includes('oklch') || raw.includes('oklab'))) {
                        return raw
                          .replace(/oklch\([^)]+\)/g, (m) => oklchToRgb(m))
                          .replace(/oklab\([^)]+\)/g, (m) => oklchToRgb(m));
                      }
                      return raw;
                    };
                  }
                  return typeof val === 'function' ? val.bind(target) : val;
                },
              });
            };
          }

          // 3. Format and sanitize cloned resume container
          const cloned = clonedDoc.getElementById('careerai-printable-resume');
          if (cloned) {
            cloned.style.border = 'none';
            cloned.style.borderRadius = '0';
            cloned.style.boxShadow = 'none';
            cloned.style.backgroundColor = '#ffffff';
            cloned.style.color = '#0f172a';
            cloned.style.width = '794px'; // 210mm in pixels at standard 96 DPI
            cloned.style.maxWidth = '794px';
            cloned.style.margin = '0';
            cloned.style.padding = '32px 36px';

            // Explicitly sanitize all child nodes' inline styles
            const allChildNodes = cloned.querySelectorAll<HTMLElement>('*');
            allChildNodes.forEach((node) => {
              const styleAttr = node.getAttribute('style');
              if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
                node.setAttribute(
                  'style',
                  styleAttr
                    .replace(/oklch\([^)]+\)/g, (m) => oklchToRgb(m))
                    .replace(/oklab\([^)]+\)/g, (m) => oklchToRgb(m))
                );
              }
            });
          }
        },
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 10;
      const marginY = 10;
      const printableWidth = pageWidth - marginX * 2; // 190 mm
      const printableHeight = pageHeight - marginY * 2; // 277 mm

      const totalRenderedHeight = (canvas.height * printableWidth) / canvas.width;

      if (totalRenderedHeight <= printableHeight) {
        // Single page resume layout
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', marginX, marginY, printableWidth, totalRenderedHeight);
      } else {
        // Multi-page resume handling with section break detection
        const pageCanvasHeight = (printableHeight * canvas.width) / printableWidth;
        const elementRect = resumeElement.getBoundingClientRect();
        const scaleFactor = canvas.width / elementRect.width;

        const breakNodes = resumeElement.querySelectorAll<HTMLElement>('.resume-section, .resume-item, h2');
        const safeBreakYs: number[] = [];
        breakNodes.forEach((node) => {
          const rect = node.getBoundingClientRect();
          const topY = (rect.top - elementRect.top) * scaleFactor;
          if (topY > 0) {
            safeBreakYs.push(topY);
          }
        });

        let currentY = 0;
        let pageNum = 0;

        while (currentY < canvas.height) {
          let chunkHeight = Math.min(pageCanvasHeight, canvas.height - currentY);

          if (currentY + chunkHeight < canvas.height) {
            const nominalCutY = currentY + pageCanvasHeight;
            const minAcceptableY = currentY + pageCanvasHeight * 0.72;
            const candidateBreaks = safeBreakYs.filter(
              (y) => y > minAcceptableY && y <= nominalCutY
            );

            if (candidateBreaks.length > 0) {
              chunkHeight = Math.max(...candidateBreaks) - currentY;
            }
          }

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = chunkHeight;
          const ctx = pageCanvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              currentY,
              canvas.width,
              chunkHeight,
              0,
              0,
              canvas.width,
              chunkHeight
            );

            const chunkImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
            const chunkHeightMm = (chunkHeight * printableWidth) / canvas.width;

            if (pageNum > 0) {
              pdf.addPage('a4', 'portrait');
            }

            pdf.addImage(chunkImgData, 'JPEG', marginX, marginY, printableWidth, chunkHeightMm);
          }

          currentY += chunkHeight;
          pageNum++;
        }
      }

      pdf.save(filename);

      setSaveStatus('saved');
      setSaveFeedback({
        type: 'success',
        message: 'Resume saved successfully.',
      });

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);

      setTimeout(() => {
        setSaveFeedback(null);
      }, 4500);
    } catch (err) {
      console.warn('PDF generation encountered an error, falling back to browser print dialog:', err);
      try {
        handlePrint();
        setSaveStatus('saved');
        setSaveFeedback({
          type: 'success',
          message: 'Opened print preview. Select "Save as PDF" destination to download.',
        });
      } catch (fallbackErr) {
        console.error('Print fallback failed:', fallbackErr);
        setSaveStatus('error');
        setSaveFeedback({
          type: 'error',
          message: 'Unable to save your resume. Please try using "Print Resume".',
        });
      }
      setTimeout(() => {
        setSaveStatus('idle');
      }, 4000);
    } finally {
      isGeneratingRef.current = false;
      setIsSavingPdf(false);
    }
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-[21px] font-semibold text-slate-900 dark:text-white tracking-normal leading-[1.2] flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>AI Resume Builder – Professional ATS Resume</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and improve a professional resume with CarrerAi's career and resume tools.
          </p>
        </div>

        <div id="resume-actions" className="flex flex-wrap items-center gap-2.5">
          {/* Subtle feedback message */}
          {saveFeedback && (
            <div
              role="status"
              className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                saveFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {saveFeedback.type === 'success' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{saveFeedback.message}</span>
            </div>
          )}

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
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>{uploadedResumeName ? 'Upload Different Resume' : 'Upload New Resume'}</span>
          </button>

          {/* Analyze Resume CTA */}
          <button
            type="button"
            onClick={handleAnalyzeResume}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Auditing ATS...' : 'Analyze Resume'}</span>
          </button>

          {/* Save Resume CTA */}
          <button
            type="button"
            id="save-resume-btn"
            onClick={handleSaveResume}
            disabled={isSavingPdf}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSavingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Saved</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Save Resume</span>
              </>
            )}
          </button>

          {/* Print Resume */}
          <button
            type="button"
            id="print-resume-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Resume</span>
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
      <div
        ref={resumeRef}
        id="careerai-printable-resume"
        className="careerai-resume-page resume-page bg-white border border-slate-300 rounded-2xl p-4 sm:p-8 md:p-12 shadow-xs font-sans text-slate-900 text-xs leading-relaxed print:p-0 print:border-none print:shadow-none print:rounded-none print:max-w-none resume-sheet max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center resume-section">
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

        {/* Professional Summary */}
        {profile.bio && (
          <div className="mb-5 resume-section">
            <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900 resume-section-heading">
              Professional Summary
            </h2>
            <p className="text-[11px] text-slate-700 leading-relaxed resume-item">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Education */}
        <div className="mb-5 resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900 resume-section-heading">
            Education
          </h2>
          <div className="space-y-2 resume-item">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4">
              <div>
                <span className="font-bold text-slate-900">
                  {profile.college || 'Engineering College / University'}
                </span>
                <p className="text-[11px] text-slate-700">
                  Bachelor of Technology in {profile.branch || 'Your Branch'}
                </p>
              </div>
              <div className="sm:text-right text-[11px]">
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
        <div className="mb-5 resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900 resume-section-heading">
            Technical Skills
          </h2>
          {(!profile.skills || profile.skills.length === 0) ? (
            <p className="text-slate-400 italic text-[11px]">No technical skills added yet.</p>
          ) : (
            <div className="space-y-1.5 text-[11px] resume-item">
              <div>
                <strong className="text-slate-900">Languages &amp; Core: </strong>
                <span>
                  {profile.skills
                    .filter((s) => s.category === 'Languages' || s.category === 'Core CS')
                    .map((s) => s.name)
                    .join(', ') || 'C++, Java, Python, DSA'}
                </span>
              </div>
              <div>
                <strong className="text-slate-900">Frameworks &amp; Tools: </strong>
                <span>
                  {profile.skills
                    .filter((s) => s.category === 'Frontend' || s.category === 'Backend' || s.category === 'Cloud & DevOps')
                    .map((s) => s.name)
                    .join(', ') || 'React, Node.js, Express, Docker, Git'}
                </span>
              </div>
              <div>
                <strong className="text-slate-900">Databases &amp; Cloud: </strong>
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
        <div className="mb-5 resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900 resume-section-heading">
            Technical Projects
          </h2>

          {(!profile.projects || profile.projects.length === 0) ? (
            <p className="text-slate-400 italic text-[11px]">No projects added yet.</p>
          ) : (
            <div className="space-y-3.5">
              {profile.projects.map((p) => (
                <div key={p.id} className="resume-item">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5 sm:gap-4">
                    <div className="font-bold text-slate-900 text-xs">
                      {p.title}
                      {p.techStack && (
                        <span className="font-normal text-slate-600 text-[11px] ml-2">
                          | {Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}
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
          <div className="mb-5 resume-section">
            <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900 resume-section-heading">
              Work Experience
            </h2>
            <div className="space-y-3">
              {profile.internships.map((int) => (
                <div key={int.id} className="resume-item">
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
          <div className="resume-section">
            <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900 resume-section-heading">
              Certifications
            </h2>
            <div className="space-y-1 text-[11px]">
              {profile.certifications.map((c) => (
                <div key={c.id} className="flex justify-between resume-item">
                  <span className="font-medium text-slate-900">
                    • {c.title} — <span className="text-slate-600">{c.issuer}</span>
                  </span>
                  <span className="text-slate-500">{c.issueYear}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Honors & Achievements */}
        {(profile.entranceExam || profile.entranceRank) && (
          <div className="resume-section mt-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900 resume-section-heading">
              Honors &amp; Achievements
            </h2>
            <div className="space-y-1 text-[11px] resume-item">
              <p className="text-slate-800">
                • {profile.entranceExam || 'National Competitive Exam'}: Ranked{' '}
                <strong className="text-slate-900 font-semibold">{profile.entranceRank}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
