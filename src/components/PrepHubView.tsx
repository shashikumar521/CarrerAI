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
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  Terminal,
  Play,
  RotateCcw,
} from 'lucide-react';

export type PrepCategory = 'Technical' | 'HR' | 'Role-specific' | 'Company-specific';

interface PrepModule {
  id: string;
  category: PrepCategory;
  topicName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  keyConcepts: string[];
  sampleQuestionsCount: number;
}

interface QuestionItem {
  id: string;
  category: 'OS' | 'DBMS' | 'Networks' | 'OOPs' | 'HR' | 'SystemDesign' | 'Frontend' | 'Company';
  question: string;
  answer: string;
  keyTakeaway: string;
}

export const PrepHubView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PrepCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activePracticeModule, setActivePracticeModule] = useState<string | null>('tech-core-os');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    'os-1': true,
    'db-1': true,
  });

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const prepModules: PrepModule[] = [
    // Technical (DSA, System Design, Core CS)
    {
      id: 'tech-dsa',
      category: 'Technical',
      topicName: 'Data Structures & Algorithms Mastery',
      difficulty: 'Intermediate',
      estimatedTime: '60 mins',
      keyConcepts: [
        'Dynamic Programming & Memoization',
        'Graph Traversals (BFS/DFS, Dijkstra)',
        'Sliding Window & Two Pointers',
        'Binary Search on Answer Space',
      ],
      sampleQuestionsCount: 45,
    },
    {
      id: 'tech-sysdesign',
      category: 'Technical',
      topicName: 'System Design & Distributed Scalability',
      difficulty: 'Advanced',
      estimatedTime: '75 mins',
      keyConcepts: [
        'Horizontal vs Vertical Scaling',
        'Distributed Caching (Redis/Memcached)',
        'Database Sharding & Replication',
        'API Rate Limiting & Message Queues',
      ],
      sampleQuestionsCount: 20,
    },
    {
      id: 'tech-core-os',
      category: 'Technical',
      topicName: 'Core CS: Operating Systems & Memory Management',
      difficulty: 'Intermediate',
      estimatedTime: '45 mins',
      keyConcepts: [
        'Process vs Thread Memory Isolation',
        '4 Coffman Deadlock Conditions',
        'Virtual Memory, Paging & Thrashing',
        'CPU Scheduling Algorithms',
      ],
      sampleQuestionsCount: 18,
    },
    {
      id: 'tech-core-db',
      category: 'Technical',
      topicName: 'Core CS: Database Internals & Transactions',
      difficulty: 'Intermediate',
      estimatedTime: '45 mins',
      keyConcepts: [
        'ACID Properties & Crash Recovery',
        'B+ Tree Indexing vs Hash Indexes',
        'SQL Isolation Levels & Concurrency',
        'Database Normalization (1NF to BCNF)',
      ],
      sampleQuestionsCount: 22,
    },
    {
      id: 'tech-core-net',
      category: 'Technical',
      topicName: 'Core CS: Networking & Web Protocols',
      difficulty: 'Intermediate',
      estimatedTime: '40 mins',
      keyConcepts: [
        'TCP 3-Way Handshake & Teardown',
        'DNS Hierarchy & Resolution Path',
        'TLS/SSL Cryptographic Handshake',
        'HTTP/1.1 vs HTTP/2 vs HTTP/3',
      ],
      sampleQuestionsCount: 16,
    },

    // HR / Behavioral (STAR method, culture fit)
    {
      id: 'hr-star',
      category: 'HR',
      topicName: 'STAR Method & Behavioral Storytelling',
      difficulty: 'Beginner',
      estimatedTime: '30 mins',
      keyConcepts: [
        'Structuring Situation, Task, Action & Result',
        'Quantifying Measurable Engineering Impact',
        'Constructive Technical Conflict Resolution',
        'Demonstrating Ownership & Accountability',
      ],
      sampleQuestionsCount: 15,
    },
    {
      id: 'hr-culture',
      category: 'HR',
      topicName: 'Culture Fit & Leadership Principles',
      difficulty: 'Beginner',
      estimatedTime: '35 mins',
      keyConcepts: [
        'Customer Obsession & Bias for Action',
        'Navigating Ambiguous Project Requirements',
        'Learning from Failed Deployments',
        'Giving & Receiving Peer Code Review Feedback',
      ],
      sampleQuestionsCount: 12,
    },

    // Role-specific (Frontend, Backend, AI/ML, DevOps)
    {
      id: 'role-frontend',
      category: 'Role-specific',
      topicName: 'Frontend Engineering: React & Web Performance',
      difficulty: 'Intermediate',
      estimatedTime: '50 mins',
      keyConcepts: [
        'Virtual DOM, Reconciliation & Fiber Tree',
        'React Hooks Dependency Lifecycle',
        'Core Web Vitals (LCP, FID, CLS)',
        'State Management Patterns (Context, Zustand)',
      ],
      sampleQuestionsCount: 25,
    },
    {
      id: 'role-backend',
      category: 'Role-specific',
      topicName: 'Backend Engineering: APIs & Architecture',
      difficulty: 'Intermediate',
      estimatedTime: '55 mins',
      keyConcepts: [
        'RESTful Standards vs GraphQL vs gRPC',
        'Connection Pooling & Connection Leaks',
        'Authentication: JWT vs Session Cookies',
        'Asynchronous Background Workers & Queues',
      ],
      sampleQuestionsCount: 28,
    },
    {
      id: 'role-aiml',
      category: 'Role-specific',
      topicName: 'AI / Machine Learning Engineering',
      difficulty: 'Advanced',
      estimatedTime: '60 mins',
      keyConcepts: [
        'Supervised vs Unsupervised Learning Paradigms',
        'Overfitting, Regularization & Bias-Variance',
        'Transformer Architecture & Attention Mechanisms',
        'Vector Embeddings & RAG Retrieval Pipelines',
      ],
      sampleQuestionsCount: 18,
    },
    {
      id: 'role-devops',
      category: 'Role-specific',
      topicName: 'DevOps & Cloud Engineering',
      difficulty: 'Intermediate',
      estimatedTime: '45 mins',
      keyConcepts: [
        'Docker Layer Caching & Multi-stage Builds',
        'Kubernetes Deployments, Pods & Services',
        'CI/CD Pipeline Design & Security Scanning',
        'Cloud Infrastructure as Code (Terraform)',
      ],
      sampleQuestionsCount: 20,
    },

    // Company-specific (Interview patterns for top recruiters)
    {
      id: 'comp-amazon',
      category: 'Company-specific',
      topicName: 'Amazon SDE: 16 Leadership Principles & OOD',
      difficulty: 'Advanced',
      estimatedTime: '90 mins',
      keyConcepts: [
        '2 Leadership Principles evaluated per round',
        'Object-Oriented Design (Parking Lot, Locker)',
        'Bar Raiser round expectations',
        'Space/Time algorithmic justification',
      ],
      sampleQuestionsCount: 30,
    },
    {
      id: 'comp-google',
      category: 'Company-specific',
      topicName: 'Google SWE: Algorithmic Efficiency & Scale',
      difficulty: 'Advanced',
      estimatedTime: '90 mins',
      keyConcepts: [
        'Optimal complexity solutions (O(N) vs O(N log N))',
        'Edge case coverage and clean modular syntax',
        'Communicating thought process aloud',
        'Handling scale constraints (billions of queries)',
      ],
      sampleQuestionsCount: 25,
    },
    {
      id: 'comp-microsoft',
      category: 'Company-specific',
      topicName: 'Microsoft SWE: Collaborative Engineering',
      difficulty: 'Intermediate',
      estimatedTime: '75 mins',
      keyConcepts: [
        'Refactoring running code & unit test cases',
        'Data structure tradeoffs in practice',
        'Design for accessibility and enterprise scale',
        'Demonstrating growth mindset and curiosity',
      ],
      sampleQuestionsCount: 22,
    },
    {
      id: 'comp-tcs',
      category: 'Company-specific',
      topicName: 'TCS / Mass Recruiter NQT Examination',
      difficulty: 'Beginner',
      estimatedTime: '45 mins',
      keyConcepts: [
        'Numerical ability & logical reasoning',
        'Standard C/C++/Java syntax & output prediction',
        'Pseudo-code tracing questions',
        'Managerial & HR round fit questions',
      ],
      sampleQuestionsCount: 50,
    },
  ];

  const drillQuestions: QuestionItem[] = [
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

  const filteredModules = prepModules.filter((m) => {
    const matchesCat = activeCategory === 'All' || m.category === activeCategory;
    const matchesSearch =
      m.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.keyConcepts.some((kc) => kc.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getDifficultyBadge = (difficulty: 'Beginner' | 'Intermediate' | 'Advanced') => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Advanced':
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2] flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Structured Interview Preparation Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organized modules across Technical, Behavioral, Role-Specific, and Company-Specific interview patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>{prepModules.length} Modules Available</span>
        </div>
      </div>

      {/* Category Navigation Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* 4 Clear Categories as requested */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'All'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Modules ({prepModules.length})
            </button>
            <button
              onClick={() => setActiveCategory('Technical')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'Technical'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Technical (DSA, System Design, Core CS)</span>
            </button>
            <button
              onClick={() => setActiveCategory('HR')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'HR'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>HR / Behavioral (STAR Method)</span>
            </button>
            <button
              onClick={() => setActiveCategory('Role-specific')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'Role-specific'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Role-Specific</span>
            </button>
            <button
              onClick={() => setActiveCategory('Company-specific')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'Company-specific'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company-Specific</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts or topics..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Prep Modules Grid: Topic Name, Difficulty, Estimated Time, Key Concepts, Action Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredModules.map((module) => {
          const isSelectedForPractice = activePracticeModule === module.id;

          return (
            <div
              key={module.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                isSelectedForPractice
                  ? 'border-indigo-400 ring-1 ring-indigo-200'
                  : 'border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Category Badge, Difficulty, Time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {module.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDifficultyBadge(
                        module.difficulty
                      )}`}
                    >
                      {module.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {module.estimatedTime}
                    </span>
                  </div>
                </div>

                {/* Topic Name */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {module.topicName}
                </h3>

                {/* Key Questions / Concepts Covered */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Key Concepts &amp; Questions Covered:
                  </span>
                  <div className="space-y-1">
                    {module.keyConcepts.map((concept, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action button to start practice */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  {module.sampleQuestionsCount} verified drill questions
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setActivePracticeModule(module.id);
                    // scroll to questions drill area smoothly
                    document.getElementById('drill-questions-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Practice</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill Questions Practice Section */}
      <div id="drill-questions-section" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <span>Interactive Drill Question Bank</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Practice answering core questions with interviewer-validated model answers and key takeaways.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto shrink-0">
            {drillQuestions.length} Questions Ready
          </span>
        </div>

        <div className="space-y-3">
          {drillQuestions.map((item) => {
            const isExpanded = expandedQuestions[item.id];
            return (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(item.id)}
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
                        Takeaway: {item.keyTakeaway}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 p-1 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-700 space-y-3 border-t border-slate-100 bg-slate-50/40">
                    <div className="whitespace-pre-line leading-relaxed mt-2 text-slate-800">
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
    </div>
  );
};
