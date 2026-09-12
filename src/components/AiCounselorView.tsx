import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  RotateCcw,
  Check,
  Copy,
  AlertCircle,
  Compass,
  GraduationCap,
  Code2,
  Briefcase,
  BookOpen,
  GitBranch,
  Target,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { EmptyStateBanner } from './EmptyStateBanner';
import { NavTab } from './Navbar';

export interface CounselorMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiCounselorViewProps {
  profile: StudentProfile;
  isProfileEmpty: boolean;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onNavigate: (tab: NavTab) => void;
  onLoadDemo: () => void;
}

export const AiCounselorView: React.FC<AiCounselorViewProps> = ({
  profile,
  isProfileEmpty,
  initialPrompt,
  onClearInitialPrompt,
  onNavigate,
  onLoadDemo,
}) => {
  const [messages, setMessages] = useState<CounselorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Professional suggested prompts mandated by specification
  const suggestedPrompts = [
    'Which career path is best for my skills?',
    'What skills should I improve for placements?',
    'How can I prepare for product-based companies?',
    'What should I learn next?',
    'How can I improve my placement readiness?',
  ];

  // Guidance domain tags mandated by specification
  const guidanceDomains = [
    { label: 'Career paths', icon: Compass },
    { label: 'Placement preparation', icon: GraduationCap },
    { label: 'Skills', icon: Code2 },
    { label: 'Jobs', icon: Briefcase },
    { label: 'Interviews', icon: BookOpen },
    { label: 'Learning roadmap', icon: GitBranch },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt.trim());
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setError(null);
    setLastFailedQuery(null);

    const userMessage: CounselorMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          message: query,
          studentProfile: profile,
          conversationHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || data.response || 'No response generated.';

      const assistantMessage: CounselorMessage = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Counselor communication error:', err);
      setError(err?.message || 'Could not connect to AI Counselor. Please retry.');
      setLastFailedQuery(query);

      // Graceful offline fallback message grounded in student's actual profile
      const cgpa = profile.cgpa ? Number(profile.cgpa) : 0;
      const backlogs = profile.activeBacklogs ? Number(profile.activeBacklogs) : 0;
      const skillsCount = profile.skills?.length || 0;

      let guidanceText = `### Career & Placement Guidance\n\n`;
      if (query.toLowerCase().includes('readiness') || query.toLowerCase().includes('placement')) {
        guidanceText += `Based on standard campus recruitment patterns:\n`;
        guidanceText += `1. **Eligibility Baseline**: Tier-1 product firms typically require a minimum CGPA of 7.0–7.5 with 0 active backlogs.\n`;
        guidanceText += `2. **Technical Preparation**: Target 200+ LeetCode problems (focus on Arrays, Two Pointers, Trees, Dynamic Programming).\n`;
        guidanceText += `3. **Project Portfolio**: Build at least 2 full-stack engineering projects showcasing clean Git commits, unit tests, and production deployments.`;
      } else if (query.toLowerCase().includes('career path') || query.toLowerCase().includes('skills')) {
        guidanceText += `Based on your recorded skills (${skillsCount} skills on profile):\n`;
        guidanceText += `1. **Full-Stack / SDE Path**: Strongest fresher market demand. Pair your programming fundamentals with modern frameworks (React, Node.js/Java/Python) and SQL databases.\n`;
        guidanceText += `2. **Cloud & DevOps**: Learn Docker and AWS/GCP fundamentals to distinguish your candidacy for early-career cloud roles.\n`;
        guidanceText += `3. **Next Steps**: Focus on data structures and system design fundamentals for top product interviews.`;
      } else {
        guidanceText += `Here is targeted guidance for **${query}**:\n`;
        guidanceText += `• **Core Focus**: Strengthen your foundational CS fundamentals (Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks).\n`;
        guidanceText += `• **Practical Application**: Back every skill with a real-world repository or live deployment.\n`;
        guidanceText += `• **Mock Practice**: Regularly simulate technical interview coding rounds under timed constraints.`;
      }

      if (backlogs > 0) {
        guidanceText += `\n\n*Notice: You have ${backlogs} active backlog(s) registered. Prioritize clearance exams early as 80%+ of campus drives mandate 0 backlogs at joining.*`;
      }

      const assistantFallbackMessage: CounselorMessage = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        text: guidanceText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantFallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
    setError(null);
    setLastFailedQuery(null);
  };

  // Helper to format text with bold, bullet points, headers
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1.5">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-indigo-500 font-bold mt-0.5">•</span>
            <span className="flex-1">{renderInlineFormatting(content)}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+\.)\s(.*)$/);
        if (match) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-1">
              <span className="text-indigo-600 font-semibold min-w-[20px]">{match[1]}</span>
              <span className="flex-1">{renderInlineFormatting(match[2])}</span>
            </div>
          );
        }
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="my-0.5">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  const renderInlineFormatting = (str: string) => {
    // Replace **bold** tokens
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Page Heading and Structured Header */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>AI Guidance System</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Your personalized career guidance assistant
              </span>
            </div>

            <h1 className="text-[21px] font-semibold text-slate-900 dark:text-white tracking-normal leading-[1.2] flex items-center gap-2.5">
              <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>AI Career Counselor</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Get personalized guidance for your career, skills, placements, and learning path.
            </p>
          </div>

          {/* Authentic Profile Context Badge */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs w-full sm:w-auto shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white truncate">
                  {profile.name || 'Unassigned Profile'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Profile connected" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {profile.branch || 'B.Tech'} • CGPA: {profile.cgpa ? Number(profile.cgpa).toFixed(2) : '—'} • {profile.skills?.length || 0} skills
              </p>
            </div>
          </div>
        </div>

        {/* Guidance Domains Row */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            Get guidance on:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {guidanceDomains.map((domain) => {
              const Icon = domain.icon;
              return (
                <span
                  key={domain.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{domain.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {isProfileEmpty && (
        <EmptyStateBanner
          onGoToProfile={() => onNavigate('profile')}
          onLoadDemo={onLoadDemo}
          title="Enhance Counselor Accuracy with Profile Data"
          description="CareerAI adapts answers to your authentic CGPA, active backlogs, and technical skillset. Add your records in the Student Profile tab or load sample data for personalized suggestions."
        />
      )}

      {/* ========================================================================= */}
      {/* 2. Clean Conversation Area */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[560px]">
        {/* Thread Header Controls (when messages exist) */}
        {messages.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Active Consultation Thread</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                ({messages.length} message{messages.length === 1 ? '' : 's'})
              </span>
            </div>

            <button
              onClick={handleResetChat}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Start a fresh conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span>New Conversation</span>
            </button>
          </div>
        )}

        {/* Conversation Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/20">
          {/* ========================================================================= */}
          {/* Empty State: "Before the first message" */}
          {/* ========================================================================= */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-8 sm:py-12 max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Bot className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  How can I help with your career?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                  Ask any question about campus placement cutoffs, interview prep, skill roadmaps, or select a suggested starter inquiry below.
                </p>
              </div>

              {/* Professional Suggested Prompts Cards */}
              <div className="w-full space-y-2 text-left pt-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">
                  Suggested inquiries:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestedPrompts.map((promptText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(promptText)}
                      className={`p-3.5 bg-white dark:bg-slate-800 hover:bg-indigo-50/70 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-900 dark:hover:text-white shadow-2xs flex items-center justify-between group cursor-pointer ${
                        idx === 4 ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <span className="pr-2">{promptText}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* Active Messages List */}
          {/* ========================================================================= */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isUser
                      ? 'bg-indigo-600 text-white font-bold text-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {isUser ? (
                    profile.name ? (
                      profile.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-4 h-4" />
                    )
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-3.5 sm:p-5 text-xs sm:text-[13px] leading-relaxed transition-all shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs ml-2 sm:ml-8'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-xs mr-2 sm:mr-8'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                  )}

                  {/* Message Meta Footer */}
                  <div
                    className={`mt-3 pt-2 flex items-center justify-between text-[10px] border-t ${
                      isUser
                        ? 'border-indigo-500/40 text-indigo-200'
                        : 'border-slate-100 dark:border-slate-700/60 text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ========================================================================= */}
          {/* AI Thinking / Loading State */}
          {/* ========================================================================= */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs p-4 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-900 dark:text-white">
                    CareerAI is analyzing your inquiry...
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Evaluating against academic benchmarks, required skills, and top recruiter standards.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* Error State with Retry Button */}
          {/* ========================================================================= */}
          {error && lastFailedQuery && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5 text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Communication Alert:</span>
                  <span>{error}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSend(lastFailedQuery)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-2xs transition-colors self-start sm:self-auto"
              >
                Retry Question
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Follow-Up Prompts Bar (when active conversation) */}
        {messages.length > 0 && (
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Suggested:
            </span>
            {suggestedPrompts.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(promptText)}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {promptText}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. Bottom Input Area: [ Type your career question... ] [ Send ] */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your career question..."
              disabled={loading}
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="min-h-[44px] px-4 sm:px-5 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
