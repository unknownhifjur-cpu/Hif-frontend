import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Zap,
  Globe,
  Lock,
  Infinity as InfinityIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SUBJECTS } from "../../utils/subjects";

/* ─── Rotating subtitle lines ───────────────────────────────────────── */
const TAGLINES = [
  { text: "আপনার বন্ধু, আপনার শিক্ষক।", accent: false },
  { text: "Your personal AI tutor.", accent: false },
  {
    text: "Helpful, Intelligent, Friendly — Artificial Instructor 🚀",
    accent: true,
  },
  { text: "Ask anything. Learn everything.", accent: true },
  { text: "বাংলা ও English — দুটোতেই।", accent: false },
  { text: "Free forever. No login needed.", accent: false },
  { text: "Instant answers, day or night. 🌙☀️", accent: true },
  { text: "Study smarter, not harder.", accent: true },
  { text: "Learn. Explore. Repeat. 🔄", accent: true },
  { text: "Knowledge at your fingertips. 💡", accent: true },
];

function RotatingTagline() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % TAGLINES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const line = TAGLINES[idx];

  return (
    <div
      style={{
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="text-sm md:text-base text-center"
          style={{
            color: line.accent ? "var(--accent-light)" : "var(--text-2)",
            fontWeight: line.accent ? 500 : 400,
            fontFamily: "var(--font-ui)",
            margin: 0,
          }}
        >
          {line.text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

const quickQuestions = [
  { text: "Explain quadratic equations step by step", subject: "Math" },
  { text: "What is photosynthesis and how does it work?", subject: "Science" },
  {
    text: "Write a Python function to parse a CSV file",
    subject: "Programming",
  },
  {
    text: "Help me write a paragraph about climate change",
    subject: "English",
  },
];

const features = [
  {
    icon: Zap,
    label: "Instant",
    desc: "Fast responses",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
  },
  {
    icon: Globe,
    label: "Bilingual",
    desc: "বাংলা & English",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
  },
  {
    icon: Lock,
    label: "Private",
    desc: "No login needed",
    color: "#4d7cff",
    bg: "rgba(77,124,255,0.08)",
  },
  {
    icon: InfinityIcon,
    label: "Free",
    desc: "Always free",
    color: "#9f7aea",
    bg: "rgba(159,122,234,0.08)",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};

export default function WelcomeScreen({ onStartChat, onSubjectSelect }) {
  return (
    <motion.div
      className="flex-1 overflow-y-auto flex flex-col items-center"
      style={{ padding: "40px 20px 24px", background: "var(--bg-1)" }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Background glow blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "30%",
            width: 500,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(77,124,255,0.06), transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "20%",
            width: 300,
            height: 300,
            background:
              "radial-gradient(ellipse, rgba(0,212,232,0.04), transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div className="w-full max-w-2xl">
        {/* Logo + Title */}
        <motion.div variants={item} className="text-center mb-10">
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(77,124,255,0.15), rgba(0,212,232,0.1))",
              border: "1px solid var(--border-2)",
              boxShadow: "0 8px 32px rgba(77,124,255,0.2)",
            }}
          >
            <img
              src="/favi-bg.png"
              alt="Hif AI"
              className="w-10 h-10 object-contain"
            />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-bold mb-3 tracking-tight"
            style={{ fontFamily: "var(--font-head)" }}
          >
            <span className="gradient-text">Hif AI</span>
          </h1>

          {/* Animated rotating taglines */}
          <RotatingTagline />
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                whileHover={{ y: -3, scale: 1.02 }}
                className="rounded-xl p-3.5 text-center"
                style={{
                  background: f.bg,
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <Icon
                  className="mx-auto mb-1.5"
                  size={18}
                  style={{ color: f.color }}
                />
                <div
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-1)" }}
                >
                  {f.label}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--text-3)" }}
                >
                  {f.desc}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick questions */}
        <motion.div variants={item} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} style={{ color: "var(--accent-light)" }} />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--text-3)" }}
            >
              Try asking
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickQuestions.map((q, i) => {
              const sub = SUBJECTS.find((s) => s.id === q.subject);
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartChat(q.text, q.subject)}
                  className="group text-left p-3.5 rounded-xl transition-all"
                  style={{
                    background: "var(--bg-3)",
                    border: "1px solid var(--border-1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-accent)";
                    e.currentTarget.style.background = "var(--bg-4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-1)";
                    e.currentTarget.style.background = "var(--bg-3)";
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg mt-0.5">{sub?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium leading-relaxed line-clamp-2 transition-colors"
                        style={{ color: "var(--text-1)" }}
                      >
                        {q.text}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--text-3)" }}
                        >
                          {sub?.label}
                        </span>
                        <ArrowRight
                          size={10}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "var(--accent-light)" }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Subject pills */}
        <motion.div
          variants={item}
          className="flex flex-wrap gap-2 justify-center"
        >
          {SUBJECTS.map((sub) => (
            <motion.button
              key={sub.id}
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onSubjectSelect(sub.id)}
              className="tag transition-all"
              style={{
                background: "var(--bg-3)",
                borderColor: "var(--border-2)",
                color: "var(--text-2)",
                cursor: "pointer",
              }}
            >
              <span>{sub.emoji}</span>
              <span>{sub.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
