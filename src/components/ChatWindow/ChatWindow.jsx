import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import MessageBubble, { TypingIndicator } from '../MessageBubble/MessageBubble';

export default function ChatWindow({ chat, isLoading, error, onRegenerate }) {
  const bottomRef     = useRef(null);
  const containerRef  = useRef(null);
  const prevLengthRef = useRef(0);

  const messages = chat?.messages || [];

  // Scroll to the TOP of the newest assistant reply;
  // for user messages just keep the typing indicator in view.
  useEffect(() => {
    const prev = prevLengthRef.current;
    const cur  = messages.length;

    if (cur > prev) {
      const latest = messages[cur - 1];
      // Small delay so the DOM has painted the new bubble
      setTimeout(() => {
        if (latest?.role === 'assistant') {
          // Find the last assistant bubble via data attribute — no ref inside AnimatePresence
          const el = containerRef.current?.querySelector('[data-msg-role="assistant"]:last-of-type');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    }

    prevLengthRef.current = cur;
  }, [messages.length]);

  // Keep typing indicator visible while loading
  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 30);
    }
  }, [isLoading]);

  if (!chat) return null;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      style={{ padding: '20px 16px', scrollBehavior: 'smooth' }}
    >
      <div className="max-w-3xl mx-auto space-y-4 pb-4">

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-5xl mb-4 animate-float">💬</div>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              Ask your first question to get started.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
              This chat auto-deletes after 24 hours.
            </p>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isLast          = i === messages.length - 1;
            const isLastAssistant = msg.role === 'assistant' && isLast;
            return (
              <motion.div
                key={msg._id || i}
                data-msg-role={msg.role}
                layout
                initial={false}
              >
                <MessageBubble
                  message={msg}
                  isNew={isLastAssistant}
                  onRegenerate={isLastAssistant ? onRegenerate : undefined}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && <TypingIndicator />}
        </AnimatePresence>

        {/* Regenerate row */}
        <AnimatePresence>
          {!isLoading && messages.length > 0 && onRegenerate && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center pt-2"
            >
              <button className="regen-btn" onClick={onRegenerate}>
                <RotateCcw size={13} /> Regenerate response
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm max-w-md text-center"
                style={{
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  color: 'var(--red)',
                }}
              >
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}