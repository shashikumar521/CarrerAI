import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { EmptyStateBanner } from './EmptyStateBanner';
import { NavTab } from './Navbar';

interface Message {
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am your AI Placement & Career Counselor. I analyze your authentic academic metrics, technical skills, and target companies to provide realistic, battle-tested advice for campus placements and off-campus recruitment drives.\n\n${
        isProfileEmpty
          ? 'Notice: Your profile is currently empty. You can still ask me general placement questions, or update your profile so I can tailor advice to your exact CGPA and skillset!'
          : `I see your profile (${profile.branch || 'Engineering'}, CGPA: ${profile.cgpa || 'N/A'}, ${profile.skills?.length || 0} skills, ${profile.activeBacklogs || 0} backlogs). What would you like to strategize today?`
      }`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How do I crack SDE-1 at Amazon with my current CGPA?',
    'I have backlogs/low CGPA. How can I still get placed in high-growth companies?',
    'What engineering project should I build to impress Tier-1 recruiters?',
    'Generate a 30-day DSA and Core CS study schedule for placements.',
    'Review my profile and identify my single biggest placement risk.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
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
          message: query,
          studentProfile: profile,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'No response generated.';

      const assistantMessage: Message = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Counselor error:', err);
      // Helpful fallback in case API key is not configured or network error
      const fallbackReply = `I encountered a communication delay with the server. Here is guidance based on placement patterns:
- If target is Product Tier-1 (Google, Microsoft, Amazon): Target 250+ LeetCode problems (emphasis on Arrays, Graphs, DP) and ensure your CGPA remains >= 7.5.
- If target is High-Growth Startups: Build 2 production-grade projects demonstrating database query optimization and API security.
- If you have backlogs: Prioritize upcoming clearing exams; meanwhile build open source contributions to qualify for off-campus opportunities.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2] flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-indigo-600" />
            <span>AI Placement Counselor &amp; Career Mentor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded in your real profile metrics. Provides objective advice on company preparation, off-campus referrals, and backlog recovery.
          </p>
        </div>

        {/* Profile Context Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-700">
            {isProfileEmpty ? 'Context: Empty Profile' : `Context: ${profile.name || 'Student'} (${profile.branch || 'B.Tech'})`}
          </span>
        </div>
      </div>

      {isProfileEmpty && (
        <EmptyStateBanner
          onGoToProfile={() => onNavigate('profile')}
          onLoadDemo={onLoadDemo}
          title="Personalized Insights are Enhanced with Profile Details"
          description="The AI Counselor uses your CGPA, active backlogs, technical stack, and target roles to provide highly customized advice. You can still ask questions below or enter your profile for tailored responses."
        />
      )}

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[600px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-indigo-600 shadow-2xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs whitespace-pre-line'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-indigo-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Analyzing student profile & generating placement strategy...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Try:</span>
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 whitespace-nowrap transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about placement cutoffs, interview rounds, resume advice, or DSA roadmaps..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
