import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/* ─── Animation helper ── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('lp-visible')),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Data ── */
const FEATURES = [
  { emoji: '🧠', color: '#4d7cff', bg: 'rgba(77,124,255,0.12)',   title: 'AI-Powered Answers',  desc: 'Ask any question in English or বাংলা and get instant, detailed explanations tailored to your level.' },
  { emoji: '💻', color: '#9f7aea', bg: 'rgba(159,122,234,0.12)', title: 'Code with Confidence', desc: 'Syntax-highlighted code blocks with Python, JS, C++ and more. Copy or download with one click.' },
  { emoji: '🔒', color: '#00d4e8', bg: 'rgba(0,212,232,0.1)',    title: '100% Private',         desc: 'No account. No data collection. Your session lives only in your browser and auto-deletes after 24h.' },
  { emoji: '✨', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   title: 'Free Forever',          desc: 'No premium plan, no credit card, no limits. Hif AI is free for every student, every time.' },
  { emoji: '🌍', color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   title: 'Truly Bilingual',       desc: 'Switch between English and বাংলা mid-conversation. Hif AI understands both naturally.' },
  { emoji: '📚', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', title: 'Multi-Subject',          desc: 'Math, Science, English, Programming, History, Geography and more — all in one place.' },
];

const TOOLS = [
  { emoji: '📝', name: 'Quick Notes' },
  { emoji: '📅', name: 'Study Planner' },
  { emoji: '🍅', name: 'Pomodoro Timer' },
  { emoji: '🎮', name: 'Game Hub' },
  { emoji: '✏️', name: 'Whiteboard' },
  { emoji: '📲', name: 'Install as App' },
];

const STATS = [
  { num: '∞',   label: 'Questions you can ask' },
  { num: '2',   label: 'Languages supported' },
  { num: '6+',  label: 'Built-in study tools' },
  { num: '৳0', label: 'Cost — forever' },
];

const TESTIMONIALS = [
  { quote: 'Hif AI explained quadratic equations better than my textbook. The bilingual support is a lifesaver.', name: 'Raihan Ahmed',   role: 'Class 10 Student, Dhaka',    init: 'রা', color: '#4d7cff', bg: 'rgba(77,124,255,0.15)' },
  { quote: 'The Pomodoro timer and Study Planner changed how I study. I get more done in 2 hours than before.', name: 'Sumaiya Islam',  role: 'HSC Student, Chittagong',    init: 'সু', color: '#9f7aea', bg: 'rgba(159,122,234,0.15)' },
  { quote: 'I write Python now. Hif AI explains every line and helps me debug. It\'s like a tutor available 24/7.', name: 'Tanvir Hassan', role: 'CSE Student, BUET',          init: 'তা', color: '#00d4e8', bg: 'rgba(0,212,232,0.12)' },
];

/* ─── LandingPage ── */
export default function LandingPage({ onEnter }) {
  useReveal();
  const { canInstall, install, isInstalled } = usePWAInstall();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06080f',
      fontFamily: "'DM Sans', sans-serif",
      color: '#c8d0e8',
      overflowX: 'hidden',
      position: 'relative',
    }}>

      {/* ── Inline styles for scroll animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .lp-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .lp-reveal.lp-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .lp-scale {
          opacity: 0;
          transform: scale(0.92);
          transition: opacity 0.45s cubic-bezier(0.34,1.56,0.64,1), transform 0.45s cubic-bezier(0.34,1.56,0.64,1);
        }
        .lp-scale.lp-visible {
          opacity: 1;
          transform: scale(1);
        }
        .lp-grid-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(77,124,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77,124,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: lp-grid 20s linear infinite;
        }
        @keyframes lp-grid { to { background-position: 48px 48px; } }

        .lp-orb {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          filter: blur(80px); opacity: 0.16;
        }
        .lp-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 36px; border-radius: 14px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500;
          background: linear-gradient(135deg, #4d7cff, #3a6ae8);
          color: white; text-decoration: none;
          box-shadow: 0 4px 32px rgba(77,124,255,0.5);
          transition: all 0.2s ease;
        }
        .lp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(77,124,255,0.6); }

        .lp-feat-card {
          background: #0d1120; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 28px; position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .lp-feat-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-4px); }

        .lp-tool-card {
          background: #0d1120; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 24px 16px; text-align: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .lp-tool-card:hover { border-color: rgba(77,124,255,0.3); background: #111628; }

        .lp-chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 15px; border-radius: 100px;
          background: #111628; border: 1px solid rgba(255,255,255,0.07);
          font-size: 13px; color: #8892b0;
        }
        .lp-chip .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        .lp-sec-label {
          font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
          color: #6e97ff; font-weight: 600; text-align: center; margin-bottom: 12px;
        }
        .lp-sec-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 5vw, 46px);
          font-weight: 700; text-align: center; color: #f0f4ff;
          margin-bottom: 48px; letter-spacing: -0.02em; line-height: 1.15;
        }

        .lp-stat-num {
          font-family: 'Syne', sans-serif; font-size: 50px; font-weight: 800;
          letter-spacing: -0.03em; line-height: 1;
          background: linear-gradient(135deg, #6e97ff, #00d4e8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 6px;
        }

        .lp-t-quote { font-size: 28px; color: #6e97ff; font-family: Georgia, serif; line-height: 1; margin-bottom: 14px; }
        .lp-t-text { font-size: 14px; line-height: 1.75; color: #c8d0e8; font-weight: 300; margin-bottom: 20px; font-style: italic; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4a5475; border-radius: 4px; }
      `}</style>

      {/* Bg effects */}
      <div className="lp-grid-bg" />
      <div className="lp-orb" style={{ width: 600, height: 600, background: '#4d7cff', top: -200, left: -100 }} />
      <div className="lp-orb" style={{ width: 500, height: 500, background: '#9f7aea', bottom: -100, right: -100 }} />
      <div className="lp-orb" style={{ width: 300, height: 300, background: '#00d4e8', top: '40%', right: '20%' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px' }}>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            style={{
              width: 88, height: 88, borderRadius: 26, marginBottom: 28,
              background: 'linear-gradient(135deg, rgba(77,124,255,0.2), rgba(0,212,232,0.12))',
              border: '1px solid rgba(77,124,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(77,124,255,0.3)',
            }}
          >
            <img src="/favi-bg.png" alt="Hif AI" style={{ width: 52, height: 52, objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span style="font-size:36px">🤖</span>'; }}
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 16px', borderRadius: 100, marginBottom: 24,
              background: 'rgba(77,124,255,0.1)', border: '1px solid rgba(77,124,255,0.25)',
              fontSize: 12, fontWeight: 500, color: '#6e97ff', letterSpacing: '0.05em',
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4e8', display: 'inline-block' }}
            />
            Free forever · No login needed · Bilingual
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(52px, 10vw, 100px)',
              fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em',
              color: '#f0f4ff', marginBottom: 10,
            }}
          >
            Meet{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6e97ff, #00d4e8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Hif AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 300, color: '#8892b0', marginBottom: 10 }}
          >
            আপনার বন্ধু, আপনার শিক্ষক।
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ fontSize: 16, color: '#4a5475', marginBottom: 48 }}
          >
            Your personal AI tutor — ask anything, learn everything.
          </motion.p>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={onEnter}
            className="lp-cta-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Start Learning — It's Free
          </motion.button>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 44 }}
          >
            {[
              { dot: '#4ade80', text: 'Instant answers' },
              { dot: '#4d7cff', text: 'Code generation' },
              { dot: '#00d4e8', text: 'Study tools' },
              { dot: '#fbbf24', text: 'No signup' },
              { dot: '#f472b6', text: 'বাংলা + English' },
            ].map(c => (
              <div key={c.text} className="lp-chip">
                <span className="dot" style={{ background: c.dot }} />
                {c.text}
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: '80px 24px', maxWidth: 1080, margin: '0 auto' }}>
          <p className="lp-sec-label lp-reveal">Why students love it</p>
          <h2 className="lp-sec-title lp-reveal">Everything you need to learn</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="lp-feat-card lp-reveal"
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, background: f.bg, border: `1px solid ${f.color}33`,
                }}>
                  {f.emoji}
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 600, color: '#f0f4ff', marginBottom: 8 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: '#8892b0', fontWeight: 300 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOOLS ── */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="lp-sec-label lp-reveal">Built-in tools</p>
          <h2 className="lp-sec-title lp-reveal">More than just a chatbot</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, maxWidth: 960, margin: '0 auto' }}>
            {TOOLS.map((t, i) => (
              <div key={t.name} className="lp-tool-card lp-scale lp-reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{t.emoji}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#c8d0e8' }}>{t.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="lp-sec-label lp-reveal">The numbers</p>
          <h2 className="lp-sec-title lp-reveal">Built for students like you</h2>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {STATS.map((s, i) => (
              <div key={s.label} className="lp-reveal" style={{
                transitionDelay: `${i * 0.08}s`,
                textAlign: 'center', padding: '32px 40px',
                background: '#0d1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
                minWidth: 160,
              }}>
                <div className="lp-stat-num">{s.num}</div>
                <div style={{ fontSize: 13, color: '#8892b0', fontWeight: 300 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ padding: '80px 24px' }}>
          <p className="lp-sec-label lp-reveal">What students say</p>
          <h2 className="lp-sec-title lp-reveal">Real feedback</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="lp-reveal" style={{
                transitionDelay: `${i * 0.1}s`,
                background: '#0d1120', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: 28,
              }}>
                <div className="lp-t-quote">"</div>
                <div className="lp-t-text">{t.quote}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 600, flexShrink: 0,
                    background: t.bg, color: t.color,
                    fontFamily: 'Syne, sans-serif',
                  }}>
                    {t.init}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f4ff' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#4a5475', marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
          <div className="lp-reveal" style={{
            maxWidth: 680, width: '100%', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(77,124,255,0.08), rgba(0,212,232,0.06))',
            border: '1px solid rgba(77,124,255,0.2)', borderRadius: 28, padding: '64px 40px',
          }}>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800, color: '#f0f4ff', marginBottom: 14,
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              Start learning today.<br />It's completely free.
            </h2>
            <p style={{ fontSize: 16, color: '#8892b0', fontWeight: 300, marginBottom: 36, lineHeight: 1.6 }}>
              No signup. No credit card. No limits.<br />Just ask your first question.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={onEnter}
                className="lp-cta-btn"
                style={{ fontSize: 16 }}
              >
                Open Hif AI
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </motion.button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          textAlign: 'center', padding: '28px 24px 48px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: 13, color: '#4a5475',
        }}>
          <span style={{ color: '#6e97ff', fontWeight: 600 }}>Hif AI</span>
          {' '}— আপনার বন্ধু, আপনার শিক্ষক &nbsp;·&nbsp;
          Free forever &nbsp;·&nbsp; No login needed &nbsp;·&nbsp;
          Built with ❤️ for students
        </footer>
      </div>

      {/* ── Fixed floating Install button ── */}
      <AnimatePresence>
        {canInstall && !isInstalled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 1.2 }}
            whileHover={{ scale: 1.07, y: -3 }}
            whileTap={{ scale: 0.93 }}
            onClick={install}
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 100,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 22px', borderRadius: 16, border: 'none',
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              background: 'linear-gradient(135deg, #4ade80, #16a34a)',
              color: '#0a1a0f',
              boxShadow: '0 4px 28px rgba(74,222,128,0.45), 0 0 0 1px rgba(74,222,128,0.2)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Install App
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}