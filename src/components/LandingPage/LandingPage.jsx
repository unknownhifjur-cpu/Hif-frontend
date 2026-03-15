import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/* ─── Typewriter hook ── */
const TYPEWRITER_LINES = [
  'Ask anything. Learn everything.',
  'আপনার যেকোনো প্রশ্নের উত্তর পান।',
  'Debug your code instantly.',
  'Ace your exams with AI.',
  'Study smarter, not harder.',
  'বাংলায় কথা বলুন, ইংরেজিতেও।',
  'Your free tutor, 24/7.',
];

function useTypewriter() {
  const [lineIdx,  setLineIdx]  = useState(0);
  const [charIdx,  setCharIdx]  = useState(0);
  const [deleting, setDeleting] = useState(false);

  const current = TYPEWRITER_LINES[lineIdx];

  useEffect(() => {
    let t;
    if (!deleting && charIdx < current.length) {
      t = setTimeout(() => setCharIdx(c => c + 1), 45);
    } else if (!deleting && charIdx === current.length) {
      t = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIdx > 0) {
      t = setTimeout(() => setCharIdx(c => c - 1), 22);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setLineIdx(i => (i + 1) % TYPEWRITER_LINES.length);
    }
    return () => clearTimeout(t);
  }, [charIdx, deleting, current]);

  return current.slice(0, charIdx);
}

/* ─── FAQs ── */
const FAQS = [
  { q: 'Is Hif AI really free?',                     a: 'Yes — 100% free forever. No premium plan, no credit card, no hidden limits.' },
  { q: 'Do I need to create an account?',             a: 'No. Hif AI uses a session token stored in your browser. Just open and start asking.' },
  { q: 'Can I use it in Bengali (বাংলা)?',           a: 'Absolutely. Write in বাংলা, English, or mix both — Hif AI responds naturally in either.' },
  { q: 'How long are my chats saved?',                a: 'Chats auto-delete after 24 hours for privacy. Your notes, planner & game scores are kept locally.' },
  { q: 'What built-in tools are included?',           a: 'Quick Notes, Study Planner, Pomodoro Timer, Game Hub, and a full drawing Whiteboard.' },
  { q: 'Can I install it as an app on my phone?',     a: 'Yes! Click the green Install App button. It works on Android (Chrome) and desktop (Chrome/Edge). No app store needed.' },
  { q: 'Does it support coding questions?',           a: 'Yes. Code blocks are syntax-highlighted with copy and download buttons. Supports Python, JS, C++, Java and more.' },
];

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

/* ─── Tool previews ── */
const TOOLS = [
  { emoji: '📝', name: 'Quick Notes',    color: '#fbbf24', preview: 'Create colour-tagged notes with pin, search & tag filters. All saved locally.' },
  { emoji: '📅', name: 'Study Planner',  color: '#4ade80', preview: 'Set daily goals, track topics by subject & keep a study streak alive.' },
  { emoji: '🍅', name: 'Pomodoro Timer', color: '#9f7aea', preview: '25 min focus → 5 min break. Auto long-break every 4 sessions. Sound alerts.' },
  { emoji: '🎮', name: 'Game Hub',       color: '#f472b6', preview: 'Math Quiz, Word Scramble, Memory Match & True or False. Scores saved.' },
  { emoji: '✏️', name: 'Whiteboard',     color: '#00d4e8', preview: 'Draw, write equations & sketch diagrams. Download as PNG. Full undo history.' },
  { emoji: '📲', name: 'Install as App', color: '#4d7cff', preview: 'Add to Home Screen on Android & desktop. Works offline. No app store needed.' },
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
  const [installing, setInstalling] = useState(false);
  const [progress,   setProgress]   = useState(0);

  const handleInstall = async () => {
    setInstalling(true);
    setProgress(0);

    // Animate progress to 60% while waiting for user to confirm dialog
    const ramp = setInterval(() => {
      setProgress(p => p < 60 ? p + 4 : p);
    }, 80);

    await install();

    clearInterval(ramp);

    // Rush to 100% after confirmation
    setProgress(80);
    setTimeout(() => setProgress(100), 200);
    setTimeout(() => { setInstalling(false); setProgress(0); }, 1400);
  };
  const typeText    = useTypewriter();
  const [shared,      setShared]      = useState(false);
  const [faqOpen,     setFaqOpen]     = useState(null);
  const [isDark,      setIsDark]      = useState(true);
  const [hoveredTool, setHoveredTool] = useState(null);

  const handleShare = async () => {
    const data = {
      title: 'Hif AI — Your Free AI Tutor',
      text: 'Meet Hif AI — a free, bilingual AI tutor for students. Ask anything in English or বাংলা!',
      url: 'https://hifai.vercel.app',
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch {}
    } else {
      await navigator.clipboard.writeText('https://hifai.vercel.app');
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const bg       = isDark ? '#06080f'   : '#f5f6fb';
  const bg2      = isDark ? '#0d1120'   : '#ffffff';
  const bg3      = isDark ? '#0a0d18'   : '#eceef5';
  const text0    = isDark ? '#f0f4ff'   : '#0d1120';
  const text1    = isDark ? '#c8d0e8'   : '#1e2740';
  const text2    = isDark ? '#a0aec0'   : '#374151';  // WCAG AA on both bgs
  const text3    = isDark ? '#6b7280'   : '#4b5563';  // WCAG AA for large text
  const border   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const border2  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';

  return (
    <>
    {/* ── Floating theme toggle — outside overflow container ── */}
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 22 }}
      onClick={() => setIsDark(d => !d)}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      aria-label="Toggle theme"
      style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        width: 46, height: 46, borderRadius: '50%', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDark
          ? 'linear-gradient(135deg, #1e2740, #111628)'
          : 'linear-gradient(135deg, #fef3c7, #fde68a)',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)'
          : '0 4px 20px rgba(251,191,36,0.5), 0 0 0 1px rgba(251,191,36,0.4)',
        fontSize: 20,
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.span key="moon"
            initial={{ opacity: 0, rotate: -40, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate:  40, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >🌙</motion.span>
        ) : (
          <motion.span key="sun"
            initial={{ opacity: 0, rotate:  40, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate: -40, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >☀️</motion.span>
        )}
      </AnimatePresence>
    </motion.button>

    <div style={{
      minHeight: '100vh',
      background: bg,
      fontFamily: "'DM Sans', sans-serif",
      color: text1,
      overflowX: 'hidden',
      position: 'relative',
      transition: 'background 0.3s, color 0.3s',
    }}>

      {/* ── Inline styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap');

        .lp-reveal { opacity:0; transform:translateY(24px); transition:opacity .55s ease,transform .55s ease; }
        .lp-reveal.lp-visible { opacity:1; transform:translateY(0); }
        .lp-scale { opacity:0; transform:scale(0.92); transition:opacity .45s cubic-bezier(0.34,1.56,0.64,1),transform .45s cubic-bezier(0.34,1.56,0.64,1); }
        .lp-scale.lp-visible { opacity:1; transform:scale(1); }

        .lp-grid-bg {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image: linear-gradient(rgba(77,124,255,0.04) 1px,transparent 1px), linear-gradient(90deg,rgba(77,124,255,0.04) 1px,transparent 1px);
          background-size:48px 48px; animation:lp-grid 20s linear infinite;
          will-change: background-position;
        }
        @keyframes lp-grid { to { background-position:48px 48px; } }

        .lp-orb { position:fixed; border-radius:50%; pointer-events:none; z-index:0; filter:blur(80px); opacity:0.14; will-change: transform; }

        .lp-cta-btn {
          display:inline-flex; align-items:center; gap:10px;
          padding:16px 36px; border-radius:14px; border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:16px; font-weight:600;
          background:linear-gradient(135deg,#4d7cff,#3a6ae8); color:#ffffff;
          box-shadow:0 4px 32px rgba(77,124,255,0.5); transition:all .2s ease;
        }
        .lp-cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 40px rgba(77,124,255,0.65); }

        .lp-chip { display:inline-flex; align-items:center; gap:8px; padding:7px 15px; border-radius:100px; font-size:13px; font-weight:500; }
        .lp-chip .dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

        .lp-sec-label { font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#6e97ff; font-weight:700; text-align:center; margin-bottom:12px; }

        .lp-stat-num {
          font-family:'Syne',sans-serif; font-size:50px; font-weight:800;
          letter-spacing:-0.03em; line-height:1;
          background:linear-gradient(135deg,#6e97ff,#00d4e8);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          margin-bottom:6px;
        }

        /* Tool card with hover preview */
        .lp-tool-wrap { position:relative; }
        .lp-tool-card {
          border-radius:16px; padding:24px 16px; text-align:center;
          transition:border-color .2s, background .2s, transform .2s;
          cursor:default;
        }
        .lp-tool-card:hover { transform:translateY(-4px); }
        .lp-tool-preview {
          position:absolute; bottom:calc(100% + 10px); left:50%; transform:translateX(-50%);
          width:220px; padding:12px 14px; border-radius:12px; z-index:20;
          font-size:12px; line-height:1.6; font-weight:400; text-align:left;
          pointer-events:none;
          box-shadow:0 8px 32px rgba(0,0,0,0.5);
        }
        .lp-tool-preview::after {
          content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
          border:6px solid transparent;
        }

        /* Demo chat animation */
        @keyframes lp-msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .lp-msg { animation:lp-msg-in .4s ease forwards; opacity:0; }
        .lp-msg:nth-child(1) { animation-delay:.3s }
        .lp-msg:nth-child(2) { animation-delay:1.2s }
        .lp-msg:nth-child(3) { animation-delay:2.4s }
        .lp-msg:nth-child(4) { animation-delay:3.5s }
        @keyframes lp-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
        .lp-cursor { display:inline-block; width:2px; height:0.9em; background:#4d7cff; border-radius:1px; margin-left:2px; vertical-align:text-bottom; animation:lp-cursor .7s ease infinite; }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#4a5475; border-radius:4px; }
      `}</style>

    {/* Bg effects — dark only, outside overflow container */}
    {isDark && <div className="lp-grid-bg" />}
    {isDark && <div className="lp-orb" style={{ width:600, height:600, background:'#4d7cff', top:-200, left:-100 }} />}
    {isDark && <div className="lp-orb" style={{ width:500, height:500, background:'#9f7aea', bottom:-100, right:-100 }} />}
    {isDark && <div className="lp-orb" style={{ width:300, height:300, background:'#00d4e8', top:'40%', right:'20%' }} />}

    <div style={{
      minHeight: '100vh',
      background: bg,
      fontFamily: "'DM Sans', sans-serif",
      color: text1,
      transition: 'background 0.3s, color 0.3s',
    }}>

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
              color: text0, marginBottom: 10,
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
            style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 400, color: text2, marginBottom: 10 }}
          >
            আপনার বন্ধু, আপনার শিক্ষক।
          </motion.p>

          {/* Typewriter line */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ height: 32, marginBottom: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ fontSize: 'clamp(15px, 2.2vw, 19px)', color: '#6e97ff', fontWeight: 500 }}>
              {typeText}
            </span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
              style={{
                display: 'inline-block', width: 2, height: '1.1em',
                background: '#4d7cff', borderRadius: 2,
                marginLeft: 3, verticalAlign: 'text-bottom',
              }}
            />
          </motion.div>

          {/* CTA + Share row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button
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

            {/* Share button */}
            <motion.button
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleShare}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 22px', borderRadius: 14, border: 'none',
                cursor: 'pointer', fontSize: 15, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                background: shared ? 'linear-gradient(135deg,#4ade80,#16a34a)' : 'linear-gradient(135deg, #f472b6, #db2777)',
                color: shared ? '#0a1a0f' : 'white',
                boxShadow: shared ? '0 4px 20px rgba(74,222,128,0.4)' : '0 4px 20px rgba(244,114,182,0.4)',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            >
              {shared ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Link Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share App
                </>
              )}
            </motion.button>
          </motion.div>

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

        {/* ── DEMO ── */}
        <section style={{ padding:'60px 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <p className="lp-sec-label lp-reveal">See it in action</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:36 }}>
            How Hif AI works
          </h2>
          <motion.div
            className="lp-reveal"
            style={{
              width:'100%', maxWidth:640, borderRadius:24, overflow:'hidden',
              background: bg2,
              border:`1px solid ${border}`,
              boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.6)' : '0 12px 48px rgba(0,0,0,0.12)',
            }}
          >
            {/* Window chrome */}
            <div style={{
              display:'flex', alignItems:'center', gap:8, padding:'12px 16px',
              background: isDark ? '#0a0d18' : '#eceef5',
              borderBottom:`1px solid ${border}`,
            }}>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#f87171',display:'inline-block'}}/>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#fbbf24',display:'inline-block'}}/>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
              <span style={{flex:1, marginLeft:8, fontSize:12, color:text3, fontFamily:'var(--font-mono,monospace)'}}>hifai.vercel.app</span>
            </div>
            {/* Chat messages */}
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16, minHeight:280 }}>
              {/* User message */}
              <div className="lp-msg" style={{ display:'flex', justifyContent:'flex-end' }}>
                <div style={{
                  padding:'10px 16px', borderRadius:'18px 18px 4px 18px',
                  background:'linear-gradient(135deg,#2d4fd4,#1e3fa8)',
                  color:'#e8eeff', fontSize:14, maxWidth:'75%', lineHeight:1.6,
                }}>
                  Explain how photosynthesis works 🌿
                </div>
              </div>
              {/* AI thinking */}
              <div className="lp-msg" style={{ display:'flex', gap:10 }}>
                <div style={{
                  width:28,height:28,borderRadius:'50%',flexShrink:0,
                  background:'linear-gradient(135deg,#7b4cd4,#4d7cff)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  overflow:'hidden',
                }}>
                  <img src="/favi-bg.png" alt="Hif AI" loading="lazy" style={{width:18,height:18,objectFit:'contain'}}
                    onError={e=>{e.target.style.display='none';e.target.parentElement.innerHTML+='🤖';}}
                  />
                </div>
                <div style={{
                  padding:'12px 16px', borderRadius:'18px 18px 18px 4px',
                  background: isDark ? '#111628' : '#f0f2f8',
                  border:`1px solid ${border}`,
                  color:text1, fontSize:13.5, lineHeight:1.75, maxWidth:'85%',
                }}>
                  <strong style={{color:'#6e97ff'}}>Photosynthesis</strong> is the process plants use to convert light into food.<br/>
                  <span style={{color:text2}}>🌱 <strong style={{color:text1}}>Formula:</strong> 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂</span>
                </div>
              </div>
              {/* Second user */}
              <div className="lp-msg" style={{ display:'flex', justifyContent:'flex-end' }}>
                <div style={{
                  padding:'10px 16px', borderRadius:'18px 18px 4px 18px',
                  background:'linear-gradient(135deg,#2d4fd4,#1e3fa8)',
                  color:'#e8eeff', fontSize:14, maxWidth:'75%',
                }}>
                  Write a Python example for this
                </div>
              </div>
              {/* Code response */}
              <div className="lp-msg" style={{ display:'flex', gap:10 }}>
                <div style={{
                  width:28,height:28,borderRadius:'50%',flexShrink:0,
                  background:'linear-gradient(135deg,#7b4cd4,#4d7cff)',
                  display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',
                }}>
                  <img src="/favi-bg.png" alt="Hif AI" loading="lazy" style={{width:18,height:18,objectFit:'contain'}}
                    onError={e=>{e.target.style.display='none';e.target.parentElement.innerHTML+='🤖';}}
                  />
                </div>
                <div style={{
                  borderRadius:'18px 18px 18px 4px', overflow:'hidden',
                  border:`1px solid ${border}`, maxWidth:'85%',
                  background: isDark ? '#06080f' : '#1a1f35',
                }}>
                  <div style={{padding:'6px 14px', background:isDark?'#0d1120':'#111628', borderBottom:`1px solid ${border}`, fontSize:11, color:'#8892b0', fontFamily:'monospace'}}>
                    python
                  </div>
                  <pre style={{margin:0, padding:'12px 14px', fontSize:12, lineHeight:1.7, fontFamily:"'JetBrains Mono',monospace", overflowX:'auto', color:'#c8d0e8'}}>
{`# Simulate photosynthesis
def photosynthesis(co2, h2o, light):
    if light:
        glucose = co2 * h2o
        oxygen  = co2 * 6
        return glucose, oxygen
    return 0, 0`}
                  </pre>
                </div>
              </div>
            </div>
            {/* Input bar */}
            <div style={{
              display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
              borderTop:`1px solid ${border}`,
              background: isDark ? '#0a0d18' : '#eceef5',
            }}>
              <div style={{
                flex:1, padding:'10px 14px', borderRadius:10, fontSize:13,
                color:text3, background: bg2, border:`1px solid ${border}`,
              }}>
                Ask anything… <span className="lp-cursor"/>
              </div>
              <div style={{
                width:34,height:34,borderRadius:10,background:'#4d7cff',
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: '80px 24px', maxWidth: 1080, margin: '0 auto' }}>
          <p className="lp-sec-label lp-reveal">Why students love it</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:48 }}>Everything you need to learn</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="lp-reveal"
                style={{
                  transitionDelay: `${i * 0.07}s`,
                  background: bg2, border:`1px solid ${border}`,
                  borderRadius: 20, padding: 28, position:'relative', overflow:'hidden',
                  transition:'border-color .2s, transform .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >
                <div style={{ width:48, height:48, borderRadius:14, marginBottom:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, background:f.bg, border:`1px solid ${f.color}33` }}>
                  {f.emoji}
                </div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:text0, marginBottom:8 }}>{f.title}</div>
                <div style={{ fontSize:14, lineHeight:1.75, color:text2, fontWeight:400 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOOLS ── */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="lp-sec-label lp-reveal">Built-in tools</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:48 }}>More than just a chatbot</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, maxWidth: 960, margin: '0 auto' }}>
            {TOOLS.map((t, i) => (
              <div
                key={t.name}
                className="lp-tool-wrap lp-reveal"
                style={{ transitionDelay:`${i*0.06}s`, position:'relative' }}
                onMouseEnter={() => setHoveredTool(i)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div
                  className="lp-tool-card"
                  style={{
                    background: bg2, border:`1px solid ${hoveredTool===i ? t.color+'55' : border}`,
                    boxShadow: hoveredTool===i ? `0 0 20px ${t.color}22` : 'none',
                  }}
                >
                  <div style={{ fontSize:28, marginBottom:10 }}>{t.emoji}</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:600, color:text1 }}>{t.name}</div>
                </div>

                {/* Hover preview tooltip */}
                <AnimatePresence>
                  {hoveredTool === i && (
                    <motion.div
                      className="lp-tool-preview"
                      initial={{ opacity:0, y:4, scale:0.95 }}
                      animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:4, scale:0.95 }}
                      transition={{ duration:0.18 }}
                      style={{
                        background: isDark ? '#111628' : '#ffffff',
                        border:`1px solid ${t.color}55`,
                        color: text2,
                        boxShadow:`0 8px 32px rgba(0,0,0,${isDark?'0.6':'0.15'})`,
                      }}
                    >
                      <span style={{ display:'block', fontWeight:600, color:t.color, marginBottom:5, fontSize:12 }}>{t.emoji} {t.name}</span>
                      {t.preview}
                      <span style={{
                        position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
                        display:'block', width:0, height:0,
                        borderLeft:'6px solid transparent', borderRight:'6px solid transparent',
                        borderTop:`6px solid ${t.color}55`,
                      }}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="lp-sec-label lp-reveal">The numbers</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:48 }}>Built for students like you</h2>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {STATS.map((s, i) => (
              <div key={s.label} className="lp-reveal" style={{
                transitionDelay: `${i * 0.08}s`,
                textAlign: 'center', padding: '32px 40px',
                background: bg2, border:`1px solid ${border}`, borderRadius: 20, minWidth: 160,
              }}>
                <div className="lp-stat-num">{s.num}</div>
                <div style={{ fontSize:14, color:text2, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ padding: '80px 24px' }}>
          <p className="lp-sec-label lp-reveal">What students say</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:48 }}>Real feedback</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="lp-reveal" style={{
                transitionDelay: `${i * 0.1}s`,
                background: bg2, border:`1px solid ${border}`,
                borderRadius: 20, padding: 28,
              }}>
                <div style={{ fontSize:28, color:'#6e97ff', fontFamily:'Georgia,serif', lineHeight:1, marginBottom:14 }}>"</div>
                <div style={{ fontSize:14, lineHeight:1.75, color:text2, fontWeight:400, marginBottom:20, fontStyle:'italic' }}>{t.quote}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:13, fontWeight:600, flexShrink:0,
                    background: t.bg, color: t.color, fontFamily:'Syne,sans-serif',
                  }}>
                    {t.init}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:text0 }}>{t.name}</div>
                    <div style={{ fontSize:12, color:text3, marginTop:2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: '80px 24px' }}>
          <p className="lp-sec-label lp-reveal">Got questions?</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:36 }}>Frequently asked</h2>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => {
              const open = faqOpen === i;
              return (
                <div key={i} className="lp-reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                  <div
                    onClick={() => setFaqOpen(open ? null : i)}
                    style={{
                      background: open ? bg2 : bg3,
                      border: `1px solid ${open ? 'rgba(77,124,255,0.3)' : border}`,
                      borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', gap:12 }}>
                      <span style={{ fontSize:15, fontWeight:600, color: open ? text0 : text1, fontFamily:"'DM Sans',sans-serif" }}>
                        {faq.q}
                      </span>
                      <motion.span
                        animate={{ rotate: open ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          flexShrink:0, width:22, height:22, borderRadius:6,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          background: open ? 'rgba(77,124,255,0.2)' : `${border}`,
                          color: open ? '#6e97ff' : text3,
                          fontSize:18, lineHeight:1, fontWeight:300,
                        }}
                      >+</motion.span>
                    </div>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height:0, opacity:0 }}
                          animate={{ height:'auto', opacity:1 }}
                          exit={{ height:0, opacity:0 }}
                          transition={{ duration:0.25, ease:[0.23,1,0.32,1] }}
                          style={{ overflow:'hidden' }}
                        >
                          <p style={{ padding:'0 22px 18px', paddingTop:14, margin:0, fontSize:14, lineHeight:1.75, color:text2, fontWeight:400, borderTop:`1px solid ${border}` }}>
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
          <div className="lp-reveal" style={{
            maxWidth: 680, width: '100%', textAlign: 'center',
            background: isDark ? 'linear-gradient(135deg,rgba(77,124,255,0.08),rgba(0,212,232,0.06))' : 'linear-gradient(135deg,rgba(77,124,255,0.06),rgba(0,212,232,0.04))',
            border: '1px solid rgba(77,124,255,0.2)', borderRadius: 28, padding: '64px 40px',
          }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,48px)', fontWeight:800, color:text0, marginBottom:14, letterSpacing:'-0.02em', lineHeight:1.1 }}>
              Start learning today.<br />It's completely free.
            </h2>
            <p style={{ fontSize:16, color:text2, fontWeight:400, marginBottom:36, lineHeight:1.6 }}>
              No signup. No credit card. No limits.<br />Just ask your first question.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.96}} onClick={onEnter} className="lp-cta-btn" style={{fontSize:16}}>
                Open Hif AI
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
              <motion.button
                whileHover={{scale:1.06,y:-2}} whileTap={{scale:0.94}} onClick={handleShare}
                style={{
                  display:'inline-flex', alignItems:'center', gap:8, padding:'14px 24px',
                  borderRadius:14, border:'none', cursor:'pointer', fontSize:15, fontWeight:600,
                  fontFamily:"'DM Sans',sans-serif",
                  background: shared ? 'linear-gradient(135deg,#4ade80,#16a34a)' : 'linear-gradient(135deg,#f472b6,#db2777)',
                  color: shared ? '#0a1a0f' : 'white',
                  boxShadow:'0 4px 20px rgba(244,114,182,0.35)', transition:'background 0.3s',
                }}
              >
                {shared
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share</>
                }
              </motion.button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ textAlign:'center', padding:'28px 24px 48px', borderTop:`1px solid ${border}`, fontSize:13, color:text3 }}>
          <span style={{ color:'#6e97ff', fontWeight:700 }}>Hif AI</span>
          {' '}— আপনার বন্ধু, আপনার শিক্ষক &nbsp;·&nbsp; Free forever &nbsp;·&nbsp; No login needed &nbsp;·&nbsp; Built with ❤️ for students
        </footer>
      </div>

      {/* ── Fixed floating Install button + progress bar ── */}
      <AnimatePresence>
        {canInstall && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 1.2 }}
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 100,
              display: 'flex', flexDirection: 'column', gap: 0,
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 4px 28px rgba(74,222,128,0.45), 0 0 0 1px rgba(74,222,128,0.2)',
            }}
          >
            <motion.button
              whileHover={!installing ? { scale: 1.03 } : {}}
              whileTap={!installing ? { scale: 0.96 } : {}}
              onClick={handleInstall}
              disabled={installing}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 22px', border: 'none',
                cursor: installing ? 'default' : 'pointer',
                fontSize: 14, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                color: '#0a1a0f',
              }}
            >
              <AnimatePresence mode="wait">
                {installing ? (
                  <motion.span key="spin"
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: 'lp-spin 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  </motion.span>
                ) : (
                  <motion.span key="dl"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
              {installing ? 'Installing…' : 'Install App'}
            </motion.button>

            {/* Progress bar — only visible while installing */}
            <AnimatePresence>
              {installing && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 5 }}
                  exit={{ height: 0 }}
                  style={{ background: '#0a1a0f', overflow: 'hidden' }}
                >
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: progress === 100
                        ? '#4d7cff'
                        : 'linear-gradient(90deg, #16a34a, #86efac)',
                      borderRadius: 2,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin keyframe for install loader */}
      <style>{`@keyframes lp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    </>
  );
}