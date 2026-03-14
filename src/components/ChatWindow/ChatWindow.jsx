import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble, { TypingIndicator } from '../MessageBubble/MessageBubble';
import SubjectBadge from '../SubjectBadge/SubjectBadge';

export default function ChatWindow({ chat, isLoading, error }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, isLoading]);

  if (!chat) return null;

  const messages = chat.messages || [];

  return (
    <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4 scroll-smooth">
      {/* Header with subject and auto-delete notice */}
      {chat.subject && (
        <div className="flex items-center justify-center sticky top-2 z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 glass rounded-full px-3 py-1.5 shadow-lg"
          >
            <SubjectBadge subject={chat.subject} size="sm" />
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="text-sky-400">⏳</span> Auto-deletes in 24h
            </span>
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="text-6xl mb-4 animate-float">💬</div>
          <p className="text-slate-400 text-sm">Start the conversation! Ask your first question.</p>
        </motion.div>
      )}

      {/* Messages */}
      <AnimatePresence>
        {messages.map((msg, i) => (
          <MessageBubble key={msg._id || i} message={msg} />
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      {isLoading && <TypingIndicator />}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-center"
          >
            <div className="bg-red-900/40 border border-red-500/50 rounded-xl px-4 py-3 text-sm text-red-300 max-w-md text-center backdrop-blur-sm">
              <span className="font-semibold">⚠️ Error: </span>{error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}