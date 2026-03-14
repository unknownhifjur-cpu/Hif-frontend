import { useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { SUBJECTS } from '../../utils/subjects';

export default function InputBar({ onSend, disabled, currentSubject, onSubjectChange }) {
  const [message,  setMessage]  = useState('');
  const [focused,  setFocused]  = useState(false);
  const [justSent, setJustSent] = useState(false);
  const textareaRef = useRef(null);

  const canSend   = !!message.trim() && !disabled;
  const isTyping  = message.length > 0 && !disabled;

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    // Brief "sent" flash on the button
    setJustSent(true);
    setTimeout(() => setJustSent(false), 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'; }
  };

  /* Border glow intensity — stronger when typing, subtle when just focused */
  const borderColor = disabled
    ? 'var(--border-1)'
    : isTyping
      ? 'var(--accent)'
      : focused
        ? 'var(--border-accent)'
        : 'var(--border-2)';

  const boxShadow = disabled
    ? 'none'
    : isTyping
      ? '0 0 0 3px rgba(77,124,255,0.13), 0 2px 16px rgba(77,124,255,0.1)'
      : focused
        ? '0 0 0 3px rgba(77,124,255,0.08)'
        : 'none';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="flex-shrink-0"
      style={{ padding: '0 16px 14px', background: 'var(--bg-1)' }}
    >

      {/* ── Subject pill row — stagger on mount ── */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[9px] font-semibold tracking-widest uppercase flex-shrink-0"
          style={{ color: 'var(--text-3)' }}
        >
          Subject
        </motion.span>

        <div className="flex gap-1 flex-wrap">
          {SUBJECTS.map((sub, i) => {
            const isActive = currentSubject === sub.id;
            return (
              <motion.button
                key={sub.id}
                onClick={() => onSubjectChange(sub.id)}
                /* Stagger in on mount */
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.05 + i * 0.05,
                  type: 'spring',
                  stiffness: 400,
                  damping: 22,
                }}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.9 }}
                className="tag"
                style={{
                  background:   isActive ? 'var(--accent-dim)'    : 'var(--bg-3)',
                  borderColor:  isActive ? 'var(--border-accent)'  : 'var(--border-1)',
                  color:        isActive ? 'var(--accent-light)'   : 'var(--text-3)',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                }}
              >
                {/* Emoji bounces when this subject becomes active */}
                <motion.span
                  animate={isActive ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm leading-none"
                >
                  {sub.emoji}
                </motion.span>
                <span className="hidden sm:inline">{sub.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Input box ── */}
      <motion.div
        animate={{
          borderColor,
          boxShadow,
        }}
        transition={{ duration: 0.2 }}
        className="flex items-end gap-2 rounded-xl"
        style={{
          background: 'var(--bg-3)',
          border: `1px solid ${borderColor}`,
          boxShadow,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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

        {/* Character hint — fades in while typing */}
        <AnimatePresence>
          {isTyping && (
            <motion.span
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] mb-3 flex-shrink-0"
              style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}
            >
              {message.length}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          /* Pop in when canSend becomes true */
          animate={
            justSent
              ? { scale: [1, 1.35, 0.9, 1], rotate: [0, -12, 6, 0] }
              : canSend
                ? { scale: 1 }
                : { scale: 0.88, opacity: 0.5 }
          }
          whileHover={canSend ? { scale: 1.1 } : {}}
          whileTap={canSend ? { scale: 0.88 } : {}}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className="send-btn flex-shrink-0 mr-2 mb-2"
          title="Send message"
        >
          <AnimatePresence mode="wait">
            {disabled ? (
              <motion.div
                key="spin"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <Loader2 size={15} className="animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                <Send size={15} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Footer disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[10px] text-center mt-2"
        style={{ color: 'var(--text-4)' }}
      >
       Hif AI can make mistakes. Verify anything important!&nbsp;
        <span style={{ color: 'var(--accent)', opacity: 0.7 }}>Free forever</span>
      </motion.p>
    </motion.div>
  );
}