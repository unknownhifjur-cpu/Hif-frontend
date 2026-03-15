import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/* ─── 3D Particle Canvas ── */
function ParticleCanvas({ isDark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);

    const N = 80;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      hue: Math.random() > 0.5 ? 220 : 190,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(77,124,255,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${0.5 * p.z})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [isDark]);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0, opacity: isDark ? 0.7 : 0.3,
    }} />
  );
}

/* ─── 3D Tilt Card ── */
function TiltCard({ children, style }) {
  const ref   = useRef(null);
  const frame = useRef(null);

  const onMove = useCallback((e) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el   = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      el.style.boxShadow = `${-x * 20}px ${y * 20}px 40px rgba(77,124,255,0.25)`;
    });
  }, []);

  const onLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
      ref.current.style.boxShadow = style?.boxShadow || '';
    }
  }, [style]);

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ ...style, transition: 'transform 0.1s ease, box-shadow 0.1s ease', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

/* ─── Floating 3D Shapes ── */
function FloatingShapes({ isDark }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <style>{`
        @keyframes lp-float-a { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-30px) rotate(180deg)} }
        @keyframes lp-float-b { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(-120deg)} }
        @keyframes lp-float-c { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-25px) scale(1.1)} }
        @keyframes lp-float-d { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-15px) rotate(90deg)} 66%{transform:translateY(-30px) rotate(180deg)} }
      `}</style>

      <svg width="80" height="80" viewBox="0 0 80 80" style={{ position:'absolute', top:'12%', left:'5%', opacity:0.18, animation:'lp-float-a 8s ease-in-out infinite' }}>
        <polygon points="20,10 60,10 70,25 70,55 60,70 20,70 10,55 10,25" fill="none" stroke="#4d7cff" strokeWidth="1.5"/>
        <polygon points="20,10 60,10 70,25 70,55 60,70 20,70 10,55 10,25" fill="none" stroke="#00d4e8" strokeWidth="0.5" transform="scale(0.6) translate(13,13)"/>
        <line x1="20" y1="10" x2="28" y2="22" stroke="#4d7cff" strokeWidth="0.8" opacity="0.6"/>
        <line x1="60" y1="10" x2="52" y2="22" stroke="#4d7cff" strokeWidth="0.8" opacity="0.6"/>
        <line x1="70" y1="25" x2="52" y2="30" stroke="#4d7cff" strokeWidth="0.8" opacity="0.6"/>
        <line x1="70" y1="55" x2="52" y2="50" stroke="#4d7cff" strokeWidth="0.8" opacity="0.6"/>
      </svg>

      <svg width="60" height="60" viewBox="0 0 60 60" style={{ position:'absolute', top:'8%', right:'7%', opacity:0.2, animation:'lp-float-b 6s ease-in-out infinite' }}>
        <polygon points="30,5 55,50 5,50" fill="none" stroke="#9f7aea" strokeWidth="1.5"/>
        <polygon points="30,15 47,45 13,45" fill="rgba(159,122,234,0.08)" stroke="#9f7aea" strokeWidth="0.8"/>
      </svg>

      <svg width="70" height="70" viewBox="0 0 70 70" style={{ position:'absolute', top:'45%', left:'3%', opacity:0.15, animation:'lp-float-c 10s ease-in-out infinite' }}>
        <circle cx="35" cy="35" r="28" fill="none" stroke="#00d4e8" strokeWidth="1.5" strokeDasharray="8 4"/>
        <circle cx="35" cy="35" r="18" fill="none" stroke="#4d7cff" strokeWidth="1"/>
        <circle cx="35" cy="35" r="5" fill="rgba(0,212,232,0.3)" stroke="#00d4e8" strokeWidth="1"/>
      </svg>

      <svg width="50" height="50" viewBox="0 0 50 50" style={{ position:'absolute', top:'55%', right:'4%', opacity:0.18, animation:'lp-float-d 9s ease-in-out infinite' }}>
        <polygon points="25,2 48,25 25,48 2,25" fill="rgba(251,191,36,0.06)" stroke="#fbbf24" strokeWidth="1.5"/>
        <polygon points="25,12 38,25 25,38 12,25" fill="rgba(251,191,36,0.08)" stroke="#fbbf24" strokeWidth="0.8"/>
      </svg>

      <svg width="90" height="90" viewBox="0 0 90 90" style={{ position:'absolute', bottom:'10%', left:'6%', opacity:0.12, animation:'lp-float-a 12s ease-in-out infinite reverse' }}>
        {[0,1,2].flatMap(row => [0,1,2].map(col => (
          <circle key={`${row}-${col}`} cx={15 + col * 30} cy={15 + row * 30} r="3" fill="#4d7cff"/>
        )))}
      </svg>

      <svg width="65" height="65" viewBox="0 0 65 65" style={{ position:'absolute', bottom:'15%', right:'5%', opacity:0.16, animation:'lp-float-b 11s ease-in-out infinite reverse' }}>
        <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="none" stroke="#f472b6" strokeWidth="1.5"/>
        <polygon points="32,15 49,24 49,42 32,51 15,42 15,24" fill="rgba(244,114,182,0.06)" stroke="#f472b6" strokeWidth="0.8"/>
      </svg>
    </div>
  );
}

/* ─── Three.js 3D Globe ── */
function Globe3D({ isDark }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let THREE, renderer, scene, camera, globe, dots, raf;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      THREE = window.THREE;
      const W = el.offsetWidth, H = el.offsetHeight;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      scene  = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
      camera.position.z = 2.8;

      const geo  = new THREE.SphereGeometry(1, 64, 64);
      const mat  = new THREE.MeshPhongMaterial({
        color: isDark ? 0x0d1120 : 0xe8eeff,
        emissive: isDark ? 0x4d7cff : 0x4d7cff,
        emissiveIntensity: 0.04,
        wireframe: false,
        transparent: true,
        opacity: 0.85,
      });
      globe = new THREE.Mesh(geo, mat);
      scene.add(globe);

      const wfMat = new THREE.MeshBasicMaterial({ color: 0x4d7cff, wireframe: true, transparent: true, opacity: 0.08 });
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.01, 24, 24), wfMat));

      const dotGeo = new THREE.SphereGeometry(0.012, 6, 6);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00d4e8 });
      dots = new THREE.Group();
      for (let i = 0; i < 120; i++) {
        const phi   = Math.acos(2 * Math.random() - 1);
        const theta = 2 * Math.PI * Math.random();
        const dot   = new THREE.Mesh(dotGeo, dotMat.clone());
        dot.position.setFromSphericalCoords(1.015, phi, theta);
        dot.material.color.setHSL(0.6 + Math.random() * 0.1, 0.9, 0.6);
        dots.add(dot);
      }
      scene.add(dots);

      const ringGeo = new THREE.TorusGeometry(1.35, 0.006, 8, 120);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x9f7aea, transparent: true, opacity: 0.5 });
      const ring    = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.5;
      scene.add(ring);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.004, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0x4d7cff, transparent: true, opacity: 0.3 })
      );
      ring2.rotation.x = Math.PI / 4;
      ring2.rotation.z = Math.PI / 6;
      scene.add(ring2);

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const pLight = new THREE.PointLight(0x4d7cff, 2, 10);
      pLight.position.set(3, 2, 3);
      scene.add(pLight);
      const pLight2 = new THREE.PointLight(0x00d4e8, 1.5, 10);
      pLight2.position.set(-3, -1, 2);
      scene.add(pLight2);

      let t = 0;
      const animate = () => {
        raf = requestAnimationFrame(animate);
        t += 0.005;
        globe.rotation.y += 0.003;
        dots.rotation.y  += 0.003;
        ring.rotation.z  += 0.004;
        ring2.rotation.y += 0.002;
        dots.children.forEach((d, i) => {
          d.material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(t + i * 0.15));
        });
        renderer.render(scene, camera);
      };
      animate();
    };
    document.head.appendChild(script);

    return () => {
      cancelAnimationFrame(raf);
      if (renderer && el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      if (renderer) renderer.dispose();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [isDark]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}

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
  { quote: "I write Python now. Hif AI explains every line and helps me debug. It's like a tutor available 24/7.", name: 'Tanvir Hassan', role: 'CSE Student, BUET',          init: 'তা', color: '#00d4e8', bg: 'rgba(0,212,232,0.12)' },
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

    const ramp = setInterval(() => {
      setProgress(p => p < 60 ? p + 4 : p);
    }, 80);

    await install();

    clearInterval(ramp);

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
  const text2    = isDark ? '#a0aec0'   : '#374151';
  const text3    = isDark ? '#6b7280'   : '#4b5563';
  const border   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const border2  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';

  return (
    <>
      {/* ── Floating theme toggle ── */}
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

      {/* Bg effects — dark only */}
      {isDark && <div className="lp-grid-bg" />}
      {isDark && <div className="lp-orb" style={{ width:600, height:600, background:'#4d7cff', top:-200, left:-100 }} />}
      {isDark && <div className="lp-orb" style={{ width:500, height:500, background:'#9f7aea', bottom:-100, right:-100 }} />}
      {isDark && <div className="lp-orb" style={{ width:300, height:300, background:'#00d4e8', top:'40%', right:'20%' }} />}

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
          .lp-sec-title { text-align:center; }

          .lp-stat-num {
            font-family:'Syne',sans-serif; font-size:50px; font-weight:800;
            letter-spacing:-0.03em; line-height:1;
            background:linear-gradient(135deg,#6e97ff,#00d4e8);
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            margin-bottom:6px;
          }

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

          @keyframes lp-msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          .lp-msg { animation:lp-msg-in .4s ease forwards; opacity:0; }
          .lp-msg:nth-child(1) { animation-delay:.3s }
          .lp-msg:nth-child(2) { animation-delay:1.2s }
          .lp-msg:nth-child(3) { animation-delay:2.4s }
          .lp-msg:nth-child(4) { animation-delay:3.5s }
          @keyframes lp-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
          .lp-cursor { display:inline-block; width:2px; height:0.9em; background:#4d7cff; border-radius:1px; margin-left:2px; vertical-align:text-bottom; animation:lp-cursor .7s ease infinite; }

          @keyframes lp-note-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes lp-bar { from{width:0} }
          @keyframes lp-ring { from{stroke-dashoffset:80} to{stroke-dashoffset:280} }
          @keyframes lp-tick { 0%,49%{opacity:1} 50%,100%{opacity:0.4} }
          @keyframes lp-flame { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
          @keyframes lp-correct { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
          @keyframes lp-draw { to{stroke-dashoffset:0} }
          @keyframes lp-fade { to{opacity:1} }
          @keyframes lp-spin { to { transform: rotate(360deg); } }

          @media (max-width: 640px) {
            .lp-feature-row {
              grid-template-columns: 1fr !important;
              text-align: center;
            }
            .lp-feature-row > * { order: unset !important; }
            .lp-feature-row .lp-demo-win { order: -1 !important; }

            .lp-cta-btn { padding: 14px 20px !important; font-size: 15px !important; width: 100%; justify-content: center; }
            .lp-hero-btns { flex-direction: column !important; align-items: stretch !important; width: 100%; max-width: 320px; }
            .lp-chips-row { justify-content: center !important; }

            .lp-sec-label { font-size: 10px !important; }
            .lp-stat-num { font-size: 36px !important; }

            .lp-stat-grid { gap: 12px !important; }
            .lp-stat-card { padding: 20px 24px !important; min-width: 130px !important; }

            .lp-testi-grid { grid-template-columns: 1fr !important; }

            .lp-faq-item { padding: 14px 16px !important; }

            .lp-final-cta { padding: 36px 20px !important; }
            .lp-final-btns { flex-direction: column !important; align-items: stretch !important; }
            .lp-final-btns button, .lp-final-btns a { width: 100% !important; justify-content: center !important; }

            .lp-demo-chat { padding: 14px !important; }
            .lp-hero-section { padding: 60px 16px !important; }
          }

          @media (max-width: 400px) {
            .lp-chips-row { gap: 6px !important; }
            .lp-chip { font-size: 11px !important; padding: 5px 10px !important; }
          }

          ::-webkit-scrollbar { width:4px; }
          ::-webkit-scrollbar-track { background:transparent; }
          ::-webkit-scrollbar-thumb { background:#4a5475; border-radius:4px; }
        `}</style>

        {/* ── HERO ── */}
        <section className="lp-hero-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative' }}>

          <ParticleCanvas isDark={isDark} />
          <FloatingShapes isDark={isDark} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

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

            {/* Typewriter */}
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

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 300, damping: 20 }}
              className="lp-hero-btns"
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
              className="lp-chips-row"
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
          </div>
        </section>

        {/* ── HOW IT WORKS demo ── */}
        <section style={{ padding:'60px 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <p className="lp-sec-label lp-reveal">See it in action</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:36 }}>
            How Hif AI works
          </h2>
          <TiltCard
            style={{
              width:'100%', maxWidth:640, borderRadius:24, overflow:'hidden',
              background: bg2, border:`1px solid ${border}`,
              boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.6)' : '0 12px 48px rgba(0,0,0,0.12)',
            }}
          >
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
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16, minHeight:280 }}>
              <div className="lp-msg" style={{ display:'flex', justifyContent:'flex-end' }}>
                <div style={{
                  padding:'10px 16px', borderRadius:'18px 18px 4px 18px',
                  background:'linear-gradient(135deg,#2d4fd4,#1e3fa8)',
                  color:'#e8eeff', fontSize:14, maxWidth:'75%', lineHeight:1.6,
                }}>
                  Explain how photosynthesis works 🌿
                </div>
              </div>
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
              <div className="lp-msg" style={{ display:'flex', justifyContent:'flex-end' }}>
                <div style={{
                  padding:'10px 16px', borderRadius:'18px 18px 4px 18px',
                  background:'linear-gradient(135deg,#2d4fd4,#1e3fa8)',
                  color:'#e8eeff', fontSize:14, maxWidth:'75%',
                }}>
                  Write a Python example for this
                </div>
              </div>
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
          </TiltCard>
        </section>

        {/* ── 3D GLOBE ── */}
        <section style={{ padding:'80px 24px', display:'flex', flexDirection:'column', alignItems:'center', overflow:'hidden' }}>
          <p className="lp-sec-label lp-reveal">Powered by AI</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:16 }}>
            Knowledge has no borders
          </h2>
          <p className="lp-reveal" style={{ fontSize:16, color:text2, textAlign:'center', marginBottom:48, maxWidth:500 }}>
            Ask in any language, get answers instantly. Hif AI is built for students everywhere.
          </p>
          <motion.div
            className="lp-reveal"
            style={{ width:'100%', maxWidth:440, height:440, position:'relative' }}
          >
            <div style={{
              position:'absolute', inset:0, borderRadius:'50%', zIndex:0,
              background:'radial-gradient(circle, rgba(77,124,255,0.18) 0%, transparent 70%)',
              filter:'blur(30px)',
            }}/>
            <div style={{ position:'relative', zIndex:1, width:'100%', height:'100%' }}>
              <Globe3D isDark={isDark} />
            </div>
            {[
              { text:'বাংলা',   top:'8%',  left:'10%',  color:'#4d7cff' },
              { text:'English', top:'8%',  right:'10%', color:'#00d4e8' },
              { text:'📐 Math',     top:'45%', left:'0%',   color:'#fbbf24' },
              { text:'💻 Code',     top:'45%', right:'0%',  color:'#9f7aea' },
              { text:'🔬 Science',  bottom:'8%', left:'12%', color:'#4ade80' },
              { text:'📖 History',  bottom:'8%', right:'12%', color:'#f472b6' },
            ].map((l, i) => (
              <motion.div
                key={l.text}
                initial={{ opacity:0, scale:0.7 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ delay: 1.2 + i * 0.15, type:'spring', stiffness:300, damping:20 }}
                style={{
                  position:'absolute', ...l,
                  padding:'5px 12px', borderRadius:100,
                  background: isDark ? 'rgba(13,17,32,0.9)' : 'rgba(255,255,255,0.95)',
                  border:`1px solid ${l.color}44`,
                  fontSize:12, fontWeight:600, color:l.color,
                  boxShadow:`0 4px 16px ${l.color}22`,
                  whiteSpace:'nowrap', zIndex:2,
                  animation:`lp-float-${i%2===0?'a':'b'} ${6+i}s ease-in-out infinite`,
                }}
              >
                {l.text}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── ANIMATED VIDEO DEMO ── */}
        <section style={{ padding:'80px 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <p className="lp-sec-label lp-reveal">Watch how it works</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:48 }}>
            Ask. Learn. Repeat.
          </h2>
          <div className="lp-reveal" style={{ width:'100%', maxWidth:800, borderRadius:24, overflow:'hidden', boxShadow: isDark?'0 32px 80px rgba(0,0,0,0.7)':'0 16px 48px rgba(0,0,0,0.15)', border:`1px solid ${border}` }}>
            <div style={{ background: isDark?'#080a12':'#1a1f35', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#f87171',display:'inline-block'}}/>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#fbbf24',display:'inline-block'}}/>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
              <div style={{ flex:1, height:20, marginLeft:8, background:'rgba(255,255,255,0.06)', borderRadius:6, display:'flex', alignItems:'center', paddingLeft:10 }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>hifai.vercel.app</span>
              </div>
            </div>

            <div style={{ background: isDark?'#08091a':'#f0f2f8', display:'flex', height:420, position:'relative', overflow:'hidden' }}>
              <div style={{ width:56, background: isDark?'#06080f':'#e8eeff', borderRight:`1px solid ${border}`, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:16, gap:14 }}>
                {['💬','📝','📅','🍅','🎮','✏️'].map((ic,i) => (
                  <div key={i} style={{ width:34, height:34, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, background:i===0?'rgba(77,124,255,0.2)':'transparent', border:i===0?'1px solid rgba(77,124,255,0.4)':'none' }}>{ic}</div>
                ))}
              </div>

              <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ padding:'10px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:10, background: isDark?'#0a0d1a':'#eceef5' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#4d7cff,#9f7aea)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🤖</div>
                  <span style={{ fontSize:13, fontWeight:600, color:text0 }}>Hif AI</span>
                  <span style={{ fontSize:11, color:'#4ade80', marginLeft:'auto' }}>● Online</span>
                </div>

                <div style={{ flex:1, padding:'16px', display:'flex', flexDirection:'column', gap:12, overflowY:'hidden' }}>
                  <div style={{ display:'flex', justifyContent:'flex-end', animation:'lp-msg-in .5s .2s both', opacity:0 }}>
                    <div style={{ padding:'9px 14px', borderRadius:'16px 16px 4px 16px', background:'linear-gradient(135deg,#4d7cff,#3a6ae8)', color:'white', fontSize:13, maxWidth:'70%' }}>
                      What is Newton's second law? 🍎
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, animation:'lp-msg-in .5s 1.2s both', opacity:0 }}>
                    <div style={{ width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#4d7cff,#9f7aea)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0 }}>🤖</div>
                    <div style={{ padding:'10px 14px', borderRadius:'16px 16px 16px 4px', background:isDark?'#111628':'#ffffff', border:`1px solid ${border}`, fontSize:13, color:text1, lineHeight:1.65, maxWidth:'80%' }}>
                      <strong style={{color:'#6e97ff'}}>Newton's 2nd Law:</strong> F = ma<br/>
                      <span style={{color:text2}}>Force = Mass × Acceleration. The heavier an object, the more force needed to accelerate it.</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'flex-end', animation:'lp-msg-in .5s 2.8s both', opacity:0 }}>
                    <div style={{ padding:'9px 14px', borderRadius:'16px 16px 4px 16px', background:'linear-gradient(135deg,#4d7cff,#3a6ae8)', color:'white', fontSize:13, maxWidth:'70%' }}>
                      বাংলায় বলো 
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, animation:'lp-msg-in .5s 3.8s both', opacity:0 }}>
                    <div style={{ width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#4d7cff,#9f7aea)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0 }}>🤖</div>
                    <div style={{ padding:'10px 14px', borderRadius:'16px 16px 16px 4px', background:isDark?'#111628':'#ffffff', border:`1px solid ${border}`, fontSize:13, color:text1, lineHeight:1.65, maxWidth:'80%' }}>
                      <strong style={{color:'#4ade80'}}>নিউটনের ২য় সূত্র:</strong> F = ma<br/>
                      <span style={{color:text2}}>বল = ভর × ত্বরণ। যত বেশি ভর, তত বেশি বল দরকার।</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding:'10px 12px', borderTop:`1px solid ${border}`, background:isDark?'#0a0d1a':'#eceef5', display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ flex:1, padding:'8px 12px', borderRadius:10, background:isDark?'#111628':'#ffffff', border:`1px solid ${border}`, fontSize:13, color:text3 }}>
                    Ask anything… <span className="lp-cursor"/>
                  </div>
                  <div style={{ width:32,height:32,borderRadius:9,background:'#4d7cff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background:isDark?'#080a12':'#1a1f35', padding:'10px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:'monospace' }}>0:04</span>
              <div style={{ flex:1, height:3, borderRadius:2, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                <div style={{ height:'100%', background:'#4d7cff', borderRadius:2, animation:'lp-bar 8s linear infinite' }}/>
              </div>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:'monospace' }}>0:08</span>
              <span style={{ fontSize:14 }}>🔊</span>
            </div>
          </div>
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

        {/* ── FEATURE DEMOS ── */}
        <section style={{ padding: '80px 24px' }}>
          <p className="lp-sec-label lp-reveal">Built-in tools</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:56 }}>
            More than just a chatbot
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:48, maxWidth:900, margin:'0 auto' }}>

            {/* ── Demo 1: Quick Notes ── */}
            <div className="lp-reveal lp-feature-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, color:'#fbbf24', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>📝 Quick Notes</div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, color:text0, marginBottom:12, lineHeight:1.2 }}>Save anything,<br/>find it instantly</h3>
                <p style={{ fontSize:14, color:text2, lineHeight:1.75 }}>Create colour-coded notes with tags, pin important ones to the top, and search across all your notes in one click.</p>
              </div>
              <TiltCard style={{ background:bg2, border:`1px solid ${border}`, borderRadius:16, overflow:"hidden", boxShadow: isDark?"0 16px 48px rgba(0,0,0,0.5)":"0 8px 32px rgba(0,0,0,0.1)" }}>
                <div style={{ padding:'10px 14px', background:isDark?'#0a0d18':'#eceef5', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#f87171',display:'inline-block'}}/>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#fbbf24',display:'inline-block'}}/>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
                  <span style={{fontSize:11,color:text3,marginLeft:6}}>📝 Quick Notes</span>
                </div>
                <div style={{ padding:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    { title:'Photosynthesis', tag:'Science', color:'#4ade80', bg:'rgba(74,222,128,0.1)', pinned:true },
                    { title:'Python loops', tag:'Programming', color:'#4d7cff', bg:'rgba(77,124,255,0.1)', pinned:false },
                    { title:'Algebra notes', tag:'Math', color:'#fbbf24', bg:'rgba(251,191,36,0.1)', pinned:false },
                    { title:'Essay draft', tag:'English', color:'#f472b6', bg:'rgba(244,114,182,0.1)', pinned:false },
                  ].map((n,i) => (
                    <div key={i} style={{ background:n.bg, border:`1px solid ${n.color}33`, borderRadius:10, padding:'10px 12px', animation:`lp-note-in .4s ${i*0.1+0.2}s both` }}>
                      {n.pinned && <div style={{ fontSize:9, color:n.color, marginBottom:4, fontWeight:700 }}>📌 PINNED</div>}
                      <div style={{ fontSize:12, fontWeight:600, color:text0, marginBottom:6 }}>{n.title}</div>
                      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:100, background:n.bg, color:n.color, border:`1px solid ${n.color}44` }}>{n.tag}</span>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </div>

            {/* ── Demo 2: Pomodoro Timer ── */}
            <div className="lp-reveal lp-feature-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center" }}>
              <TiltCard style={{ background:bg2, border:`1px solid ${border}`, borderRadius:16, overflow:"hidden", boxShadow: isDark?"0 16px 48px rgba(0,0,0,0.5)":"0 8px 32px rgba(0,0,0,0.1)" }}>
                <div style={{ padding:'10px 14px', background:isDark?'#0a0d18':'#eceef5', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#f87171',display:'inline-block'}}/>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#fbbf24',display:'inline-block'}}/>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
                  <span style={{fontSize:11,color:text3,marginLeft:6}}>🍅 Pomodoro Timer</span>
                </div>
                <div style={{ padding:20, textAlign:'center' }}>
                  <div style={{ position:'relative', width:120, height:120, margin:'0 auto 16px' }}>
                    <svg width="120" height="120" style={{ transform:'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="50" fill="none" stroke={isDark?'#1e2740':'#e4e7f2'} strokeWidth="8"/>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#9f7aea" strokeWidth="8"
                        strokeLinecap="round" strokeDasharray="314" strokeDashoffset="80"
                        style={{ animation:'lp-ring 3s ease-in-out infinite alternate' }}/>
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ fontFamily:'monospace', fontSize:22, fontWeight:700, color:text0, animation:'lp-tick 1s step-end infinite' }}>23:41</div>
                      <div style={{ fontSize:10, color:'#9f7aea', fontWeight:600 }}>FOCUS</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                    {['Focus','Short Break','Long Break'].map((m,i) => (
                      <div key={i} style={{ fontSize:10, padding:'4px 10px', borderRadius:100, background:i===0?'rgba(159,122,234,0.15)':isDark?'#1e2740':'#e4e7f2', color:i===0?'#9f7aea':text3, border:`1px solid ${i===0?'rgba(159,122,234,0.4)':border}` }}>{m}</div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:12 }}>
                    {[0,1,2,3].map(i => <div key={i} style={{ width:8,height:8,borderRadius:'50%', background:i<2?'#9f7aea':isDark?'#1e2740':'#e4e7f2' }}/>)}
                  </div>
                </div>
              </TiltCard>
              <div>
                <div style={{ fontSize:13, color:'#9f7aea', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>🍅 Pomodoro Timer</div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, color:text0, marginBottom:12, lineHeight:1.2 }}>Focus deeper,<br/>rest smarter</h3>
                <p style={{ fontSize:14, color:text2, lineHeight:1.75 }}>25-minute focus sessions with automatic short & long breaks. Sound alerts, session dots, and customizable durations.</p>
              </div>
            </div>

            {/* ── Demo 3: Study Planner ── */}
            <div className="lp-reveal lp-feature-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, color:'#4ade80', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>📅 Study Planner</div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, color:text0, marginBottom:12, lineHeight:1.2 }}>Track goals,<br/>build streaks</h3>
                <p style={{ fontSize:14, color:text2, lineHeight:1.75 }}>Set daily goals and topics by subject. Watch your streak grow every day you study. Weekly activity strip keeps you accountable.</p>
              </div>
              <TiltCard style={{ background:bg2, border:`1px solid ${border}`, borderRadius:16, overflow:"hidden", boxShadow: isDark?"0 16px 48px rgba(0,0,0,0.5)":"0 8px 32px rgba(0,0,0,0.1)" }}>
                <div style={{ padding:'10px 14px', background:isDark?'#0a0d18':'#eceef5', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#f87171',display:'inline-block'}}/>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#fbbf24',display:'inline-block'}}/>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
                  <span style={{fontSize:11,color:text3,marginLeft:6}}>📅 Study Planner</span>
                </div>
                <div style={{ padding:14 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:18, animation:'lp-flame 1.5s ease-in-out infinite' }}>🔥</span>
                      <span style={{ fontFamily:'monospace', fontSize:20, fontWeight:800, color:'#fb923c' }}>7</span>
                      <span style={{ fontSize:11, color:text3 }}>day streak</span>
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                      {['S','M','T','W','T','F','S'].map((d,i) => (
                        <div key={i} style={{ width:22, height:22, borderRadius:6, background:i<6?'linear-gradient(135deg,#4d7cff,#7b4cd4)':isDark?'#1e2740':'#e4e7f2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:i<6?'white':text3, fontWeight:600 }}>{d}</div>
                      ))}
                    </div>
                  </div>
                  {[
                    { text:'Finish Chapter 5', done:true },
                    { text:'Practice equations', done:true },
                    { text:'Read History notes', done:false },
                  ].map((g,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, background:g.done?(isDark?'rgba(74,222,128,0.06)':'rgba(74,222,128,0.04)'):isDark?'#111628':'#f5f6fb', border:`1px solid ${g.done?'rgba(74,222,128,0.2)':border}`, marginBottom:6, animation:`lp-note-in .4s ${i*0.12+0.2}s both` }}>
                      <span style={{ fontSize:14 }}>{g.done?'✅':'⭕'}</span>
                      <span style={{ fontSize:12, color:g.done?text3:text1, textDecoration:g.done?'line-through':'none' }}>{g.text}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:10, height:4, borderRadius:2, background:isDark?'#1e2740':'#e4e7f2', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:'67%', borderRadius:2, background:'linear-gradient(90deg,#4ade80,#4d7cff)', animation:'lp-bar 2s ease-out both' }}/>
                  </div>
                  <div style={{ fontSize:10, color:text3, marginTop:4 }}>2 / 3 goals complete</div>
                </div>
              </TiltCard>
            </div>

            {/* ── Demo 4: Game Hub ── */}
            <div className="lp-reveal lp-feature-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center" }}>
              <TiltCard style={{ background:bg2, border:`1px solid ${border}`, borderRadius:16, overflow:"hidden", boxShadow: isDark?"0 16px 48px rgba(0,0,0,0.5)":"0 8px 32px rgba(0,0,0,0.1)" }}>
                <div style={{ padding:'10px 14px', background:isDark?'#0a0d18':'#eceef5', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#f87171',display:'inline-block'}}/>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#fbbf24',display:'inline-block'}}/>
                  <span style={{width:8,height:8,borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
                  <span style={{fontSize:11,color:text3,marginLeft:6}}>🎮 Game Hub — Math Quiz</span>
                </div>
                <div style={{ padding:16, textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#f472b6', fontWeight:700, marginBottom:8 }}>Q 4 / 10 · Score: 3</div>
                  <div style={{ height:3, borderRadius:2, background:isDark?'#1e2740':'#e4e7f2', marginBottom:14, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:'40%', background:'#f472b6', borderRadius:2, animation:'lp-bar 1.5s ease-out both' }}/>
                  </div>
                  <div style={{ fontSize:22, fontWeight:800, color:text0, fontFamily:'monospace', marginBottom:14 }}>12 × 8 = ?</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[86, 96, 106, 76].map((n,i) => (
                      <div key={i} style={{
                        padding:'10px', borderRadius:10, fontSize:16, fontWeight:700, fontFamily:'monospace',
                        background: i===1?(isDark?'rgba(74,222,128,0.15)':'rgba(74,222,128,0.1)'):(isDark?'#111628':'#f0f2f8'),
                        border:`2px solid ${i===1?'#4ade80':border}`,
                        color: i===1?'#4ade80':text1,
                        animation: i===1?'lp-correct .5s .8s both':'none',
                      }}>{n}</div>
                    ))}
                  </div>
                </div>
              </TiltCard>
              <div>
                <div style={{ fontSize:13, color:'#f472b6', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>🎮 Game Hub</div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, color:text0, marginBottom:12, lineHeight:1.2 }}>Learn through<br/>play</h3>
                <p style={{ fontSize:14, color:text2, lineHeight:1.75 }}>4 educational games — Math Quiz, Word Scramble, Memory Match and True or False. Best scores saved locally.</p>
                <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
                  {['🧮 Math','🔤 Words','🃏 Memory','✅ T or F'].map((g,i) => (
                    <span key={i} style={{ fontSize:12, padding:'5px 12px', borderRadius:100, background:isDark?'#111628':'#eceef5', color:text2, border:`1px solid ${border}` }}>{g}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Demo 5: Whiteboard ── */}
            <div className="lp-reveal lp-feature-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, color:'#00d4e8', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>✏️ Whiteboard</div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, color:text0, marginBottom:12, lineHeight:1.2 }}>Sketch, diagram<br/>& visualize</h3>
                <p style={{ fontSize:14, color:text2, lineHeight:1.75 }}>Draw freehand, add shapes and text, undo up to 30 steps, and download your canvas as a PNG. Works on touch too.</p>
              </div>
              <TiltCard style={{ background:isDark?'#06080f':'#1a1f35', border:`1px solid ${border}`, borderRadius:16, overflow:'hidden', boxShadow: isDark?'0 16px 48px rgba(0,0,0,0.5)':'0 8px 32px rgba(0,0,0,0.1)' }}>
                <div style={{ padding:'8px 14px', background:isDark?'#0a0d18':'#0d1120', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:6 }}>
                  {['✏️','⬜','⭕','➖','🔤'].map((t,i) => (
                    <div key={i} style={{ width:24, height:24, borderRadius:6, background:i===0?'rgba(0,212,232,0.2)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, border:i===0?'1px solid rgba(0,212,232,0.4)':'none' }}>{t}</div>
                  ))}
                  <div style={{ flex:1 }}/>
                  {['#f0f4ff','#4d7cff','#f87171','#fbbf24'].map((c,i) => <div key={i} style={{ width:14,height:14, borderRadius:'50%', background:c, border:'1px solid rgba(255,255,255,0.2)' }}/>)}
                </div>
                <div style={{ position:'relative', height:160 }}>
                  <svg width="100%" height="160" style={{ position:'absolute', inset:0 }}>
                    <path d="M 30 80 Q 80 30 130 80 Q 180 130 230 80" fill="none" stroke="#4d7cff" strokeWidth="2.5" strokeLinecap="round"
                      style={{ strokeDasharray:220, strokeDashoffset:220, animation:'lp-draw 2s ease forwards' }}/>
                    <circle cx="170" cy="100" r="28" fill="none" stroke="#00d4e8" strokeWidth="2"
                      style={{ strokeDasharray:176, strokeDashoffset:176, animation:'lp-draw 1.5s 1s ease forwards' }}/>
                    <text x="170" y="104" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace"
                      style={{ opacity:0, animation:'lp-fade 0.5s 2.2s ease forwards' }}>nucleus</text>
                    <path d="M 40 130 L 120 130" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round"
                      style={{ strokeDasharray:80, strokeDashoffset:80, animation:'lp-draw 1s 0.5s ease forwards' }}/>
                    <text x="82" y="125" textAnchor="middle" fill="#f472b6" fontSize="10" fontFamily="monospace"
                      style={{ opacity:0, animation:'lp-fade 0.5s 1.6s ease forwards' }}>wave</text>
                  </svg>
                </div>
              </TiltCard>
            </div>

          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="lp-sec-label lp-reveal">The numbers</p>
          <h2 className="lp-sec-title lp-reveal" style={{ color:text0, fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:48 }}>Built for students like you</h2>
          <div className="lp-stat-grid" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {STATS.map((s, i) => (
              <div key={s.label} className="lp-reveal lp-stat-card" style={{
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
          <div className="lp-testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
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
        <section style={{ padding: '80px 16px', display: 'flex', justifyContent: 'center' }}>
          <div className="lp-reveal lp-final-cta" style={{
            maxWidth: 680, width: '100%', textAlign: 'center',
            background: isDark ? 'linear-gradient(135deg,rgba(77,124,255,0.08),rgba(0,212,232,0.06))' : 'linear-gradient(135deg,rgba(77,124,255,0.06),rgba(0,212,232,0.04))',
            border: '1px solid rgba(77,124,255,0.2)', borderRadius: 28, padding: '64px 40px',
          }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,5vw,48px)', fontWeight:800, color:text0, marginBottom:14, letterSpacing:'-0.02em', lineHeight:1.1 }}>
              Start learning today.<br />It's completely free.
            </h2>
            <p style={{ fontSize:'clamp(14px,2vw,16px)', color:text2, fontWeight:400, marginBottom:36, lineHeight:1.6 }}>
              No signup. No credit card. No limits.<br />Just ask your first question.
            </p>
            <div className="lp-final-btns" style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.96}} onClick={onEnter} className="lp-cta-btn" style={{fontSize:16}}>
                Open Hif AI
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
              <motion.button
                whileHover={{scale:1.06,y:-2}} whileTap={{scale:0.94}} onClick={handleShare}
                style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 24px',
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

      {/* ── Fixed floating Install button ── */}
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
    </>
  );
}