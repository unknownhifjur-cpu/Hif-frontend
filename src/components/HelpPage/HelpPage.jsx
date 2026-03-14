import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, MessageSquare, BookOpen, Zap,
  Globe, Lock, Trash2, Search, Code, Sparkles,
  ExternalLink, Mail, AlertCircle, CalendarCheck,
  Timer, Gamepad2, PenLine, StickyNote,
} from 'lucide-react';

/* ─── Sections ──────────────────────────────────────────────────────── */
const SECTIONS = [
  {
    id: 'getting-started',
    icon: Zap,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    title: 'Getting Started',
    description: 'Everything you need to know to begin using Hif AI.',
    steps: [
      {
        number: '01',
        title: 'Pick a subject',
        body: 'Select a subject tag (Math, Science, Programming, etc.) from the bottom bar before sending your message. This helps Hif AI tailor its response style to your topic.',
      },
      {
        number: '02',
        title: 'Ask your question',
        body: 'Type anything in the input box and press Enter or the send button. You can ask in English or বাংলা — Hif AI understands both.',
      },
      {
        number: '03',
        title: 'Read & explore the response',
        body: 'Responses can include formatted text, code blocks, tables, and more. Code blocks have a Copy and Download button built in.',
      },
    ],
  },
  {
    id: 'features',
    icon: Sparkles,
    color: '#9f7aea',
    bg: 'rgba(159,122,234,0.08)',
    title: 'Chat Features',
    description: 'What makes Hif AI different.',
    features: [
      { icon: Globe,         label: 'Bilingual',        desc: 'Supports both English and বাংলা in the same conversation.' },
      { icon: Code,          label: 'Code Blocks',       desc: 'Syntax-highlighted code with language tabs, copy, and download.' },
      { icon: Lock,          label: 'No Login Needed',   desc: 'Your session is identified by a browser token — no account required.' },
      { icon: Trash2,        label: 'Auto-Delete',       desc: 'All chats are automatically deleted after 24 hours for your privacy.' },
      { icon: MessageSquare, label: 'Chat History',      desc: 'All conversations from your current session appear in the sidebar.' },
      { icon: BookOpen,      label: 'Multi-Subject',     desc: 'Optimised for Math, Science, English, Programming, History, and more.' },
    ],
  },
  {
    id: 'tools',
    icon: CalendarCheck,
    color: '#4d7cff',
    bg: 'rgba(77,124,255,0.08)',
    title: 'Sidebar Tools',
    description: 'Powerful tools available from the icon rail on the left.',
    tools: [
      {
        icon: StickyNote,
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.1)',
        label: 'Quick Notes',
        desc: 'Create, edit and organise notes with colour labels, tags, and pin support. Everything saved locally in your browser.',
        tips: ['Click any note to edit it', 'Pin important notes to the top', 'Filter by tag or search by keyword', '8 colour themes available'],
      },
      {
        icon: CalendarCheck,
        color: '#4ade80',
        bg: 'rgba(74,222,128,0.1)',
        label: 'Study Planner',
        desc: 'Plan your daily study goals and topics with a streak counter and weekly activity strip.',
        tips: ['Add goals for the day and check them off', 'Tag topics by subject', 'Your streak grows every day you open the planner', 'All data saved locally'],
      },
      {
        icon: Timer,
        color: '#9f7aea',
        bg: 'rgba(159,122,234,0.1)',
        label: 'Pomodoro Timer',
        desc: 'Stay focused with a 25-minute timer, automatic short & long breaks, and a sound alert when each session ends.',
        tips: ['25 min focus → 5 min short break', 'Every 4 sessions → 15 min long break', 'Adjust durations in the ⚙ settings panel', 'Mute the bell with the speaker icon', 'Browser tab title updates while running'],
      },
      {
        icon: Gamepad2,
        color: '#f472b6',
        bg: 'rgba(244,114,182,0.1)',
        label: 'Game Hub',
        desc: 'Four educational games — all built for students. Your best scores are saved locally.',
        tips: [
          '🧮 Math Quiz — 10 timed MCQ questions, 4 operations',
          '🔤 Word Scramble — unscramble 8 subject words',
          '🃏 Memory Match — flip 16 cards to find 8 pairs',
          '✅ True or False — 10 rapid-fire facts, 8 seconds each',
        ],
      },
      {
        icon: PenLine,
        color: '#00d4e8',
        bg: 'rgba(0,212,232,0.1)',
        label: 'Whiteboard',
        desc: 'A full drawing canvas for sketching diagrams, equations, and notes.',
        tips: [
          'Tools: Pen, Eraser, Line, Rectangle, Ellipse, Text',
          'Keyboard shortcuts: P E L R O T',
          'Ctrl+Z to undo (up to 30 steps)',
          'Download your drawing as a PNG',
          'Toggle dark / light background',
        ],
      },
    ],
  },
  {
    id: 'faq',
    icon: AlertCircle,
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    title: 'FAQ',
  },
];

const FAQS = [
  { q: 'Is Hif AI completely free?',                         a: 'Yes — Hif AI is free forever. There are no hidden charges, premium tiers, or usage limits.' },
  { q: 'Do I need to create an account?',                    a: 'No. Hif AI uses a private session token stored in your browser. Your chats are linked to that token without any login.' },
  { q: 'How long are my chats stored?',                      a: 'Chats are automatically deleted after 24 hours. You can also manually delete any chat by hovering over it in the sidebar and clicking the trash icon.' },
  { q: 'Can I ask in Bengali (বাংলা)?',                     a: 'Absolutely. Hif AI is bilingual. You can write your question in বাংলা, English, or a mix of both and it will respond appropriately.' },
  { q: 'Why did the AI give a wrong answer?',                a: 'AI can make mistakes, especially on complex or ambiguous questions. Always verify important information from authoritative sources. You can use the Regenerate button to try again.' },
  { q: 'Can I copy the AI\'s code?',                         a: 'Yes. Every code block has a Copy button in the top-right corner and a Download button in the action bar below it.' },
  { q: 'What subjects does Hif AI support?',                 a: 'Math, Science, English, Programming, History, Bengali, and General topics. Select the right subject tag before sending for a better response.' },
  { q: 'Are my Quick Notes and Study Planner data private?', a: 'Yes. All data from Quick Notes, Study Planner, Pomodoro Timer, and Game Hub scores are stored only in your browser\'s localStorage. Nothing is sent to any server.' },
  { q: 'How do I switch between dark and light mode?',       a: 'Click the Moon/Sun icon at the bottom of the left icon rail to toggle between dark and light themes.' },
  { q: 'How do I use the Whiteboard?',                       a: 'Click the ✏ icon in the sidebar. Use keyboard shortcuts P (pen), E (eraser), L (line), R (rect), O (ellipse), T (text). Press Ctrl+Z to undo and use the Download button to save as PNG.' },
  { q: 'The page is not loading / something broke.',         a: 'Try refreshing the page. If the problem persists, clear your browser cache or contact support.' },
];

/* ─── FAQ Item ───────────────────────────────────────────────────────── */
function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.28 }}
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border-1)', background: 'var(--bg-3)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        style={{ background: open ? 'var(--bg-4)' : 'transparent' }}
      >
        <span className="text-sm font-medium" style={{ color: open ? 'var(--text-0)' : 'var(--text-1)' }}>
          {item.q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={15} style={{ color: 'var(--text-3)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="px-5 pb-4 pt-3 text-sm leading-relaxed"
              style={{ color: 'var(--text-2)', borderTop: '1px solid var(--border-0)' }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Tool Card ─────────────────────────────────────────────────────── */
function ToolCard({ tool, index }) {
  const Icon = tool.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.32 }}
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: tool.bg, border: `1px solid ${tool.color}30` }}
        >
          <Icon size={17} style={{ color: tool.color }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-0)', fontFamily: 'var(--font-head)' }}>
            {tool.label}
          </p>
          <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-2)' }}>
            {tool.desc}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-1 pl-1">
        {tool.tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
            <span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full" style={{ background: tool.color }} />
            {tip}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ─── HelpPage ───────────────────────────────────────────────────────── */
export default function HelpPage({ onClose }) {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [faqSearch,     setFaqSearch]     = useState('');

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <motion.div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--bg-1)', padding: '28px 20px 40px' }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(77,124,255,0.15), rgba(0,212,232,0.1))', border: '1px solid var(--border-2)' }}
              >
                <img src="/favi-bg.png" alt="Hif AI" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
                  Help Center
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>Hif AI · Student Tutor</p>
              </div>
            </div>
            <motion.button onClick={onClose} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="icon-btn">
              <X size={17} />
            </motion.button>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Welcome to the Hif AI Help Center. Find answers, learn how to use all features,
            and get the most out of your AI tutor.
          </p>
        </motion.div>

        {/* ── Section Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 flex-wrap"
        >
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <motion.button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                style={{
                  background: isActive ? s.bg : 'var(--bg-3)',
                  border: `1px solid ${isActive ? s.color + '50' : 'var(--border-1)'}`,
                  color: isActive ? s.color : 'var(--text-2)',
                }}
              >
                <Icon size={13} />
                {s.title}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Section Content ── */}
        <AnimatePresence mode="wait">

          {/* Getting Started */}
          {activeSection === 'getting-started' && (
            <motion.div key="gs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>{SECTIONS[0].description}</p>
              <div className="flex flex-col gap-3 mb-4">
                {SECTIONS[0].steps.map((step, i) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-4 p-4 rounded-xl"
                    style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', fontFamily: 'var(--font-head)' }}
                    >
                      {step.number}
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-0)' }}>{step.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{step.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Keyboard tip */}
              <div className="flex gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(77,124,255,0.06)', border: '1px solid rgba(77,124,255,0.2)' }}
              >
                <Zap size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-light)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  <strong style={{ color: 'var(--accent-light)' }}>Pro tip:</strong> Press{' '}
                  <kbd className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{ background: 'var(--bg-5)', border: '1px solid var(--border-2)', color: 'var(--text-1)' }}>Enter</kbd>
                  {' '}to send and{' '}
                  <kbd className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{ background: 'var(--bg-5)', border: '1px solid var(--border-2)', color: 'var(--text-1)' }}>Shift + Enter</kbd>
                  {' '}for a new line.
                </p>
              </div>
            </motion.div>
          )}

          {/* Chat Features */}
          {activeSection === 'features' && (
            <motion.div key="feat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>{SECTIONS[1].description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SECTIONS[1].features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex gap-3 p-4 rounded-xl"
                      style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(159,122,234,0.1)', border: '1px solid rgba(159,122,234,0.2)' }}
                      >
                        <Icon size={15} style={{ color: '#9f7aea' }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-0)' }}>{f.label}</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Sidebar Tools */}
          {activeSection === 'tools' && (
            <motion.div key="tools" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>{SECTIONS[2].description}</p>
              <div className="flex flex-col gap-3">
                {SECTIONS[2].tools.map((tool, i) => (
                  <ToolCard key={tool.label} tool={tool} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* FAQ */}
          {activeSection === 'faq' && (
            <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}
              >
                <Search size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={e => setFaqSearch(e.target.value)}
                  placeholder="Search questions…"
                  className="bg-transparent text-xs outline-none w-full"
                  style={{ color: 'var(--text-1)', fontFamily: 'var(--font-ui)' }}
                />
                {faqSearch && (
                  <button onClick={() => setFaqSearch('')} style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>
                  No results for "{faqSearch}"
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredFaqs.map((faq, i) => <FaqItem key={i} item={faq} index={i} />)}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Contact Footer ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-10 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Still need help?</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Reach out and we'll get back to you.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href="mailto:unknownhifjur@gmail.com" className="action-btn" style={{ textDecoration: 'none' }}>
              <Mail size={12} /> Email Support
            </a>
            <a href="https://heartlock.vercel.app" target="_blank" rel="noopener noreferrer" className="action-btn" style={{ textDecoration: 'none' }}>
              <ExternalLink size={12} /> Visit Website
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}