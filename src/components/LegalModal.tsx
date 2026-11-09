import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, CheckCircle2 } from 'lucide-react';

export interface LegalModalProps {
  isOpen: boolean;
  initialTab?: 'privacy' | 'terms';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#111D3B] text-slate-800 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            {activeTab === 'privacy' ? (
              <Shield className="w-5 h-5 text-[#5945E8]" />
            ) : (
              <FileText className="w-5 h-5 text-[#5945E8]" />
            )}
            <h2 id="legal-modal-title" className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              {activeTab === 'privacy' ? 'CareerAI Privacy Policy' : 'CareerAI Terms of Service'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111D3B] flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#5945E8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#5945E8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Terms of Service
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">
                Last updated: <span className="font-medium text-slate-900 dark:text-white">January 2026</span>
              </p>
              <p>
                CareerAI (&quot;we&quot;, &quot;our&quot;, or &quot;the Platform&quot;) is committed to safeguarding the privacy of students, job seekers, and engineering learners who use our career guidance and placement tools.
              </p>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                  1. Local-First Data Storage
                </h3>
                <p>
                  Your profile data—including academic percentages, target roles, project portfolios, and readiness assessment scores—is stored client-side in your device&apos;s browser storage by default. You retain full control over your career data at all times.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                  2. User Authentication &amp; Notifications
                </h3>
                <p>
                  When signing in via email or Google OAuth, we only process your verified name and email address to manage your account session and deliver relevant notifications. We never store or transmit your email passwords.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                  3. Zero Advertising &amp; Zero Data Selling
                </h3>
                <p>
                  We do not sell, rent, or monetize your personal information or resume records to third-party ad networks or recruitment brokers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                  4. Contacting Us
                </h3>
                <p>
                  For privacy inquiries or to request record removal, email{' '}
                  <a
                    href="mailto:sudarsishashikumar521@gmail.com"
                    className="text-[#5945E8] dark:text-violet-400 underline font-medium"
                  >
                    sudarsishashikumar521@gmail.com
                  </a>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">
                Last updated: <span className="font-medium text-slate-900 dark:text-white">January 2026</span>
              </p>
              <p>
                By using CareerAI, you agree to these Terms of Service. Please review them carefully before using our career exploration, resume builder, and placement diagnostics.
              </p>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                  1. Platform Purpose &amp; Educational Guidance
                </h3>
                <p>
                  CareerAI provides career guidance, skill roadmaps, ATS resume templates, and recruiter cutoff benchmarks designed to help students prepare for technology interviews. Readiness scores and AI counseling suggestions are diagnostic insights and do not represent guaranteed job offers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                  2. Acceptable Use
                </h3>
                <p>
                  You agree to use CareerAI for lawful personal educational and career development purposes. You must not attempt to disrupt the service, reverse-engineer platform APIs, or submit misleading academic records.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                  3. Intellectual Property
                </h3>
                <p>
                  All platform curriculum structures, placement readiness algorithms, and visual branding are the intellectual property of CareerAI and founder Sudarsi Shashi Kumar.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                  4. Modifications &amp; Contact
                </h3>
                <p>
                  We may periodically refine these terms to reflect feature improvements. Inquiries regarding terms can be directed to{' '}
                  <a
                    href="mailto:sudarsishashikumar521@gmail.com"
                    className="text-[#5945E8] dark:text-violet-400 underline font-medium"
                  >
                    sudarsishashikumar521@gmail.com
                  </a>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5945E8] hover:bg-violet-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>I Understand</span>
          </button>
        </div>
      </div>
    </div>
  );
};
