import { motion } from 'framer-motion';
import { getSubject } from '../../utils/subjects';

/**
 * SubjectBadge — displays a colored badge for a subject with polished UI/UX
 * size: 'sm' | 'md'
 */
export default function SubjectBadge({ subject = 'General', size = 'sm', onClick, selected }) {
  const sub = getSubject(subject);

  const sizeClasses = size === 'md'
    ? 'px-3 py-1.5 text-sm gap-1.5'
    : 'px-2 py-0.5 text-xs gap-1';

  // Enhanced spring animation for interactive states
  const hoverTapAnimation = onClick ? {
    whileHover: { scale: 1.08, y: -1 },
    whileTap: { scale: 0.92 },
    transition: { type: 'spring', stiffness: 500, damping: 20 }
  } : {};

  return (
    <motion.button
      onClick={onClick}
      className={`
        relative inline-flex items-center rounded-full border font-medium
        transition-all duration-200
        ${sizeClasses}
        ${sub.color}
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-sky-500/20' : 'cursor-default'}
        ${selected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-gray-900' : ''}
      `}
      {...hoverTapAnimation}
    >
      <span className="text-base leading-none">{sub.emoji}</span>
      <span className="font-medium tracking-wide">{sub.label}</span>

      {/* Glow effect on hover (only if interactive) */}
      {onClick && (
        <motion.span
          className="absolute inset-0 rounded-full bg-white opacity-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Pulsing ring when selected */}
      {selected && (
        <motion.span
          className="absolute inset-0 rounded-full ring-2 ring-sky-400"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  );
}