import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import CodeBlock from '../CodeBlock/CodeBlock';
import { formatRelativeTime } from '../../utils/subjects';

/* ─────────────────────────────────────────────────────────────────────
   Animated markdown: each block element (p, li, h1-3, code) fades in
   with a stagger so the response feels progressive.
───────────────────────────────────────────────────────────────────── */
function AnimatedMarkdown({ content, isNew }) {
  const blockIndex = useRef(0);
  blockIndex.current = 0;

  function nextDelay() {
    const d = blockIndex.current * 0.07;
    blockIndex.current++;
    return d;
  }

  const components = {
    p({ children }) {
      const d = nextDelay();
      return (
        <motion.p
          initial={isNew ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: d, ease: [0.23, 1, 0.32, 1] }}
          style={{ marginBottom: '10px' }}
        >
          {children}
        </motion.p>
      );
    },
    li({ children }) {
      const d = nextDelay();
      return (
        <motion.li
          initial={isNew ? { opacity: 0, x: -8 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: d, ease: 'easeOut' }}
        >
          {children}
        </motion.li>
      );
    },
    h1({ children }) {
      const d = nextDelay();
      return (
        <motion.h1
          initial={isNew ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: d }}
        >
          {children}
        </motion.h1>
      );
    },
    h2({ children }) {
      const d = nextDelay();
      return (
        <motion.h2
          initial={isNew ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: d }}
        >
          {children}
        </motion.h2>
      );
    },
    h3({ children }) {
      const d = nextDelay();
      return (
        <motion.h3
          initial={isNew ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: d }}
        >
          {children}
        </motion.h3>
      );
    },
    code({ node, inline, className, children, ...props }) {
      const lang = /language-(\w+)/.exec(className || '')?.[1] || '';
      const code = String(children).replace(/\n$/, '');
      if (!inline && (lang || code.includes('\n'))) {
        const d = nextDelay();
        return (
          <motion.div
            initial={isNew ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: d, ease: [0.23, 1, 0.32, 1] }}
          >
            <CodeBlock code={code} language={lang} />
          </motion.div>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
  };

  return (
    <div className="msg-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   User Bubble — slides in from the right
───────────────────────────────────────────────────────────────────── */
function UserBubble({ message }) {
  const time = formatRelativeTime(message.createdAt || new Date());
  return (
    <div className="flex justify-end gap-2.5 user-msg-in">
      <div className="flex flex-col items-end gap-1 max-w-[75%] md:max-w-[65%]">
        <div
          className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-light leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, #2d4fd4, #1e3fa8)',
            color: '#e8eeff',
            boxShadow: '0 2px 16px rgba(45,79,212,0.35)',
            border: '1px solid rgba(100,130,255,0.25)',
          }}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[10px]"
          style={{ color: 'var(--text-3)' }}
        >
          {time}
        </motion.span>
      </div>
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
        style={{
          background: 'linear-gradient(135deg, #2d4fd4, #1e3fa8)',
          boxShadow: '0 2px 8px rgba(45,79,212,0.4)',
        }}
      >
        <User className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Assistant Bubble — slides in from the left, card glows on arrival,
   content blocks stagger in progressively.
───────────────────────────────────────────────────────────────────── */
function AssistantBubble({ message, isNew }) {
  const time = formatRelativeTime(message.createdAt || new Date());

  return (
    <div className="flex gap-2.5 ai-msg-in">
      {/* Avatar — logo image */}
      <motion.div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 overflow-hidden"
        initial={isNew ? { scale: 0.5, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 20, delay: 0.04 }}
        style={{
          background: 'linear-gradient(135deg, #1a1f35, #0d1120)',
          boxShadow: '0 2px 10px rgba(125,76,212,0.4)',
          border: '1px solid var(--border-2)',
        }}
      >
        <img src="/favi-bg.png" alt="Hif AI" className="w-5 h-5 object-contain" />
      </motion.div>

      <div className="flex-1 min-w-0 max-w-[88%] md:max-w-[80%]">
        {/* Message card — fades+slides in, then accent-glow border briefly */}
        <motion.div
          className={`rounded-2xl rounded-tl-sm px-5 py-4 ${isNew ? 'card-arrive' : ''}`}
          initial={isNew ? { opacity: 0, y: 12, scale: 0.97 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
          style={{
            background: 'var(--bg-3)',
            border: '1px solid var(--border-1)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <AnimatedMarkdown content={message.content} isNew={isNew} />
        </motion.div>

        {/* Timestamp fades in after content settles */}
        <motion.div
          className="mt-1.5 ml-1"
          initial={isNew ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: isNew ? 0.55 : 0 }}
        >
          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{time}</span>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Typing / Thinking Indicator
   • Orbiting-glow sparkle avatar
   • Horizontal scan line sweeping across the card
   • Cycling status labels (AnimatePresence swap)
   • Three animated dots
───────────────────────────────────────────────────────────────────── */
const THINKING_LABELS = [
  'Thinking…',
  'Analysing your question…',
  'Searching knowledge…',
  'Crafting response…',
  'Almost there…',
];

export function TypingIndicator() {
  const [labelIdx, setLabelIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setLabelIdx(i => (i + 1) % THINKING_LABELS.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className="flex gap-2.5"
    >
      {/* Logo avatar with orbit glow */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 overflow-hidden avatar-thinking"
        style={{
          background: 'linear-gradient(135deg, #1a1f35, #0d1120)',
          border: '1px solid var(--border-2)',
        }}
      >
        <motion.img
          src="/favi-bg.png"
          alt="Hif AI"
          className="w-5 h-5 object-contain"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Thinking card with scan line */}
      <div
        className="relative overflow-hidden rounded-2xl rounded-tl-sm px-5 py-3.5 thinking-card"
        style={{
          background: 'var(--bg-3)',
          border: '1px solid rgba(77,124,255,0.2)',
          minWidth: 210,
        }}
      >
        {/* Sweep scan line */}
        <div className="scan-line" />

        <div className="flex items-center gap-3 relative z-10">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>

          {/* Cycling label */}
          <AnimatePresence mode="wait">
            <motion.span
              key={labelIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
              className="text-xs select-none"
              style={{ color: 'var(--text-3)', fontFamily: 'var(--font-ui)' }}
            >
              {THINKING_LABELS[labelIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main Export
   Pass isNew=true for the last assistant message so animations fire.
───────────────────────────────────────────────────────────────────── */
export default function MessageBubble({ message, isNew }) {
  if (message.role === 'user') return <UserBubble message={message} />;
  return <AssistantBubble message={message} isNew={isNew} />;
}