import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { SUBJECTS } from '../../utils/subjects';

export default function InputBar({ onSend, disabled, currentSubject, onSubjectChange }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const canSend = message.trim() && !disabled;

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-shrink-0"
      style={{
        padding: '0 16px 14px',
        background: 'var(--bg-1)',
      }}
    >
      {/* Subject pill row */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span
          className="text-[9px] font-semibold tracking-widest uppercase flex-shrink-0"
          style={{ color: 'var(--text-3)' }}
        >
          Subject
        </span>
        <div className="flex gap-1 flex-wrap">
          {SUBJECTS.map((sub) => {
            const isActive = currentSubject === sub.id;
            return (
              <motion.button
                key={sub.id}
                onClick={() => onSubjectChange(sub.id)}
                whileTap={{ scale: 0.93 }}
                className="tag transition-all duration-150"
                style={{
                  background: isActive ? 'var(--accent-dim)' : 'var(--bg-3)',
                  borderColor: isActive ? 'var(--border-accent)' : 'var(--border-1)',
                  color: isActive ? 'var(--accent-light)' : 'var(--text-3)',
                  cursor: 'pointer',
                }}
              >
                <span className="text-sm leading-none">{sub.emoji}</span>
                <span className="hidden sm:inline">{sub.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main input area */}
      <div
        className="flex items-end gap-2 rounded-xl transition-all duration-200"
        style={{
          background: 'var(--bg-3)',
          border: `1px solid ${disabled ? 'var(--border-1)' : 'var(--border-2)'}`,
          boxShadow: disabled ? 'none' : '0 0 0 1px transparent',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(77,124,255,0.08)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = disabled ? 'var(--border-1)' : 'var(--border-2)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'AI is thinking...' : 'Start typing...'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm outline-none py-3 pl-4 leading-relaxed"
          style={{
            color: 'var(--text-1)',
            minHeight: 44,
            maxHeight: 180,
            fontFamily: 'var(--font-ui)',
            caretColor: 'var(--accent)',
          }}
        />


        {/* Send */}
        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.93 } : {}}
          className="send-btn flex-shrink-0 mr-2 mb-2"
          title="Send message"
        >
          <AnimatePresence mode="wait">
            {disabled
              ? <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 size={15} className="animate-spin" />
                </motion.div>
              : <motion.div key="send" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}>
                  <Send size={15} />
                </motion.div>
            }
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Footer disclaimer */}
      <p
        className="text-[10px] text-center mt-2"
        style={{ color: 'var(--text-4)' }}
      >
        Hif AI may produce inaccurate information. Always verify important answers.&nbsp;
        <span style={{ color: 'var(--accent)', opacity: 0.7 }}>Free forever</span>
      </p>
    </motion.div>
  );
}