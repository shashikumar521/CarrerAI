import React, { useState } from 'react';
import { Phone, Mail, Github, ArrowUp, Sparkles } from 'lucide-react';
import { NavTab } from './Navbar';
import { LegalModal } from './LegalModal';

interface FooterProps {
  onReplayIntro?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onReplayIntro, onNavigateTab }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const handleLinkClick = (e: React.MouseEvent, tab: NavTab, path: string) => {
    if (onNavigateTab) {
      e.preventDefault();
      onNavigateTab(tab);
      if (typeof window !== 'undefined') {
        window.history.pushState({ tab }, '', path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <footer
        id="about"
        className="relative bg-[#111D3B] text-slate-300 border-t border-[#14213D] pt-8 sm:pt-9 pb-6 overflow-hidden print:hidden select-none sm:select-auto"
        aria-label="Site Footer"
      >
        {/* Subtle Violet Ambient Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#5945E8]/10 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-10 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Brand Section */}
          <div className="pb-4 mb-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 p-0.5 border border-white/15 flex items-center justify-center shrink-0 shadow-inner group/logo hover:border-[#5945E8]/80 hover:shadow-[0_0_14px_rgba(89,69,232,0.45)] transition-all duration-300">
                  <img
                    src="/careerai-logo.png"
                    alt="CareerAI logo"
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Career<span className="text-[#5945E8]">AI</span>
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed font-normal">
                Your intelligent companion for career discovery, skill development and professional growth.
              </p>
            </div>

            {/* Quick Email & GitHub Action Icons */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://github.com/shashikumar521/CarrerAI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CareerAI on GitHub"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#5945E8]/60 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
              >
                <Github className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:text-violet-300" />
              </a>
              <a
                href="mailto:sudarsishashikumar521@gmail.com"
                aria-label="Email CareerAI"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#5945E8]/60 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
              >
                <Mail className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:text-violet-300" />
              </a>
            </div>
          </div>

          {/* Four Columns Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pb-6 border-b border-white/10">
            {/* Column 1 — Explore */}
            <div className="flex flex-col items-start">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 mb-2.5 flex items-center gap-1.5">
                <span>Explore</span>
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-[13px]">
                <li>
                  <a
                    href="/"
                    onClick={(e) => handleLinkClick(e, 'home', '/')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      Home
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/#features"
                    onClick={(e) => handleLinkClick(e, 'home', '/#features')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      Features
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/#how-it-works"
                    onClick={(e) => handleLinkClick(e, 'home', '/#how-it-works')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      How It Works
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/#about"
                    onClick={(e) => handleLinkClick(e, 'home', '/#about')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      Contact
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 — Career Tools */}
            <div className="flex flex-col items-start">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 mb-2.5 flex items-center gap-1.5">
                <span>Career Tools</span>
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-[13px]">
                <li>
                  <a
                    href="/career"
                    onClick={(e) => handleLinkClick(e, 'counselor', '/career')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      AI Career Guidance
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/resume"
                    onClick={(e) => handleLinkClick(e, 'resume', '/resume')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      Resume Builder
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/courses"
                    onClick={(e) => handleLinkClick(e, 'courses', '/courses')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      Courses &amp; Learning
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#prep"
                    onClick={(e) => handleLinkClick(e, 'prep', '#prep')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      Interview Preparation
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 — Opportunities */}
            <div className="flex flex-col items-start">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 mb-2.5 flex items-center gap-1.5">
                <span>Opportunities</span>
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-[13px]">
                <li>
                  <a
                    href="#dashboard"
                    onClick={(e) => handleLinkClick(e, 'dashboard', '#dashboard')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      Placement Hub
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/courses"
                    onClick={(e) => handleLinkClick(e, 'courses', '/courses')}
                    className="group text-left text-slate-400 hover:text-white transition-colors duration-200 py-0.5 inline-flex items-center cursor-pointer min-h-[30px]"
                  >
                    <span className="relative inline-block">
                      Learning Resources
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 — Get in Touch */}
            <div id="footer-contact" className="flex flex-col items-start scroll-mt-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 mb-2.5 flex items-center gap-1.5">
                <span>Get in Touch</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-[13px]">
                <li>
                  <a
                    href="mailto:sudarsishashikumar521@gmail.com"
                    className="group inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200 py-0.5"
                    aria-label="Email CareerAI Founder"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[#5945E8] group-hover:text-violet-300 group-hover:border-[#5945E8]/40 transition-all duration-200 shrink-0">
                      <Mail className="w-3 h-3 transition-transform group-hover:scale-110" />
                    </div>
                    <span className="relative break-all">
                      sudarsishashikumar521@gmail.com
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+916303268680"
                    className="group inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200 py-0.5"
                    aria-label="Call CareerAI Founder"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[#5945E8] group-hover:text-violet-300 group-hover:border-[#5945E8]/40 transition-all duration-200 shrink-0">
                      <Phone className="w-3 h-3 transition-transform group-hover:scale-110" />
                    </div>
                    <span className="relative">
                      +91-6303268680
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#5945E8] transition-all duration-200 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li className="pt-2 mt-1 border-t border-white/10 flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    BUILT &amp; CREATED BY
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold text-white tracking-wide">
                    SUDARSI SHASHI KUMAR
                  </span>
                  <span className="text-[11px] font-normal text-[#C4B5FD]/90">
                    Founder &amp; Creator of CareerAI
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Compact Bottom Bar: Divider, Copyright, Legal Links, and Back to Top */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p className="order-2 sm:order-1">© {new Date().getFullYear()} CareerAI. All rights reserved.</p>

            {/* Compact Legal Links */}
            <div className="order-1 sm:order-2 flex items-center gap-3 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="hover:text-white transition-colors cursor-pointer py-0.5"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:text-white transition-colors cursor-pointer py-0.5"
              >
                Terms of Service
              </button>
            </div>

            {/* Back to Top & Replay Intro */}
            <div className="order-3 flex items-center gap-3">
              {onReplayIntro && (
                <>
                  <button
                    type="button"
                    onClick={onReplayIntro}
                    className="hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                  >
                    <Sparkles className="w-3 h-3 text-[#5945E8]" />
                    <span>Replay Intro</span>
                  </button>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                </>
              )}
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 py-0.5 group"
              >
                <span>Back to top</span>
                <ArrowUp className="w-3 h-3 text-[#5945E8] group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightweight Privacy Policy & Terms Modal */}
      <LegalModal
        isOpen={legalModal !== null}
        initialTab={legalModal || 'privacy'}
        onClose={() => setLegalModal(null)}
      />
    </>
  );
};
