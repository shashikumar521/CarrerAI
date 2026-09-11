import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Database,
  Network,
  Code2,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  category: 'OS' | 'DBMS' | 'Networks' | 'OOPs' | 'HR';
  question: string;
  answer: string;
  keyTakeaway: string;
}

export const PrepHubView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'os-1': true,
    'db-1': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const questions: QuestionItem[] = [
    {
      id: 'os-1',
      category: 'OS',
      question: 'What is the difference between a Process and a Thread?',
      answer:
        'A Process is an executing instance of a program with its own dedicated memory space, address space, and system resources. A Thread is a lightweight execution unit within a process that shares the parent process’s memory space, code section, and open files, but maintains its own program counter, stack, and register state. Context switching between threads is significantly faster than between processes due to shared virtual memory.',
      keyTakeaway: 'Processes have independent memory; threads share memory within the same process.',
    },
    {
      id: 'os-2',
      category: 'OS',
      question: 'Explain the 4 necessary conditions for a Deadlock to occur.',
      answer:
        '1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process holds at least one resource and is waiting to acquire additional resources held by other processes.\n3. No Preemption: Resources cannot be forcibly confiscated; they are released voluntarily.\n4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next.',
      keyTakeaway: 'Breaking any one of these 4 Coffman conditions prevents deadlock entirely.',
    },
    {
      id: 'os-3',
      category: 'OS',
      question: 'What is Virtual Memory and Thrashing?',
      answer:
        'Virtual Memory abstracts physical RAM by using secondary disk storage as paging space, allowing processes to execute even when their memory footprint exceeds physical RAM. Thrashing occurs when the operating system spends more time swapping pages in and out of swap space than executing instructions, resulting in severe CPU performance degradation.',
      keyTakeaway: 'Thrashing is caused by an over-committed working set exceeding physical memory.',
    },
    {
      id: 'db-1',
      category: 'DBMS',
      question: 'Explain ACID properties in relational database transactions.',
      answer:
        '• Atomicity: All operations in a transaction succeed or all fail together (All-or-Nothing).\n• Consistency: Database transitions from one valid state to another, respecting all constraints.\n• Isolation: Concurrent transactions execute without interfering with one another (managed via isolation levels like Read Committed, Repeatable Read, Serializable).\n• Durability: Once committed, state changes survive server crashes or power failures via write-ahead logging (WAL).',
      keyTakeaway: 'Guarantees reliable transaction processing in mission-critical applications.',
    },
    {
      id: 'db-2',
      category: 'DBMS',
      question: 'Why do databases use B+ Trees for indexing instead of Hash tables or Binary Search Trees?',
      answer:
        'B+ Trees have high branching factor (fanout), which drastically reduces tree height and minimizes disk I/O operations. Furthermore, all leaf nodes in a B+ Tree are sequentially linked in a doubly linked list, making range queries (e.g. WHERE age BETWEEN 20 AND 30) extremely efficient (O(log N + K)), whereas hash indexes only support exact equality matches (O(1)).',
      keyTakeaway: 'B+ Trees excel at range scans and minimize disk seeks due to high fanout.',
    },
    {
      id: 'cn-1',
      category: 'Networks',
      question: 'Describe the TCP 3-Way Handshake process.',
      answer:
        '1. SYN: Client chooses initial sequence number X and sends SYN packet to server.\n2. SYN-ACK: Server receives SYN, chooses sequence number Y, acknowledges client with ACK = X + 1, and sends SYN.\n3. ACK: Client receives SYN-ACK and sends ACK = Y + 1 to confirm connection establishment. Connection is now ESTABLISHED for reliable two-way byte streaming.',
      keyTakeaway: 'Ensures synchronized sequence numbers and mutual readiness before data transfer.',
    },
    {
      id: 'cn-2',
      category: 'Networks',
      question: 'What happens when you type https://google.com into your browser?',
      answer:
        '1. Browser checks DNS cache (browser, OS, router, ISP resolver) to resolve domain to an IP address.\n2. Initiates TCP 3-way handshake on port 443 with the target server IP.\n3. Performs TLS/SSL handshake to authenticate the server certificate and establish symmetric encryption keys.\n4. Browser sends HTTP GET request.\n5. Server handles request and returns HTML/CSS/JS payload.\n6. Browser parses DOM, renders CSSOM, and paints pixels.',
      keyTakeaway: 'DNS -> TCP -> TLS -> HTTP GET -> Server Response -> Browser Rendering Engine.',
    },
    {
      id: 'oops-1',
      category: 'OOPs',
      question: 'What is the difference between Compile-time and Runtime Polymorphism?',
      answer:
        'Compile-time (Static) Polymorphism is resolved at compile time via Method Overloading or Operator Overloading, where method signature determines invocation. Runtime (Dynamic) Polymorphism is resolved at execution time via Method Overriding using virtual tables (vtable) and pointers, where the actual object instance type determines which overridden method runs.',
      keyTakeaway: 'Overloading = compile-time resolution; Overriding with virtual functions = runtime resolution.',
    },
    {
      id: 'hr-1',
      category: 'HR',
      question: 'How should you structure answers using the STAR technique?',
      answer:
        '• Situation: Set the scene and context (project, semester, team setting).\n• Task: Clearly define the challenge or goal you were responsible for solving.\n• Action: Detail the specific decisions, tools, and algorithms you engineered (use "I", not "we").\n• Result: Quantify the outcome (e.g., "reduced latency by 30%", "delivered project 2 days ahead of schedule", "awarded 1st place in hackathon").',
      keyTakeaway: 'Anchor your technical leadership and conflict resolution with measurable results.',
    },
    {
      id: 'hr-2',
      category: 'HR',
      question: 'How to handle: "Tell me about a time you faced a technical disagreement or conflict?"',
      answer:
        'Emphasize objective facts and data rather than ego. Explain the two technical approaches (e.g. SQL vs MongoDB, or React vs Next.js), how you benchmarked prototype performance or latency together, listened actively to peer perspectives, and reached an aligned technical consensus that served the project best.',
      keyTakeaway: 'Focus on benchmarking with data, respectful collaboration, and team alignment.',
    },
  ];

  const filtered = questions.filter((q) => {
    const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.keyTakeaway.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'All', label: 'All Subjects', icon: BookOpen },
    { id: 'OS', label: 'Operating Systems', icon: Cpu },
    { id: 'DBMS', label: 'Database Systems', icon: Database },
    { id: 'Networks', label: 'Computer Networks', icon: Network },
    { id: 'OOPs', label: 'OOPs & Architecture', icon: Code2 },
    { id: 'HR', label: 'HR & Behavioral', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2] flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Campus Technical Interview Drill Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            High-frequency core CS interview questions asked by Amazon, Microsoft, Google, TCS, and high-growth engineering teams.
          </p>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts (Deadlock, ACID, TCP, Polymorphism...)"
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question Accordion Cards */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isExpanded = expandedIds[item.id];
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mt-0.5 shrink-0">
                    {item.category}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.question}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      Key Takeaway: {item.keyTakeaway}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 p-1 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-700 space-y-3 border-t border-slate-100 bg-slate-50/40">
                  <div className="whitespace-pre-line leading-relaxed mt-2">
                    {item.answer}
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-2 text-emerald-900 text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Interviewer Tip:</strong> {item.keyTakeaway}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
