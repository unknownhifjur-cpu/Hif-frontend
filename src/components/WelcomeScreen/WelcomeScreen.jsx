import { motion } from 'framer-motion';
import { Zap, Globe, Lock, Infinity, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import { SUBJECTS } from '../../utils/subjects';

export default function WelcomeScreen({ onStartChat, onSubjectSelect }) {
  const quickQuestions = [
    { text: 'Explain quadratic equations step by step', subject: 'Math' },
    { text: 'What is photosynthesis?', subject: 'Science' },
    { text: 'How do I write a Python for loop?', subject: 'Programming' },
    { text: 'Help me write a paragraph about climate change', subject: 'English' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
  };

  return (
    <motion.div
      className="flex flex-col items-center px-4 py-8 md:py-12 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 min-h-full overflow-y-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Logo & Title */}
      <motion.div variants={itemVariants} className="text-center mb-8 md:mb-12 pt-4 md:pt-0">
        <motion.div
  animate={{ y: [0, -8, 0] }}
  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
  className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 cursor-pointer"
  whileHover={{ scale: 1.1, rotate: 5 }}
  whileTap={{ scale: 0.95 }}
>
  <img
    src="/favi-bg.png"
    alt="Hif AI"
    className="w-full h-full object-contain drop-shadow-2xl"
  />
</motion.div>
        <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-2">
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Hif AI
          </span>
        </motion.h1>
        <motion.p variants={itemVariants} className="text-gray-400 text-sm md:text-lg max-w-md mx-auto">
          আপনার বন্ধু, আপনার শিক্ষক।<br />
          <span className="text-gray-300 font-light">Your personal AI tutor — ask anything!</span>
        </motion.p>
      </motion.div>

      {/* Features row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 md:mb-12 w-full max-w-2xl"
      >
        {[
          { icon: Zap, label: 'Instant', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { icon: Globe, label: 'Bilingual', color: 'text-green-400', bg: 'bg-green-400/10' },
          { icon: Lock, label: 'Private', color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { icon: Infinity, label: 'Free', color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.label}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`${feature.bg} backdrop-blur-sm border border-white/5 rounded-xl p-3 text-center group transition-all duration-300 hover:border-white/20`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${feature.color} group-hover:scale-125 transition-transform duration-300`} />
              <div className="text-xs font-medium text-gray-300">{feature.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick start questions */}
      <motion.div variants={itemVariants} className="w-full max-w-2xl">
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 mb-4 text-gray-400"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
          </motion.div>
          <span className="text-xs font-medium uppercase tracking-wider">Try asking</span>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickQuestions.map((q, i) => {
            const subject = SUBJECTS.find(s => s.id === q.subject);
            return (
              <motion.button
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartChat(q.text, q.subject)}
                className="bg-gray-800/40 backdrop-blur-sm border border-white/5 rounded-xl p-3 text-left hover:border-sky-500/40 hover:bg-gray-800/60 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{subject?.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-200 group-hover:text-sky-300 transition-colors line-clamp-2">
                      {q.text}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                      {subject?.label}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Subject pills */}
      <motion.div
        variants={itemVariants}
        className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg"
      >
        {SUBJECTS.map((sub) => (
          <motion.button
            key={sub.id}
            variants={itemVariants}
            whileHover={{ scale: 1.1, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSubjectSelect(sub.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-sm ${sub.color} hover:shadow-md hover:border-white/20`}
          >
            <span>{sub.emoji}</span>
            <span>{sub.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}