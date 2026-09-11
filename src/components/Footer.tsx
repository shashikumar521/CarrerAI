import React from 'react';
import { GraduationCap, Phone, Mail, User, Sparkles } from 'lucide-react';

interface FooterProps {
  onReplayIntro?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onReplayIntro }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-400 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-slate-800">
          {/* Brand & Purpose */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/careerai-logo.png"
                alt="CareerAI official logo"
                className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-slate-700 shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-black tracking-tight text-white">
                Career<span className="text-indigo-400">AI</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              AI-powered career guidance, placement readiness and personalized career planning for B.Tech and engineering students.
            </p>
          </div>

          {/* Created by */}
          <div className="md:col-span-3 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Created by</span>
            </h3>
            <p className="text-sm font-semibold text-white">
              Sudarsi Shashi Kumar
            </p>
            <p className="text-xs text-slate-400">
              Engineering Placement &amp; Career Intelligence
            </p>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Contact
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="tel:6303268680"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors py-1 group"
                  aria-label="Call 6303268680"
                >
                  <span className="w-6 h-6 rounded-md bg-slate-800 group-hover:bg-indigo-950 flex items-center justify-center text-indigo-400 transition-colors shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium tracking-wide">6303268680</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:sudarsishashikumar521@gmail.com"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors py-1 group break-all sm:break-normal"
                  aria-label="Email sudarsishashikumar521@gmail.com"
                >
                  <span className="w-6 h-6 rounded-md bg-slate-800 group-hover:bg-indigo-950 flex items-center justify-center text-indigo-400 transition-colors shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">sudarsishashikumar521@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 CareerAI. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="text-slate-400 hover:text-indigo-400 underline transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Replay Startup Intro</span>
              </button>
            )}
            <span>Client Data Privacy: Local Storage Only</span>
            <span>•</span>
            <span>AI Placement Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
