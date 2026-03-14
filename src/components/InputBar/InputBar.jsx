import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { SUBJECTS } from '../../utils/subjects';

export default function InputBar({ onSend, disabled, currentSubject, onSubjectChange }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky bottom-0 z-10 flex-shrink-0 border-t border-white/10 bg-gray-900/80 backdrop-blur-xl p-3 md:p-4"
    >
      {/* Subject selector */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs text-gray-400 font-medium tracking-wide flex-shrink-0">
          SUBJECT
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {SUBJECTS.map((sub) => (
            <motion.button
              key={sub.id}
              onClick={() => onSubjectChange(sub.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium
                transition-all duration-200
                ${sub.color}
                ${currentSubject === sub.id
                  ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-gray-900 scale-105 shadow-lg shadow-sky-500/30'
                  : 'opacity-60 hover:opacity-100'
                }
              `}
            >
              <span className="text-sm">{sub.emoji}</span>
              <span className="hidden sm:inline">{sub.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div
        className={`
          flex items-end gap-2 rounded-2xl border transition-all duration-200
          ${disabled
            ? 'border-gray-700 bg-gray-800/50'
            : 'border-sky-500/30 bg-gray-800/90 focus-within:border-sky-400 focus-within:shadow-[0_0_20px_rgba(56,189,248,0.3)]'
          }
        `}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'AI is thinking...' : 'Ask anything...'}
          disabled={disabled}
          rows={1}
          className="
            flex-1 bg-transparent resize-none px-4 py-3 text-sm text-gray-200
            placeholder-gray-500 outline-none min-h-[48px] max-h-[200px]
            disabled:opacity-50 font-light
          "
        />

        <motion.button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          whileHover={!(disabled || !message.trim()) ? { scale: 1.1 } : {}}
          whileTap={!(disabled || !message.trim()) ? { scale: 0.9 } : {}}
          className={`
            flex-shrink-0 m-2 w-9 h-9 rounded-xl flex items-center justify-center
            transition-all duration-200
            ${(disabled || !message.trim())
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/50'
            }
          `}
        >
          <AnimatePresence mode="wait">
            {disabled ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Send className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.5 }}
        className="text-[10px] text-gray-500 text-center mt-2"
      >
        Hif AI can make mistakes. Verify important info.
      </motion.p>
    </motion.div>
  );
}