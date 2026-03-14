import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import SubjectBadge from '../SubjectBadge/SubjectBadge';
import { formatRelativeTime } from '../../utils/subjects';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const time = formatRelativeTime(message.createdAt || new Date());

  const bubbleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } },
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          shadow-lg
          ${
            isUser
              ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white'
              : 'bg-gradient-to-br from-violet-600 to-sky-600 text-white'
          }
        `}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble container */}
      <div
        className={`
          max-w-[80%] md:max-w-[70%] flex flex-col gap-1
          ${isUser ? 'items-end' : 'items-start'}
        `}
      >
        {isUser && message.subject && message.subject !== 'General' && (
          <SubjectBadge subject={message.subject} size="sm" />
        )}

        <div
          className={`
            rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg
            ${
              isUser
                ? 'bg-gradient-to-br from-sky-600 to-indigo-700 text-white rounded-tr-sm'
                : 'glass text-gray-200 rounded-tl-sm'
            }
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap font-light">{message.content}</p>
          ) : (
            <div className="message-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-[10px] text-gray-500"
        >
          {time}
        </motion.span>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-sky-600 flex items-center justify-center shadow-lg">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </motion.div>
  );
}