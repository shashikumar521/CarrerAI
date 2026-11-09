import React, { useState, useEffect } from 'react';
import {
  Bot,
  FileText,
  Award,
  Target,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  LayoutDashboard,
  CheckCircle2,
  BookOpen,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { AuthUser } from '../types';
import { NavTab } from './Navbar';
import { CareerAi3DOrbVisual } from './CareerAi3DOrbVisual';
import { Footer } from './Footer';

interface LandingPageViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

// Strictly verify if the current route is the exact homepage route '/'
const isExactHomeRoute = (): boolean => {
  if (typeof window === 'undefined') return true;
  const path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
  const hash = (window.location.hash || '').replace(/^#/, '').toLowerCase();
  return path === '/' && (hash === '' || hash === 'home');
};

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigate,
  onOpenAuth,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'features' | 'how-it-works' | 'about'>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
    const hash = (window.location.hash || '').replace(/^#/, '').toLowerCase();
    if (path === '/features' || hash === 'features') return 'features';
    if (path === '/how-it-works' || hash === 'how-it-works') return 'how-it-works';
    if (path === '/about' || hash === 'about') return 'about';
    return 'home';
  });

  const [isExactHome, setIsExactHome] = useState<boolean>(() => isExactHomeRoute());

  // Synchronize route state on mount, popstate and hashchange
  useEffect(() => {
    const handleLocationSync = () => {
      if (typeof window === 'undefined') return;
      const path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
      const hash = (window.location.hash || '').replace(/^#/, '').toLowerCase();

      setIsExactHome(isExactHomeRoute());

      if (path === '/features' || hash === 'features') {
        setActiveNav('features');
        setTimeout(() => {
          const el = document.getElementById('features');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      } else if (path === '/how-it-works' || hash === 'how-it-works') {
        setActiveNav('how-it-works');
        setTimeout(() => {
          const el = document.getElementById('how-it-works');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      } else if (path === '/about' || hash === 'about') {
        setActiveNav('about');
      } else if (path === '/' && (hash === '' || hash === 'home')) {
        setActiveNav('home');
      }
    };

    handleLocationSync();
    window.addEventListener('popstate', handleLocationSync);
    window.addEventListener('hashchange', handleLocationSync);
    return () => {
      window.removeEventListener('popstate', handleLocationSync);
      window.removeEventListener('hashchange', handleLocationSync);
    };
  }, []);

  // Smooth scroll helper for on-page sections with URL route synchronization
  const scrollToSection = (sectionId: string, navKey?: 'home' | 'features' | 'how-it-works' | 'about') => {
    setMobileMenuOpen(false);
    if (navKey) {
      setActiveNav(navKey);
      if (typeof window !== 'undefined') {
        const targetPath = navKey === 'home' ? '/' : `/${navKey}`;
        window.history.pushState({ tab: navKey }, '', targetPath);
        setIsExactHome(targetPath === '/');
      }
    }
    if (navKey === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Primary CTA (Start Journey / Get Started)
  const handlePrimaryCTA = () => {
    if (currentUser) {
      onNavigate('dashboard');
    } else {
      onOpenAuth('signup');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#14213D] font-sans antialiased selection:bg-[#5945E8] selection:text-white">
      {/* =========================================================================
          1. HEADER AND NAVIGATION
          Vertically centered, compact height, accessible hamburger touch target
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8EAF2] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Left: Brand Logo & Title */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('', 'home');
              }}
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden"
              aria-label="CareerAI Homepage"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-[#E8EAF2] shadow-xs flex items-center justify-center overflow-hidden p-0.5 transition-transform duration-300 group-hover:scale-105 shrink-0">
                <img
                  src="/careerai-logo.png"
                  alt="CareerAI logo"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-semibold tracking-tight text-[#14213D] leading-none">
                  CareerAI
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium tracking-wider text-[#64748B] uppercase mt-0.5">
                  AI Career Platform
                </span>
              </div>
            </a>

            {/* Center: Desktop Navigation Links with animated indicator */}
            <nav className="hidden md:flex items-center gap-1 bg-[#F7F8FC] p-1.5 rounded-full border border-[#E8EAF2]">
              <button
                type="button"
                onClick={() => scrollToSection('', 'home')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  activeNav === 'home'
                    ? 'bg-white text-[#14213D] shadow-xs'
                    : 'text-[#64748B] hover:text-[#14213D]'
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features', 'features')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  activeNav === 'features'
                    ? 'bg-white text-[#14213D] shadow-xs'
                    : 'text-[#64748B] hover:text-[#14213D]'
                }`}
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works', 'how-it-works')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  activeNav === 'how-it-works'
                    ? 'bg-white text-[#14213D] shadow-xs'
                    : 'text-[#64748B] hover:text-[#14213D]'
                }`}
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('about', 'about')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  activeNav === 'about'
                    ? 'bg-white text-[#14213D] shadow-xs'
                    : 'text-[#64748B] hover:text-[#14213D]'
                }`}
              >
                About
              </button>
            </nav>

            {/* Right: Desktop Auth Actions */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#5945E8] to-[#7868F5] hover:opacity-95 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Dashboard</span>
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-3 py-2 text-xs font-medium text-[#64748B] hover:text-[#14213D] transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signin')}
                    className="px-4 py-2 text-sm font-medium text-[#14213D] hover:text-[#5945E8] transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#5945E8] to-[#7868F5] hover:opacity-95 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button with comfortable 44px touch target */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
                className="w-11 h-11 flex items-center justify-center rounded-xl text-[#14213D] hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu with viewport constraint and smooth transition */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8EAF2] bg-white/98 backdrop-blur-lg px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <nav className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => scrollToSection('', 'home')}
                className={`w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  activeNav === 'home' ? 'bg-[#F0EDFF] text-[#5945E8]' : 'text-[#14213D] hover:bg-slate-50'
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features', 'features')}
                className={`w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  activeNav === 'features' ? 'bg-[#F0EDFF] text-[#5945E8]' : 'text-[#14213D] hover:bg-slate-50'
                }`}
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works', 'how-it-works')}
                className={`w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  activeNav === 'how-it-works' ? 'bg-[#F0EDFF] text-[#5945E8]' : 'text-[#14213D] hover:bg-slate-50'
                }`}
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('about', 'about')}
                className={`w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  activeNav === 'about' ? 'bg-[#F0EDFF] text-[#5945E8]' : 'text-[#14213D] hover:bg-slate-50'
                }`}
              >
                About
              </button>

              <div className="pt-3 mt-2 border-t border-[#E8EAF2] flex flex-col gap-2">
                {currentUser ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5945E8] to-[#7868F5] shadow-xs transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open Dashboard</span>
                    </button>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full min-h-[44px] flex items-center justify-center text-sm font-medium text-[#64748B] py-2 hover:text-[#14213D]"
                      >
                        Sign Out
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth('signin');
                      }}
                      className="w-full min-h-[48px] flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-[#14213D] border border-[#E8EAF2] hover:bg-slate-50 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth('signup');
                      }}
                      className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5945E8] to-[#7868F5] transition-all shadow-xs"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* =========================================================================
            2. HERO SECTION — ASYMMETRIC TWO-COLUMN WITH 3D CAREER-GROWTH VISUAL
            Mobile-optimized typography, tight vertical spacing & clean indicators
            ========================================================================= */}
        <section className="relative pt-6 pb-6 sm:pt-10 sm:pb-10 lg:pt-12 lg:pb-12 bg-gradient-to-b from-[#F7F8FC]/80 via-white to-[#F7F8FC] overflow-hidden">
          {/* Subtle Ambient Background Violet & Sky Lighting Layers */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-1/4 w-[36rem] h-[22rem] bg-gradient-to-tr from-[#5945E8]/12 via-[#7868F5]/10 to-sky-400/8 blur-3xl pointer-events-none -z-10 rounded-full"
          />
          <div
            aria-hidden="true"
            className="absolute -top-12 left-10 w-72 h-72 bg-violet-400/8 blur-2xl pointer-events-none -z-10 rounded-full"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
              {/* LEFT COLUMN: Headlines, Value Prop, CTA Actions & Benefit Indicators */}
              <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
                {/* Small Introductory Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EDFF] border border-[#5945E8]/20 text-[11px] sm:text-xs font-semibold tracking-wider text-[#5945E8] uppercase mb-3 sm:mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#5945E8]" />
                  <span>YOUR PERSONAL AI CAREER COMPANION</span>
                </div>

                {/* Refined Balanced 3-Line Heading with Purple Gradient Highlight on 3rd Line */}
                <h1 className="hero-headline text-[#14213D] mb-3.5 sm:mb-4 max-w-xl">
                  <span className="block">Build Your Skills.</span>
                  <span className="block">Discover Your Potential.</span>
                  <span className="block bg-gradient-to-r from-[#5945E8] via-[#7868F5] to-[#4338CA] bg-clip-text text-transparent">
                    Shape Your Future.
                  </span>
                </h1>

                {/* Description: Readable text with balanced width & line spacing */}
                <p className="text-[15px] min-[360px]:text-[16px] sm:text-[17px] text-[#64748B] leading-relaxed mb-5 sm:mb-6 max-w-lg">
                  Discover your strengths, build professional resumes, develop in-demand skills and prepare for opportunities with your intelligent career companion.
                </p>

                {/* CTA Buttons: Consistent height, smooth hover elevation, accessible focus & contrast */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 sm:mb-6">
                  <button
                    type="button"
                    onClick={handlePrimaryCTA}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6.5 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-[#5945E8] to-[#7868F5] hover:from-[#4F3ED4] hover:to-[#6C5CE7] hover:-translate-y-0.5 shadow-md hover:shadow-lg active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945E8] focus-visible:ring-offset-2 rounded-xl transition-all duration-200 cursor-pointer text-center group"
                  >
                    <span>Start Your Journey</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('features', 'features')}
                    className="min-h-[48px] inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-[#14213D] bg-white hover:bg-slate-50 hover:-translate-y-0.5 border border-[#E8EAF2] hover:border-[#5945E8]/30 shadow-2xs hover:shadow-sm active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945E8] focus-visible:ring-offset-2 rounded-xl transition-all duration-200 cursor-pointer text-center"
                  >
                    Explore Features
                  </button>
                </div>

                {/* Hero Benefit Indicators: Clean structured responsive layout */}
                <div className="w-full pt-3.5 border-t border-[#E8EAF2]/80">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-[13px] font-medium text-[#14213D]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#5945E8] shrink-0" />
                      <span className="truncate">Career Guidance</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#5945E8] shrink-0" />
                      <span className="truncate">Resume Building</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#5945E8] shrink-0" />
                      <span className="truncate">Skill Development</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PROPORTIONALLY SCALED 3D CAREER-GROWTH VISUAL */}
              <div className="lg:col-span-6 xl:col-span-6 w-full flex items-center justify-center pt-2 sm:pt-0">
                <CareerAi3DOrbVisual />
              </div>
            </div>
          </div>

          {/* Smooth Soft Divider into Features */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E8EAF2] to-transparent mt-6 sm:mt-10 lg:mt-12" />
        </section>

        {/* =========================================================================
            3. FEATURES SECTION — VISUALLY CONSISTENT WITH HERO DESIGN
            1-column on narrow mobile, 15-20% reduced vertical space, balanced heights
            ========================================================================= */}
        <section id="features" className="pt-8 sm:pt-14 pb-12 sm:pb-16 bg-[#F7F8FC] border-b border-[#E8EAF2] relative overflow-hidden">
          {/* Ambient Lighting Mirroring Hero */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[32rem] h-40 bg-gradient-to-b from-[#5945E8]/8 to-transparent blur-3xl pointer-events-none rounded-full"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EDFF] border border-[#5945E8]/20 text-[11px] sm:text-xs font-semibold tracking-wider text-[#5945E8] uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INTELLIGENT CAREER PLATFORM</span>
              </div>
              <h2 className="text-[25px] min-[360px]:text-[28px] sm:text-3xl md:text-4xl font-semibold text-[#14213D] tracking-tight">
                Everything You Need to Move Forward
              </h2>
              <p className="text-[16px] sm:text-[17px] text-[#64748B] mt-2 max-w-xl mx-auto leading-relaxed">
                Discover, develop and prepare for your next career opportunity with CareerAI.
              </p>
            </div>

            {/* Features Grid: 4 Cards with Consistent Heights & Premium Hover Elevation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
              {/* Feature 1: AI Career Guidance */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onNavigate('counselor')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('counselor');
                  }
                }}
                className="cai-feature-card group bg-white rounded-2xl border border-[#E8EAF2] p-5 sm:p-6 shadow-[0_4px_20px_rgba(20,33,61,0.04)] hover:shadow-[0_16px_36px_rgba(89,69,232,0.14)] hover:border-[#5945E8]/60 flex flex-col justify-between h-full cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5945E8]"
              >
                <div className="flex flex-col flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#5945E8]/10 text-[#5945E8] flex items-center justify-center mb-3.5 sm:mb-4 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:bg-[#5945E8] group-hover:text-white transition-all duration-300 shadow-2xs">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F0EDFF] text-[#5945E8] mb-2 self-start">
                    AI Guidance
                  </div>
                  {/* Consistent Title Min-Height across all cards */}
                  <h3 className="text-base sm:text-lg font-semibold text-[#14213D] tracking-tight leading-snug min-h-[2.5rem] sm:min-h-[3.25rem] flex items-start">
                    AI Career Guidance
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed min-h-[2.5rem] sm:min-h-[2.75rem]">
                    Personalized career recommendations, market insights and tailored role pathways.
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F7F8FC] border border-[#E8EAF2] px-2 py-0.5 rounded-md">
                      Role Mapping
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F7F8FC] border border-[#E8EAF2] px-2 py-0.5 rounded-md">
                      Gap Diagnosis
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#5945E8] group-hover:text-[#4338CA] transition-colors">
                  <span>Explore Guidance</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                </div>
              </div>

              {/* Feature 2: Smart Resume Builder */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onNavigate('resume')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('resume');
                  }
                }}
                className="cai-feature-card group bg-white rounded-2xl border border-[#E8EAF2] p-5 sm:p-6 shadow-[0_4px_20px_rgba(20,33,61,0.04)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.14)] hover:border-emerald-500/60 flex flex-col justify-between h-full cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="flex flex-col flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3.5 sm:mb-4 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 mb-2 self-start">
                    ATS Compliant
                  </div>
                  {/* Consistent Title Min-Height across all cards */}
                  <h3 className="text-base sm:text-lg font-semibold text-[#14213D] tracking-tight leading-snug min-h-[2.5rem] sm:min-h-[3.25rem] flex items-start">
                    Smart Resume Builder
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed min-h-[2.5rem] sm:min-h-[2.75rem]">
                    Build professional, recruiter-ready resumes optimized with smart keyword parsing.
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F7F8FC] border border-[#E8EAF2] px-2 py-0.5 rounded-md">
                      ATS Scanner
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F7F8FC] border border-[#E8EAF2] px-2 py-0.5 rounded-md">
                      Instant PDF
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                  <span>Build Resume</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                </div>
              </div>

              {/* Feature 3: Courses & Skill Development */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onNavigate('courses')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('courses');
                  }
                }}
                className="cai-feature-card group bg-white rounded-2xl border border-[#E8EAF2] p-5 sm:p-6 shadow-[0_4px_20px_rgba(20,33,61,0.04)] hover:shadow-[0_16px_36px_rgba(56,189,248,0.14)] hover:border-sky-500/60 flex flex-col justify-between h-full cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <div className="flex flex-col flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-3.5 sm:mb-4 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-2xs">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 mb-2 self-start">
                    Industry Roadmaps
                  </div>
                  {/* Consistent Title Min-Height across all cards */}
                  <h3 className="text-base sm:text-lg font-semibold text-[#14213D] tracking-tight leading-snug min-h-[2.5rem] sm:min-h-[3.25rem] flex items-start">
                    Courses &amp; Skill Development
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed min-h-[2.5rem] sm:min-h-[2.75rem]">
                    Explore curated technical tracks, verified certifications and roadmaps.
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F7F8FC] border border-[#E8EAF2] px-2 py-0.5 rounded-md">
                      Verified Certs
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F7F8FC] border border-[#E8EAF2] px-2 py-0.5 rounded-md">
                      DSA &amp; Cloud
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600 group-hover:text-sky-700 transition-colors">
                  <span>Browse Courses</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                </div>
              </div>

              {/* Feature 4: Interview Preparation */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onNavigate('prep')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('prep');
                  }
                }}
                className="cai-feature-card group bg-white rounded-2xl border border-[#E8EAF2] p-5 sm:p-6 shadow-[0_4px_20px_rgba(20,33,61,0.04)] hover:shadow-[0_16px_36px_rgba(168,85,247,0.14)] hover:border-violet-500/60 flex flex-col justify-between h-full cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <div className="flex flex-col flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center mb-3.5 sm:mb-4 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 mb-2 self-start">
                    Prep Hub
                  </div>
                  {/* Consistent Title Min-Height across all cards */}
                  <h3 className="text-base sm:text-lg font-semibold text-[#14213D] tracking-tight leading-snug min-h-[2.5rem] sm:min-h-[3.25rem] flex items-start">
                    Interview Preparation
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed min-h-[2.5rem] sm:min-h-[2.75rem]">
                    Practice structured technical and behavioral questions with targeted feedback.
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F7F8FC] border border-[#E8EAF2] px-2 py-0.5 rounded-md">
                      STAR Drills
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-[#F7F8FC] border border-[#E8EAF2] px-2 py-0.5 rounded-md">
                      Core CS
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-600 group-hover:text-violet-700 transition-colors">
                  <span>Start Practicing</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. HOW IT WORKS SECTION — FOUR-STAGE CONNECTED TIMELINE
            Compact vertical timeline on mobile, connected horizontal on desktop
            ========================================================================= */}
        <section id="how-it-works" className="py-10 sm:py-16 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EDFF] border border-[#5945E8]/20 text-[11px] sm:text-xs font-semibold tracking-wider text-[#5945E8] uppercase mb-2">
                <span>STRUCTURED PROGRESSION</span>
              </div>
              <h2 className="text-[25px] min-[360px]:text-[28px] sm:text-3xl md:text-4xl font-semibold text-[#14213D] tracking-tight">
                Your Career Journey, Simplified
              </h2>
              <p className="text-[15px] sm:text-base text-[#64748B] mt-2 max-w-xl mx-auto leading-relaxed">
                A structured four-stage pathway from skill discovery to placement success.
              </p>
            </div>

            {/* DESKTOP TIMELINE (≥ md): 4 Columns with horizontal connecting gradient line & small connection points */}
            <div className="hidden md:block relative">
              {/* Desktop Connecting Line with Subtle Violet Gradient */}
              <div
                aria-hidden="true"
                className="absolute top-11 left-8 right-8 h-[2px] bg-gradient-to-r from-[#5945E8]/20 via-[#7868F5]/50 to-[#5945E8]/20 z-0 pointer-events-none"
              />

              {/* Small connection point nodes between stages on the line */}
              <div
                aria-hidden="true"
                className="absolute top-[41px] left-[25%] -translate-x-1/2 w-2 h-2 rounded-full bg-[#7868F5] ring-4 ring-white shadow-xs z-1 pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute top-[41px] left-[50%] -translate-x-1/2 w-2 h-2 rounded-full bg-[#7868F5] ring-4 ring-white shadow-xs z-1 pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute top-[41px] left-[75%] -translate-x-1/2 w-2 h-2 rounded-full bg-[#7868F5] ring-4 ring-white shadow-xs z-1 pointer-events-none"
              />

              <div className="grid md:grid-cols-4 gap-5 lg:gap-6 items-stretch relative z-10">
                {/* Stage 1: Discover */}
                <div className="cai-journey-card group bg-[#F7F8FC] border border-[#E8EAF2] hover:border-[#5945E8]/40 hover:bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(20,33,61,0.03)] hover:shadow-[0_12px_28px_rgba(89,69,232,0.10)] flex flex-col justify-between h-full relative transition-all duration-300">
                  <div>
                    {/* Header: Number Badge + Stage Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#E8EAF2] text-[#5945E8] font-bold text-base flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-[#5945E8] group-hover:text-white group-hover:border-[#5945E8] transition-all duration-300 relative">
                        01
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7868F5] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#5945E8]/10 text-[#5945E8] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                        <Target className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#5945E8] mb-1">
                      DISCOVER
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#14213D] tracking-tight mb-2 min-h-[2.5rem] sm:min-h-[3rem] flex items-start">
                      Evaluate &amp; Benchmark
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed min-h-[2.5rem]">
                      Understand your strengths and career interests.
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E8EAF2]/80 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>Stage 1 of 4</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5945E8]/40 group-hover:bg-[#5945E8] transition-colors" />
                  </div>
                </div>

                {/* Stage 2: Learn */}
                <div className="cai-journey-card group bg-[#F7F8FC] border border-[#E8EAF2] hover:border-[#5945E8]/40 hover:bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(20,33,61,0.03)] hover:shadow-[0_12px_28px_rgba(89,69,232,0.10)] flex flex-col justify-between h-full relative transition-all duration-300">
                  <div>
                    {/* Header: Number Badge + Stage Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#E8EAF2] text-[#5945E8] font-bold text-base flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-[#5945E8] group-hover:text-white group-hover:border-[#5945E8] transition-all duration-300 relative">
                        02
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7868F5] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#5945E8] mb-1">
                      LEARN
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#14213D] tracking-tight mb-2 min-h-[2.5rem] sm:min-h-[3rem] flex items-start">
                      Build Competencies
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed min-h-[2.5rem]">
                      Develop skills for your chosen career.
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E8EAF2]/80 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>Stage 2 of 4</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5945E8]/40 group-hover:bg-[#5945E8] transition-colors" />
                  </div>
                </div>

                {/* Stage 3: Prepare */}
                <div className="cai-journey-card group bg-[#F7F8FC] border border-[#E8EAF2] hover:border-[#5945E8]/40 hover:bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(20,33,61,0.03)] hover:shadow-[0_12px_28px_rgba(89,69,232,0.10)] flex flex-col justify-between h-full relative transition-all duration-300">
                  <div>
                    {/* Header: Number Badge + Stage Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#E8EAF2] text-[#5945E8] font-bold text-base flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-[#5945E8] group-hover:text-white group-hover:border-[#5945E8] transition-all duration-300 relative">
                        03
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7868F5] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                        <FileCheck className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#5945E8] mb-1">
                      PREPARE
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#14213D] tracking-tight mb-2 min-h-[2.5rem] sm:min-h-[3rem] flex items-start">
                      Resume &amp; Interviews
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed min-h-[2.5rem]">
                      Build your resume and practice interviews.
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E8EAF2]/80 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>Stage 3 of 4</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5945E8]/40 group-hover:bg-[#5945E8] transition-colors" />
                  </div>
                </div>

                {/* Stage 4: Grow */}
                <div className="cai-journey-card group bg-[#F7F8FC] border border-[#E8EAF2] hover:border-[#5945E8]/40 hover:bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(20,33,61,0.03)] hover:shadow-[0_12px_28px_rgba(89,69,232,0.10)] flex flex-col justify-between h-full relative transition-all duration-300">
                  <div>
                    {/* Header: Number Badge + Stage Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#E8EAF2] text-[#5945E8] font-bold text-base flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-[#5945E8] group-hover:text-white group-hover:border-[#5945E8] transition-all duration-300 relative">
                        04
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7868F5] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#5945E8] mb-1">
                      GROW
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#14213D] tracking-tight mb-2 min-h-[2.5rem] sm:min-h-[3rem] flex items-start">
                      Opportunities &amp; Placement
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed min-h-[2.5rem]">
                      Work towards internships and career opportunities.
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E8EAF2]/80 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>Stage 4 of 4</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5945E8]/40 group-hover:bg-[#5945E8] transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE TIMELINE (< md): Vertical timeline with connecting line on the left & aligned stage numbers */}
            <div className="md:hidden relative">
              {/* Vertical Connecting Line on Left with subtle violet gradient */}
              <div
                aria-hidden="true"
                className="absolute left-5 top-5 bottom-6 w-[2px] bg-gradient-to-b from-[#5945E8]/35 via-[#7868F5]/60 to-[#5945E8]/35 z-0 pointer-events-none"
              />

              <div className="space-y-3.5 relative z-10">
                {/* Mobile Stage 1: Discover */}
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#E8EAF2] text-[#5945E8] font-bold text-sm flex items-center justify-center shadow-xs relative z-10">
                    01
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#7868F5] ring-2 ring-white" />
                  </div>
                  <div className="cai-journey-card group flex-1 bg-[#F7F8FC] border border-[#E8EAF2] hover:border-[#5945E8]/40 hover:bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,33,61,0.03)] hover:shadow-[0_8px_20px_rgba(89,69,232,0.08)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5945E8]">
                        DISCOVER
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-[#5945E8]/10 text-[#5945E8] flex items-center justify-center shadow-2xs">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-[#14213D] tracking-tight mb-0.5">
                      Evaluate &amp; Benchmark
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-2.5">
                      Understand your strengths and career interests.
                    </p>
                    <div className="pt-2 border-t border-[#E8EAF2]/80 text-[10px] font-medium text-slate-500 flex items-center justify-between">
                      <span>Stage 1 of 4</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5945E8]/40" />
                    </div>
                  </div>
                </div>

                {/* Mobile Stage 2: Learn */}
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#E8EAF2] text-[#5945E8] font-bold text-sm flex items-center justify-center shadow-xs relative z-10">
                    02
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#7868F5] ring-2 ring-white" />
                  </div>
                  <div className="cai-journey-card group flex-1 bg-[#F7F8FC] border border-[#E8EAF2] hover:border-[#5945E8]/40 hover:bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,33,61,0.03)] hover:shadow-[0_8px_20px_rgba(89,69,232,0.08)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5945E8]">
                        LEARN
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-2xs">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-[#14213D] tracking-tight mb-0.5">
                      Build Competencies
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-2.5">
                      Develop skills for your chosen career.
                    </p>
                    <div className="pt-2 border-t border-[#E8EAF2]/80 text-[10px] font-medium text-slate-500 flex items-center justify-between">
                      <span>Stage 2 of 4</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5945E8]/40" />
                    </div>
                  </div>
                </div>

                {/* Mobile Stage 3: Prepare */}
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#E8EAF2] text-[#5945E8] font-bold text-sm flex items-center justify-center shadow-xs relative z-10">
                    03
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#7868F5] ring-2 ring-white" />
                  </div>
                  <div className="cai-journey-card group flex-1 bg-[#F7F8FC] border border-[#E8EAF2] hover:border-[#5945E8]/40 hover:bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,33,61,0.03)] hover:shadow-[0_8px_20px_rgba(89,69,232,0.08)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5945E8]">
                        PREPARE
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center shadow-2xs">
                        <FileCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-[#14213D] tracking-tight mb-0.5">
                      Resume &amp; Interviews
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-2.5">
                      Build your resume and practice interviews.
                    </p>
                    <div className="pt-2 border-t border-[#E8EAF2]/80 text-[10px] font-medium text-slate-500 flex items-center justify-between">
                      <span>Stage 3 of 4</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5945E8]/40" />
                    </div>
                  </div>
                </div>

                {/* Mobile Stage 4: Grow */}
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#E8EAF2] text-[#5945E8] font-bold text-sm flex items-center justify-center shadow-xs relative z-10">
                    04
                  </div>
                  <div className="cai-journey-card group flex-1 bg-[#F7F8FC] border border-[#E8EAF2] hover:border-[#5945E8]/40 hover:bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,33,61,0.03)] hover:shadow-[0_8px_20px_rgba(89,69,232,0.08)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5945E8]">
                        GROW
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-2xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-[#14213D] tracking-tight mb-0.5">
                      Opportunities &amp; Placement
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-2.5">
                      Work towards internships and career opportunities.
                    </p>
                    <div className="pt-2 border-t border-[#E8EAF2]/80 text-[10px] font-medium text-slate-500 flex items-center justify-between">
                      <span>Stage 4 of 4</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5945E8]/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. FINAL CALL TO ACTION (Deep Navy & Violet with Decorative Orbitals)
            Responsive heading, compact vertical spacing, touch-friendly CTA buttons
            ========================================================================= */}
        <section className="py-12 sm:py-20 bg-[#14213D] text-white relative overflow-hidden">
          {/* Layered Ambient Lighting & Abstract Decorative Orbital Rings */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[46rem] h-[28rem] bg-gradient-to-tr from-[#5945E8]/35 via-[#7868F5]/25 to-sky-400/15 rounded-full blur-3xl pointer-events-none -z-0"
          />

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="500" cy="300" rx="420" ry="200" stroke="#7868F5" strokeWidth="1.5" strokeDasharray="6 8" />
            <ellipse cx="500" cy="300" rx="320" ry="140" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 6" />
          </svg>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold tracking-wider text-violet-200 uppercase mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span>TAKE THE NEXT STEP</span>
            </div>

            <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3 sm:mb-4 leading-tight">
              Your Future Is Worth Preparing For.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              Start building the skills and confidence to move towards your career goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrimaryCTA}
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-[#5945E8] to-[#7868F5] hover:opacity-95 rounded-xl shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
              >
                <span>Get Started with CareerAI</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors cursor-pointer"
              >
                Preview Placement Hub
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          6. FOOTER — FULL BRANDED MARKETING FOOTER
          Rendered EXCLUSIVELY when current route is exact homepage route '/'
          ========================================================================= */}
      {isExactHome && (
        <Footer onNavigateTab={onNavigate} />
      )}
    </div>
  );
};
