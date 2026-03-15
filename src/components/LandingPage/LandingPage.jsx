import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/* ─── useIsMobile hook ── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

/* ─── 3D Particle Canvas ── */
function ParticleCanvas({ isDark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', resize);
    const N = 60;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H, z: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5, hue: Math.random() > 0.5 ? 220 : 190,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(77,124,255,${0.15 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      particles.forEach(p => {
        p.x += p.vx * p.z; p.y += p.vy * p.z;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${0.5 * p.z})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [isDark]);
  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:isDark?0.7:0.3 }} />;
}

/* ─── 3D Tilt Card (desktop only) ── */
function TiltCard({ children, style, className }) {
  const ref = useRef(null);
  const frame = useRef(null);
  const isMobile = useIsMobile();
  const onMove = useCallback((e) => {
    if (isMobile) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      el.style.boxShadow = `${-x * 20}px ${y * 20}px 40px rgba(77,124,255,0.25)`;
    });
  }, [isMobile]);
  const onLeave = useCallback(() => {
    if (ref.current) { ref.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)'; ref.current.style.boxShadow = style?.boxShadow || ''; }
  }, [style]);
  return <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave} style={{ ...style, transition:'transform 0.1s ease,box-shadow 0.1s ease', willChange:'transform' }}>{children}</div>;
}

/* ─── Floating Shapes (desktop only via CSS) ── */
function FloatingShapes() {
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
      <style>{`
        @keyframes lp-float-a{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-30px) rotate(180deg)}}
        @keyframes lp-float-b{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(-120deg)}}
        @keyframes lp-float-c{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-25px) scale(1.1)}}
        @keyframes lp-float-d{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-15px) rotate(90deg)}66%{transform:translateY(-30px) rotate(180deg)}}
        .lp-shape{display:block} @media(max-width:640px){.lp-shape{display:none!important}}
      `}</style>
      <svg className="lp-shape" width="80" height="80" viewBox="0 0 80 80" style={{ position:'absolute', top:'12%', left:'5%', opacity:0.18, animation:'lp-float-a 8s ease-in-out infinite' }}>
        <polygon points="20,10 60,10 70,25 70,55 60,70 20,70 10,55 10,25" fill="none" stroke="#4d7cff" strokeWidth="1.5"/>
        <line x1="20" y1="10" x2="28" y2="22" stroke="#4d7cff" strokeWidth="0.8" opacity="0.6"/>
        <line x1="60" y1="10" x2="52" y2="22" stroke="#4d7cff" strokeWidth="0.8" opacity="0.6"/>
      </svg>
      <svg className="lp-shape" width="60" height="60" viewBox="0 0 60 60" style={{ position:'absolute', top:'8%', right:'7%', opacity:0.2, animation:'lp-float-b 6s ease-in-out infinite' }}>
        <polygon points="30,5 55,50 5,50" fill="none" stroke="#9f7aea" strokeWidth="1.5"/>
        <polygon points="30,15 47,45 13,45" fill="rgba(159,122,234,0.08)" stroke="#9f7aea" strokeWidth="0.8"/>
      </svg>
      <svg className="lp-shape" width="70" height="70" viewBox="0 0 70 70" style={{ position:'absolute', top:'45%', left:'3%', opacity:0.15, animation:'lp-float-c 10s ease-in-out infinite' }}>
        <circle cx="35" cy="35" r="28" fill="none" stroke="#00d4e8" strokeWidth="1.5" strokeDasharray="8 4"/>
        <circle cx="35" cy="35" r="5" fill="rgba(0,212,232,0.3)" stroke="#00d4e8" strokeWidth="1"/>
      </svg>
      <svg className="lp-shape" width="50" height="50" viewBox="0 0 50 50" style={{ position:'absolute', top:'55%', right:'4%', opacity:0.18, animation:'lp-float-d 9s ease-in-out infinite' }}>
        <polygon points="25,2 48,25 25,48 2,25" fill="rgba(251,191,36,0.06)" stroke="#fbbf24" strokeWidth="1.5"/>
      </svg>
      <svg className="lp-shape" width="65" height="65" viewBox="0 0 65 65" style={{ position:'absolute', bottom:'15%', right:'5%', opacity:0.16, animation:'lp-float-b 11s ease-in-out infinite reverse' }}>
        <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="none" stroke="#f472b6" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

/* ─── Three.js Globe ── */
function Globe3D({ isDark }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    let THREE, renderer, scene, camera, globe, dots, raf;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      THREE = window.THREE;
      const W = el.offsetWidth, H = el.offsetHeight;
      renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
      renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);
      scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 100); camera.position.z = 2.8;
      globe = new THREE.Mesh(new THREE.SphereGeometry(1,64,64), new THREE.MeshPhongMaterial({ color:isDark?0x0d1120:0xe8eeff, emissive:0x4d7cff, emissiveIntensity:0.04, transparent:true, opacity:0.85 }));
      scene.add(globe);
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.01,24,24), new THREE.MeshBasicMaterial({ color:0x4d7cff, wireframe:true, transparent:true, opacity:0.08 })));
      dots = new THREE.Group();
      for (let i = 0; i < 120; i++) {
        const phi = Math.acos(2*Math.random()-1), theta = 2*Math.PI*Math.random();
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.012,6,6), new THREE.MeshBasicMaterial({ color:0x00d4e8 }));
        d.position.setFromSphericalCoords(1.015, phi, theta); d.material.color.setHSL(0.6+Math.random()*0.1,0.9,0.6); dots.add(d);
      }
      scene.add(dots);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35,0.006,8,120), new THREE.MeshBasicMaterial({ color:0x9f7aea, transparent:true, opacity:0.5 }));
      ring.rotation.x = Math.PI/2.5; scene.add(ring);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.55,0.004,8,120), new THREE.MeshBasicMaterial({ color:0x4d7cff, transparent:true, opacity:0.3 }));
      ring2.rotation.x = Math.PI/4; ring2.rotation.z = Math.PI/6; scene.add(ring2);
      scene.add(new THREE.AmbientLight(0xffffff,0.6));
      const pl = new THREE.PointLight(0x4d7cff,2,10); pl.position.set(3,2,3); scene.add(pl);
      const pl2 = new THREE.PointLight(0x00d4e8,1.5,10); pl2.position.set(-3,-1,2); scene.add(pl2);
      let t = 0;
      const animate = () => {
        raf = requestAnimationFrame(animate); t += 0.005;
        globe.rotation.y += 0.003; dots.rotation.y += 0.003; ring.rotation.z += 0.004; ring2.rotation.y += 0.002;
        dots.children.forEach((d,i) => { d.material.opacity = 0.4+0.6*Math.abs(Math.sin(t+i*0.15)); });
        renderer.render(scene, camera);
      };
      animate();
    };
    document.head.appendChild(script);
    return () => { cancelAnimationFrame(raf); if (renderer&&el.contains(renderer.domElement)) el.removeChild(renderer.domElement); if (renderer) renderer.dispose(); if (script.parentNode) script.parentNode.removeChild(script); };
  }, [isDark]);
  return <div ref={mountRef} style={{ width:'100%', height:'100%' }} />;
}

/* ─── Typewriter hook ── */
const TYPEWRITER_LINES = ['Ask anything. Learn everything.','আপনার যেকোনো প্রশ্নের উত্তর পান।','Debug your code instantly.','Ace your exams with AI.','Study smarter, not harder.','বাংলায় কথা বলুন, ইংরেজিতেও।','Your free tutor, 24/7.'];
function useTypewriter() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const current = TYPEWRITER_LINES[lineIdx];
  useEffect(() => {
    let t;
    if (!deleting && charIdx < current.length) t = setTimeout(() => setCharIdx(c=>c+1), 45);
    else if (!deleting && charIdx === current.length) t = setTimeout(() => setDeleting(true), 2000);
    else if (deleting && charIdx > 0) t = setTimeout(() => setCharIdx(c=>c-1), 22);
    else if (deleting && charIdx === 0) { setDeleting(false); setLineIdx(i=>(i+1)%TYPEWRITER_LINES.length); }
    return () => clearTimeout(t);
  }, [charIdx, deleting, current]);
  return current.slice(0, charIdx);
}

/* ─── Reveal hook ── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('lp-visible')), { threshold:0.06 });
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Data ── */
const FAQS = [
  { q:'Is Hif AI really free?', a:'Yes — 100% free forever. No premium plan, no credit card, no hidden limits.' },
  { q:'Do I need to create an account?', a:'No. Hif AI uses a session token stored in your browser. Just open and start asking.' },
  { q:'Can I use it in Bengali (বাংলা)?', a:'Absolutely. Write in বাংলা, English, or mix both — Hif AI responds naturally in either.' },
  { q:'How long are my chats saved?', a:'Chats auto-delete after 24 hours for privacy. Your notes, planner & game scores are kept locally.' },
  { q:'What built-in tools are included?', a:'Quick Notes, Study Planner, Pomodoro Timer, Game Hub, and a full drawing Whiteboard.' },
  { q:'Can I install it as an app on my phone?', a:'Yes! Tap the green Install App button. Works on Android (Chrome) and desktop (Chrome/Edge). No app store needed.' },
  { q:'Does it support coding questions?', a:'Yes. Code blocks are syntax-highlighted with copy and download buttons. Supports Python, JS, C++, Java and more.' },
];
const FEATURES = [
  { emoji:'🧠', color:'#4d7cff', bg:'rgba(77,124,255,0.12)',   title:'AI-Powered Answers',  desc:'Ask any question in English or বাংলা and get instant, detailed explanations tailored to your level.' },
  { emoji:'💻', color:'#9f7aea', bg:'rgba(159,122,234,0.12)', title:'Code with Confidence', desc:'Syntax-highlighted code blocks with Python, JS, C++ and more. Copy or download with one click.' },
  { emoji:'🔒', color:'#00d4e8', bg:'rgba(0,212,232,0.1)',    title:'100% Private',         desc:'No account. No data collection. Your session lives only in your browser and auto-deletes after 24h.' },
  { emoji:'✨', color:'#fbbf24', bg:'rgba(251,191,36,0.1)',   title:'Free Forever',          desc:'No premium plan, no credit card, no limits. Hif AI is free for every student, every time.' },
  { emoji:'🌍', color:'#4ade80', bg:'rgba(74,222,128,0.1)',   title:'Truly Bilingual',       desc:'Switch between English and বাংলা mid-conversation. Hif AI understands both naturally.' },
  { emoji:'📚', color:'#f472b6', bg:'rgba(244,114,182,0.1)', title:'Multi-Subject',          desc:'Math, Science, English, Programming, History, Geography and more — all in one place.' },
];
const STATS = [
  { num:'∞',   label:'Questions you can ask' },
  { num:'2',   label:'Languages supported' },
  { num:'6+',  label:'Built-in study tools' },
  { num:'৳0', label:'Cost — forever' },
];
const TESTIMONIALS = [
  { quote:'Hif AI explained quadratic equations better than my textbook. The bilingual support is a lifesaver.', name:'Raihan Ahmed',   role:'Class 10 Student, Dhaka',   init:'রা', color:'#4d7cff', bg:'rgba(77,124,255,0.15)' },
  { quote:'The Pomodoro timer and Study Planner changed how I study. I get more done in 2 hours than before.',  name:'Sumaiya Islam',  role:'HSC Student, Chittagong',   init:'সু', color:'#9f7aea', bg:'rgba(159,122,234,0.15)' },
  { quote:"I write Python now. Hif AI explains every line and helps me debug. It's like a tutor available 24/7.", name:'Tanvir Hassan', role:'CSE Student, BUET',         init:'তা', color:'#00d4e8', bg:'rgba(0,212,232,0.12)' },
];

/* ═══════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════ */
export default function LandingPage({ onEnter }) {
  useReveal();
  const { canInstall, install, isInstalled } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [progress,   setProgress]   = useState(0);
  const isMobile = useIsMobile();

  const handleInstall = async () => {
    setInstalling(true); setProgress(0);
    const ramp = setInterval(() => setProgress(p => p < 60 ? p + 4 : p), 80);
    await install(); clearInterval(ramp);
    setProgress(80); setTimeout(() => setProgress(100), 200);
    setTimeout(() => { setInstalling(false); setProgress(0); }, 1400);
  };

  const typeText = useTypewriter();
  const [shared,  setShared]  = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [isDark,  setIsDark]  = useState(true);

  const handleShare = async () => {
    const data = { title:'Hif AI — Your Free AI Tutor', text:'Meet Hif AI — a free bilingual AI tutor!', url:'https://hifai.vercel.app' };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else { await navigator.clipboard.writeText('https://hifai.vercel.app'); setShared(true); setTimeout(() => setShared(false), 2500); }
  };

  const bg     = isDark ? '#06080f' : '#f5f6fb';
  const bg2    = isDark ? '#0d1120' : '#ffffff';
  const bg3    = isDark ? '#0a0d18' : '#eceef5';
  const text0  = isDark ? '#f0f4ff' : '#0d1120';
  const text1  = isDark ? '#c8d0e8' : '#1e2740';
  const text2  = isDark ? '#a0aec0' : '#374151';
  const text3  = isDark ? '#6b7280' : '#4b5563';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  /* reusable window chrome */
  const WinChrome = ({ label }) => (
    <div style={{ padding:'9px 12px', background:isDark?'#0a0d18':'#eceef5', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:5 }}>
      {['#f87171','#fbbf24','#4ade80'].map((c,i) => <span key={i} style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }}/>)}
      <span style={{ fontSize:10, color:text3, marginLeft:5 }}>{label}</span>
    </div>
  );

  return (
    <>
      {/* ── Theme toggle ── */}
      <motion.button
        initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
        transition={{ delay:1, type:'spring', stiffness:300, damping:22 }}
        onClick={() => setIsDark(d => !d)}
        whileHover={{ scale:1.12 }} whileTap={{ scale:0.88 }}
        aria-label="Toggle theme"
        style={{ position:'fixed', top:14, right:14, zIndex:9999, width:40, height:40, borderRadius:'50%', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background:isDark?'linear-gradient(135deg,#1e2740,#111628)':'linear-gradient(135deg,#fef3c7,#fde68a)', boxShadow:isDark?'0 4px 20px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.1)':'0 4px 20px rgba(251,191,36,0.5)', fontSize:17, transition:'background 0.3s' }}
      >
        <AnimatePresence mode="wait">
          {isDark
            ? <motion.span key="moon" initial={{opacity:0,rotate:-40,scale:0.5}} animate={{opacity:1,rotate:0,scale:1}} exit={{opacity:0,rotate:40,scale:0.5}} transition={{duration:0.2}}>🌙</motion.span>
            : <motion.span key="sun"  initial={{opacity:0,rotate:40,scale:0.5}}  animate={{opacity:1,rotate:0,scale:1}} exit={{opacity:0,rotate:-40,scale:0.5}} transition={{duration:0.2}}>☀️</motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Bg orbs */}
      {isDark && <div className="lp-grid-bg" />}
      {isDark && <div className="lp-orb" style={{ width:500, height:500, background:'#4d7cff', top:-200, left:-100 }} />}
      {isDark && <div className="lp-orb" style={{ width:400, height:400, background:'#9f7aea', bottom:-100, right:-100 }} />}
      {isDark && <div className="lp-orb" style={{ width:250, height:250, background:'#00d4e8', top:'40%', right:'20%' }} />}

      <div style={{ minHeight:'100vh', background:bg, fontFamily:"'DM Sans',sans-serif", color:text1, overflowX:'hidden', position:'relative', transition:'background 0.3s,color 0.3s' }}>

        {/* ════ GLOBAL CSS ════ */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap');
          *,*::before,*::after{box-sizing:border-box}
          img{max-width:100%}

          .lp-reveal{opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease}
          .lp-reveal.lp-visible{opacity:1;transform:translateY(0)}

          .lp-grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(77,124,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(77,124,255,0.04) 1px,transparent 1px);background-size:48px 48px;animation:lp-grid 20s linear infinite}
          @keyframes lp-grid{to{background-position:48px 48px}}
          .lp-orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0;filter:blur(80px);opacity:0.14}

          /* Buttons */
          .lp-cta-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 26px;border-radius:13px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;background:linear-gradient(135deg,#4d7cff,#3a6ae8);color:#fff;box-shadow:0 4px 28px rgba(77,124,255,0.5);transition:all .2s ease;white-space:nowrap;-webkit-tap-highlight-color:transparent}
          .lp-cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(77,124,255,0.65)}
          .lp-share-btn{-webkit-tap-highlight-color:transparent}

          /* Chips */
          .lp-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:100px;font-size:12px;font-weight:500}
          .lp-chip .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

          /* Section labels */
          .lp-sec-label{font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6e97ff;font-weight:700;text-align:center;margin-bottom:10px;display:block}

          /* Stat number */
          .lp-stat-num{font-family:'Syne',sans-serif;font-size:42px;font-weight:800;letter-spacing:-0.03em;line-height:1;background:linear-gradient(135deg,#6e97ff,#00d4e8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:6px}

          /* Cursors / animations */
          @keyframes lp-cursor{0%,100%{opacity:1}50%{opacity:0}}
          .lp-cursor{display:inline-block;width:2px;height:.9em;background:#4d7cff;border-radius:1px;margin-left:2px;vertical-align:text-bottom;animation:lp-cursor .7s ease infinite}
          @keyframes lp-msg-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes lp-note-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes lp-bar{from{width:0}}
          @keyframes lp-ring{from{stroke-dashoffset:80}to{stroke-dashoffset:280}}
          @keyframes lp-tick{0%,49%{opacity:1}50%,100%{opacity:0.4}}
          @keyframes lp-flame{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
          @keyframes lp-correct{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
          @keyframes lp-draw{to{stroke-dashoffset:0}}
          @keyframes lp-fade{to{opacity:1}}
          @keyframes lp-spin{to{transform:rotate(360deg)}}

          /* ─── LAYOUT ─── */
          .lp-section{padding:60px 20px}
          .lp-feature-row{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center}
          .lp-stat-grid{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
          .lp-stat-card{text-align:center;padding:26px 30px;border-radius:18px;min-width:130px;flex:1;max-width:190px}
          .lp-testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;max-width:880px;margin:0 auto}
          .lp-demo-sidebar{display:flex}
          .lp-demo-vidwin{height:380px}
          .lp-globe-wrap{max-width:380px;height:380px}
          .lp-wb-canvas{height:150px}

          /* ─── TABLET ≤900px ─── */
          @media(max-width:900px){
            .lp-feature-row{grid-template-columns:1fr;gap:18px}
            .lp-feature-row .lp-demo-win{order:-1}
            .lp-testi-grid{grid-template-columns:1fr 1fr}
          }

          /* ─── MOBILE ≤640px ─── */
          @media(max-width:640px){
            .lp-section{padding:44px 16px!important}
            .lp-hero-section{padding:72px 16px 44px!important}

            /* hero */
            .lp-hero-btns{flex-direction:column!important;align-items:stretch!important;width:100%!important}
            .lp-cta-btn{width:100%!important;padding:13px 16px!important;font-size:14px!important}
            .lp-share-btn{width:100%!important;justify-content:center!important;padding:12px 16px!important;font-size:14px!important}
            .lp-chips-row{gap:5px!important;margin-top:26px!important}
            .lp-chip{font-size:11px!important;padding:4px 9px!important}

            /* sections */
            .lp-sec-label{font-size:10px!important}
            .lp-sec-h2{font-size:clamp(20px,6vw,28px)!important;margin-bottom:22px!important}

            /* feature rows: always single col, text first hidden → demo top */
            .lp-feature-row{grid-template-columns:1fr!important;gap:14px!important}
            .lp-feature-row .lp-demo-win{order:-1!important}

            /* video demo */
            .lp-demo-sidebar{display:none!important}
            .lp-demo-vidwin{height:300px!important}

            /* globe */
            .lp-globe-wrap{max-width:260px!important;height:260px!important}
            .lp-globe-label{font-size:9px!important;padding:3px 7px!important}

            /* stats: 2 per row */
            .lp-stat-grid{gap:9px!important}
            .lp-stat-card{padding:18px 14px!important;min-width:0!important;flex:0 0 calc(50% - 5px)!important;max-width:none!important}
            .lp-stat-num{font-size:30px!important}

            /* testimonials: single col */
            .lp-testi-grid{grid-template-columns:1fr!important}

            /* faq */
            .lp-faq-row{padding:13px 14px!important}
            .lp-faq-q{font-size:13px!important}

            /* final cta */
            .lp-final-cta{padding:32px 18px!important;border-radius:18px!important}
            .lp-final-btns{flex-direction:column!important;align-items:stretch!important}
            .lp-final-btns button{width:100%!important;justify-content:center!important}

            /* demo cards */
            .lp-notes-grid{gap:7px!important}
            .lp-pomo-modes{gap:4px!important}
            .lp-pomo-mode{font-size:9px!important;padding:3px 6px!important}
            .lp-quiz-grid{gap:6px!important}
            .lp-wb-canvas{height:120px!important}
          }

          /* ─── TINY ≤380px ─── */
          @media(max-width:380px){
            .lp-chip{font-size:10px!important;padding:3px 7px!important}
            .lp-stat-card{flex:0 0 100%!important}
            .lp-globe-wrap{max-width:220px!important;height:220px!important}
          }

          ::-webkit-scrollbar{width:4px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:#4a5475;border-radius:4px}
        `}</style>

        {/* ══════════ HERO ══════════ */}
        <section className="lp-hero-section" style={{ minHeight:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 20px 48px', position:'relative' }}>
          <ParticleCanvas isDark={isDark} />
          <FloatingShapes />

          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth:540 }}>
            {/* Logo */}
            <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:300,damping:20,delay:0.1}}
              style={{ width:72, height:72, borderRadius:20, marginBottom:20, background:'linear-gradient(135deg,rgba(77,124,255,0.2),rgba(0,212,232,0.12))', border:'1px solid rgba(77,124,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 56px rgba(77,124,255,0.3)' }}
            >
              <img src="/favi-bg.png" alt="Hif AI" style={{ width:42, height:42, objectFit:'contain' }}
                onError={e=>{e.target.style.display='none';e.target.parentElement.innerHTML+='<span style="font-size:30px">🤖</span>';}}
              />
            </motion.div>

            {/* Badge */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px', borderRadius:100, marginBottom:18, background:'rgba(77,124,255,0.1)', border:'1px solid rgba(77,124,255,0.25)', fontSize:11, fontWeight:500, color:'#6e97ff', letterSpacing:'0.05em' }}
            >
              <motion.span animate={{opacity:[1,0.3,1]}} transition={{duration:2,repeat:Infinity}} style={{ width:6, height:6, borderRadius:'50%', background:'#00d4e8', display:'inline-block' }}/>
              Free forever · No login · Bilingual
            </motion.div>

            {/* Title */}
            <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
              style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(42px,11vw,96px)', fontWeight:800, lineHeight:1, letterSpacing:'-0.03em', color:text0, margin:'0 0 10px' }}
            >
              Meet{' '}
              <span style={{ background:'linear-gradient(135deg,#6e97ff,#00d4e8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Hif AI</span>
            </motion.h1>

            <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.5}}
              style={{ fontSize:'clamp(15px,3.5vw,22px)', fontWeight:400, color:text2, margin:'0 0 8px' }}
            >আপনার বন্ধু, আপনার শিক্ষক।</motion.p>

            {/* Typewriter */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
              style={{ height:28, marginBottom:34, display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              <span style={{ fontSize:'clamp(12px,2.8vw,17px)', color:'#6e97ff', fontWeight:500 }}>{typeText}</span>
              <motion.span animate={{opacity:[1,0,1]}} transition={{duration:0.7,repeat:Infinity,ease:'linear'}} style={{ display:'inline-block', width:2, height:'1.1em', background:'#4d7cff', borderRadius:2, marginLeft:3, verticalAlign:'text-bottom' }}/>
            </motion.div>

            {/* CTA row */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.7,type:'spring',stiffness:300,damping:20}}
              className="lp-hero-btns"
              style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'center', flexWrap:'wrap', width:'100%' }}
            >
              <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.96}} onClick={onEnter} className="lp-cta-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Start Learning — It's Free
              </motion.button>
              <motion.button whileHover={{scale:1.06,y:-2}} whileTap={{scale:0.94}} onClick={handleShare} className="lp-share-btn"
                style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7, padding:'12px 20px', borderRadius:13, border:'none', cursor:'pointer', fontSize:14, fontWeight:500, fontFamily:"'DM Sans',sans-serif", background:shared?'linear-gradient(135deg,#4ade80,#16a34a)':'linear-gradient(135deg,#f472b6,#db2777)', color:shared?'#0a1a0f':'white', boxShadow:shared?'0 4px 20px rgba(74,222,128,0.4)':'0 4px 20px rgba(244,114,182,0.4)', transition:'background 0.3s,box-shadow 0.3s', whiteSpace:'nowrap' }}
              >
                {shared
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share App</>
                }
              </motion.button>
            </motion.div>

            {/* Chips */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9}}
              className="lp-chips-row"
              style={{ display:'flex', gap:7, flexWrap:'wrap', justifyContent:'center', marginTop:32 }}
            >
              {[{dot:'#4ade80',text:'Instant answers'},{dot:'#4d7cff',text:'Code generation'},{dot:'#00d4e8',text:'Study tools'},{dot:'#fbbf24',text:'No signup'},{dot:'#f472b6',text:'বাংলা + English'}].map(c => (
                <div key={c.text} className="lp-chip" style={{ background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)', border:`1px solid ${border}`, color:text2 }}>
                  <span className="dot" style={{ background:c.dot }}/>{c.text}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section className="lp-section" style={{ padding:'60px 20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <span className="lp-sec-label lp-reveal">See it in action</span>
          <h2 className="lp-sec-h2 lp-reveal" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,5vw,40px)', fontWeight:700, letterSpacing:'-0.02em', color:text0, textAlign:'center', marginBottom:32 }}>How Hif AI works</h2>
          <TiltCard style={{ width:'100%', maxWidth:580, borderRadius:20, overflow:'hidden', background:bg2, border:`1px solid ${border}`, boxShadow:isDark?'0 22px 70px rgba(0,0,0,0.6)':'0 11px 44px rgba(0,0,0,0.12)' }}>
            <WinChrome label="hifai.vercel.app" />
            <div style={{ padding:'16px 14px', display:'flex', flexDirection:'column', gap:13, minHeight:220 }}>
              {[
                { user:true, content:'Explain how photosynthesis works 🌿' },
                { user:false, content:<><strong style={{color:'#6e97ff'}}>Photosynthesis</strong> converts light → food.<br/><span style={{color:text2}}>🌱 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂</span></> },
                { user:true, content:'Write a Python example' },
                { user:false, isCode:true },
              ].map((msg,i) => (
                <div key={i} style={{ display:'flex', justifyContent:msg.user?'flex-end':'flex-start', gap:7, opacity:0, animation:`lp-msg-in .4s ${[0.3,1.2,2.4,3.5][i]}s ease forwards` }}>
                  {!msg.user && <div style={{ width:24,height:24,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,#7b4cd4,#4d7cff)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden' }}><img src="/favi-bg.png" alt="" loading="lazy" style={{width:15,height:15,objectFit:'contain'}} onError={e=>{e.target.style.display='none';e.target.parentElement.innerHTML+='🤖';}}/></div>}
                  {msg.isCode
                    ? <div style={{ borderRadius:'13px 13px 13px 4px', overflow:'hidden', border:`1px solid ${border}`, maxWidth:'85%', background:isDark?'#06080f':'#1a1f35' }}>
                        <div style={{ padding:'4px 10px', background:isDark?'#0d1120':'#111628', borderBottom:`1px solid ${border}`, fontSize:9, color:'#8892b0', fontFamily:'monospace' }}>python</div>
                        <pre style={{ margin:0, padding:'9px 11px', fontSize:11, lineHeight:1.7, fontFamily:"'JetBrains Mono',monospace", overflowX:'auto', color:'#c8d0e8' }}>{`def photosynthesis(co2, h2o, light):
    if light:
        return co2 * h2o, co2 * 6
    return 0, 0`}</pre>
                      </div>
                    : <div style={{ padding:'8px 12px', borderRadius:msg.user?'14px 14px 4px 14px':'14px 14px 14px 4px', background:msg.user?'linear-gradient(135deg,#2d4fd4,#1e3fa8)':isDark?'#111628':'#f0f2f8', border:msg.user?'none':`1px solid ${border}`, color:msg.user?'#e8eeff':text1, fontSize:13, lineHeight:1.65, maxWidth:'84%' }}>{msg.content}</div>
                  }
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderTop:`1px solid ${border}`, background:isDark?'#0a0d18':'#eceef5' }}>
              <div style={{ flex:1, padding:'8px 11px', borderRadius:9, fontSize:12, color:text3, background:bg2, border:`1px solid ${border}`, minWidth:0 }}>Ask anything… <span className="lp-cursor"/></div>
              <div style={{ width:30,height:30,borderRadius:8,background:'#4d7cff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </TiltCard>
        </section>

        {/* ══════════ GLOBE ══════════ */}
        <section className="lp-section" style={{ padding:'60px 20px', display:'flex', flexDirection:'column', alignItems:'center', overflow:'hidden' }}>
          <span className="lp-sec-label lp-reveal">Powered by AI</span>
          <h2 className="lp-sec-h2 lp-reveal" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,5vw,40px)', fontWeight:700, letterSpacing:'-0.02em', color:text0, textAlign:'center', marginBottom:14 }}>Knowledge has no borders</h2>
          <p className="lp-reveal" style={{ fontSize:'clamp(12px,2vw,15px)', color:text2, textAlign:'center', marginBottom:36, maxWidth:440 }}>Ask in any language, get answers instantly. Hif AI is built for students everywhere.</p>
          <motion.div className="lp-reveal lp-globe-wrap" style={{ width:'100%', position:'relative' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', zIndex:0, background:'radial-gradient(circle,rgba(77,124,255,0.18) 0%,transparent 70%)', filter:'blur(28px)' }}/>
            <div style={{ position:'relative', zIndex:1, width:'100%', height:'100%' }}><Globe3D isDark={isDark} /></div>
            {[
              { text:'🇧🇩 বাংলা',   top:'6%',   left:'8%',   color:'#4d7cff' },
              { text:'🇺🇸 English', top:'6%',   right:'8%',  color:'#00d4e8' },
              { text:'📐 Math',     top:'44%',  left:'-1%',  color:'#fbbf24' },
              { text:'💻 Code',     top:'44%',  right:'-1%', color:'#9f7aea' },
              { text:'🔬 Science',  bottom:'6%',left:'10%',  color:'#4ade80' },
              { text:'📖 History',  bottom:'6%',right:'10%', color:'#f472b6' },
            ].map((l,i) => (
              <motion.div key={l.text} className="lp-globe-label"
                initial={{opacity:0,scale:0.7}} animate={{opacity:1,scale:1}} transition={{delay:1.2+i*0.15,type:'spring',stiffness:300,damping:20}}
                style={{ position:'absolute', ...l, padding:'4px 9px', borderRadius:100, background:isDark?'rgba(13,17,32,0.92)':'rgba(255,255,255,0.96)', border:`1px solid ${l.color}44`, fontSize:11, fontWeight:600, color:l.color, boxShadow:`0 4px 14px ${l.color}22`, whiteSpace:'nowrap', zIndex:2, animation:`lp-float-${i%2===0?'a':'b'} ${6+i}s ease-in-out infinite` }}
              >{l.text}</motion.div>
            ))}
          </motion.div>
        </section>

        {/* ══════════ VIDEO DEMO ══════════ */}
        <section className="lp-section" style={{ padding:'60px 20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <span className="lp-sec-label lp-reveal">Watch how it works</span>
          <h2 className="lp-sec-h2 lp-reveal" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,5vw,40px)', fontWeight:700, letterSpacing:'-0.02em', color:text0, textAlign:'center', marginBottom:36 }}>Ask. Learn. Repeat.</h2>
          <div className="lp-reveal" style={{ width:'100%', maxWidth:740, borderRadius:18, overflow:'hidden', boxShadow:isDark?'0 28px 70px rgba(0,0,0,0.7)':'0 14px 44px rgba(0,0,0,0.15)', border:`1px solid ${border}` }}>
            <div style={{ background:isDark?'#080a12':'#1a1f35', padding:'8px 13px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {['#f87171','#fbbf24','#4ade80'].map((c,i)=><span key={i} style={{width:8,height:8,borderRadius:'50%',background:c,display:'inline-block'}}/>)}
              <div style={{ flex:1, height:17, marginLeft:6, background:'rgba(255,255,255,0.06)', borderRadius:5, display:'flex', alignItems:'center', paddingLeft:7 }}>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>hifai.vercel.app</span>
              </div>
            </div>
            <div className="lp-demo-vidwin" style={{ background:isDark?'#08091a':'#f0f2f8', display:'flex', overflow:'hidden' }}>
              {/* Sidebar — hidden on mobile */}
              <div className="lp-demo-sidebar" style={{ width:50, background:isDark?'#06080f':'#e8eeff', borderRight:`1px solid ${border}`, flexDirection:'column', alignItems:'center', paddingTop:13, gap:11, flexShrink:0 }}>
                {['💬','📝','📅','🍅','🎮','✏️'].map((ic,i) => (
                  <div key={i} style={{ width:30,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,background:i===0?'rgba(77,124,255,0.2)':'transparent',border:i===0?'1px solid rgba(77,124,255,0.4)':'none' }}>{ic}</div>
                ))}
              </div>
              {/* Chat */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
                <div style={{ padding:'8px 13px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:8, background:isDark?'#0a0d1a':'#eceef5', flexShrink:0 }}>
                  <div style={{ width:24,height:24,borderRadius:'50%',background:'linear-gradient(135deg,#4d7cff,#9f7aea)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0 }}>🤖</div>
                  <span style={{ fontSize:12, fontWeight:600, color:text0 }}>Hif AI</span>
                  <span style={{ fontSize:10, color:'#4ade80', marginLeft:'auto', flexShrink:0 }}>● Online</span>
                </div>
                <div style={{ flex:1, padding:'11px', display:'flex', flexDirection:'column', gap:10, overflowY:'hidden' }}>
                  {[
                    { user:true,  c:"What is Newton's second law? 🍎" },
                    { user:false, c:<><strong style={{color:'#6e97ff'}}>Newton's 2nd Law:</strong> F = ma<br/><span style={{color:text2}}>Force = Mass × Acceleration.</span></> },
                    { user:true,  c:'বাংলায় বলো 🇧🇩' },
                    { user:false, c:<><strong style={{color:'#4ade80'}}>নিউটনের ২য় সূত্র:</strong> F = ma<br/><span style={{color:text2}}>বল = ভর × ত্বরণ।</span></> },
                  ].map((msg,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:msg.user?'flex-end':'flex-start', gap:6, opacity:0, animation:`lp-msg-in .5s ${[0.2,1.2,2.8,3.8][i]}s both` }}>
                      {!msg.user && <div style={{ width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#4d7cff,#9f7aea)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0 }}>🤖</div>}
                      <div style={{ padding:'7px 11px', borderRadius:msg.user?'13px 13px 4px 13px':'13px 13px 13px 4px', background:msg.user?'linear-gradient(135deg,#4d7cff,#3a6ae8)':isDark?'#111628':'#ffffff', border:msg.user?'none':`1px solid ${border}`, color:msg.user?'white':text1, fontSize:12, lineHeight:1.6, maxWidth:'84%' }}>{msg.c}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:'8px 10px', borderTop:`1px solid ${border}`, background:isDark?'#0a0d1a':'#eceef5', display:'flex', gap:7, alignItems:'center', flexShrink:0 }}>
                  <div style={{ flex:1, padding:'7px 10px', borderRadius:8, background:isDark?'#111628':'#ffffff', border:`1px solid ${border}`, fontSize:12, color:text3, minWidth:0 }}>Ask anything… <span className="lp-cursor"/></div>
                  <div style={{ width:28,height:28,borderRadius:8,background:'#4d7cff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background:isDark?'#080a12':'#1a1f35', padding:'8px 13px', display:'flex', alignItems:'center', gap:9 }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'monospace', flexShrink:0 }}>0:04</span>
              <div style={{ flex:1, height:3, borderRadius:2, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                <div style={{ height:'100%', background:'#4d7cff', borderRadius:2, animation:'lp-bar 8s linear infinite' }}/>
              </div>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'monospace', flexShrink:0 }}>0:08</span>
              <span style={{ fontSize:13 }}>🔊</span>
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES GRID ══════════ */}
        <section className="lp-section" style={{ padding:'60px 20px', maxWidth:1040, margin:'0 auto' }}>
          <span className="lp-sec-label lp-reveal">Why students love it</span>
          <h2 className="lp-sec-h2 lp-reveal" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,5vw,40px)', fontWeight:700, letterSpacing:'-0.02em', color:text0, textAlign:'center', marginBottom:36 }}>Everything you need to learn</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:13 }}>
            {FEATURES.map((f,i) => (
              <div key={f.title} className="lp-reveal" style={{ transitionDelay:`${i*0.07}s`, background:bg2, border:`1px solid ${border}`, borderRadius:16, padding:'22px 20px', transition:'transform .2s' }}
                onMouseEnter={e => !isMobile && (e.currentTarget.style.transform='translateY(-4px)')}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >
                <div style={{ width:42,height:42,borderRadius:11,marginBottom:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,background:f.bg,border:`1px solid ${f.color}33` }}>{f.emoji}</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:text0, marginBottom:6 }}>{f.title}</div>
                <div style={{ fontSize:13, lineHeight:1.75, color:text2 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ FEATURE DEMOS ══════════ */}
        <section className="lp-section" style={{ padding:'60px 20px' }}>
          <span className="lp-sec-label lp-reveal">Built-in tools</span>
          <h2 className="lp-sec-h2 lp-reveal" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,5vw,40px)', fontWeight:700, letterSpacing:'-0.02em', color:text0, textAlign:'center', marginBottom:44 }}>More than just a chatbot</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:36, maxWidth:840, margin:'0 auto' }}>

            {/* ── Quick Notes ── */}
            <div className="lp-reveal lp-feature-row">
              <div>
                <div style={{ fontSize:11,color:'#fbbf24',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:7 }}>📝 Quick Notes</div>
                <h3 style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(17px,3.5vw,24px)',fontWeight:700,color:text0,marginBottom:9,lineHeight:1.25 }}>Save anything,<br/>find it instantly</h3>
                <p style={{ fontSize:13,color:text2,lineHeight:1.8,margin:0 }}>Create colour-coded notes with tags, pin important ones to the top, and search across all your notes in one click.</p>
              </div>
              <TiltCard className="lp-demo-win" style={{ background:bg2, border:`1px solid ${border}`, borderRadius:13, overflow:'hidden', boxShadow:isDark?'0 12px 40px rgba(0,0,0,0.5)':'0 6px 24px rgba(0,0,0,0.1)' }}>
                <WinChrome label="📝 Quick Notes" />
                <div className="lp-notes-grid" style={{ padding:11, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    {title:'Photosynthesis',tag:'Science',    color:'#4ade80',bg:'rgba(74,222,128,0.1)', pinned:true},
                    {title:'Python loops',  tag:'Programming',color:'#4d7cff',bg:'rgba(77,124,255,0.1)',pinned:false},
                    {title:'Algebra notes', tag:'Math',       color:'#fbbf24',bg:'rgba(251,191,36,0.1)',pinned:false},
                    {title:'Essay draft',   tag:'English',    color:'#f472b6',bg:'rgba(244,114,182,0.1)',pinned:false},
                  ].map((n,i) => (
                    <div key={i} style={{ background:n.bg,border:`1px solid ${n.color}33`,borderRadius:8,padding:'8px 9px',animation:`lp-note-in .4s ${i*0.1+0.2}s both` }}>
                      {n.pinned && <div style={{ fontSize:8,color:n.color,marginBottom:3,fontWeight:700 }}>📌 PINNED</div>}
                      <div style={{ fontSize:11,fontWeight:600,color:text0,marginBottom:5 }}>{n.title}</div>
                      <span style={{ fontSize:9,padding:'2px 6px',borderRadius:100,background:n.bg,color:n.color,border:`1px solid ${n.color}44` }}>{n.tag}</span>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </div>

            {/* ── Pomodoro ── */}
            <div className="lp-reveal lp-feature-row">
              <TiltCard className="lp-demo-win" style={{ background:bg2, border:`1px solid ${border}`, borderRadius:13, overflow:'hidden', boxShadow:isDark?'0 12px 40px rgba(0,0,0,0.5)':'0 6px 24px rgba(0,0,0,0.1)' }}>
                <WinChrome label="🍅 Pomodoro Timer" />
                <div style={{ padding:16, textAlign:'center' }}>
                  <div style={{ position:'relative',width:104,height:104,margin:'0 auto 13px' }}>
                    <svg width="104" height="104" style={{ transform:'rotate(-90deg)' }}>
                      <circle cx="52" cy="52" r="44" fill="none" stroke={isDark?'#1e2740':'#e4e7f2'} strokeWidth="7"/>
                      <circle cx="52" cy="52" r="44" fill="none" stroke="#9f7aea" strokeWidth="7" strokeLinecap="round" strokeDasharray="276" strokeDashoffset="80" style={{ animation:'lp-ring 3s ease-in-out infinite alternate' }}/>
                    </svg>
                    <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                      <div style={{ fontFamily:'monospace',fontSize:19,fontWeight:700,color:text0,animation:'lp-tick 1s step-end infinite' }}>23:41</div>
                      <div style={{ fontSize:9,color:'#9f7aea',fontWeight:600 }}>FOCUS</div>
                    </div>
                  </div>
                  <div className="lp-pomo-modes" style={{ display:'flex',gap:5,justifyContent:'center' }}>
                    {['Focus','Short Break','Long Break'].map((m,i) => (
                      <div key={i} className="lp-pomo-mode" style={{ fontSize:10,padding:'3px 8px',borderRadius:100,background:i===0?'rgba(159,122,234,0.15)':isDark?'#1e2740':'#e4e7f2',color:i===0?'#9f7aea':text3,border:`1px solid ${i===0?'rgba(159,122,234,0.4)':border}` }}>{m}</div>
                    ))}
                  </div>
                  <div style={{ display:'flex',gap:6,justifyContent:'center',marginTop:9 }}>
                    {[0,1,2,3].map(i => <div key={i} style={{ width:7,height:7,borderRadius:'50%',background:i<2?'#9f7aea':isDark?'#1e2740':'#e4e7f2' }}/>)}
                  </div>
                </div>
              </TiltCard>
              <div>
                <div style={{ fontSize:11,color:'#9f7aea',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:7 }}>🍅 Pomodoro Timer</div>
                <h3 style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(17px,3.5vw,24px)',fontWeight:700,color:text0,marginBottom:9,lineHeight:1.25 }}>Focus deeper,<br/>rest smarter</h3>
                <p style={{ fontSize:13,color:text2,lineHeight:1.8,margin:0 }}>25-minute focus sessions with automatic short & long breaks. Sound alerts, session dots, and customizable durations.</p>
              </div>
            </div>

            {/* ── Study Planner ── */}
            <div className="lp-reveal lp-feature-row">
              <div>
                <div style={{ fontSize:11,color:'#4ade80',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:7 }}>📅 Study Planner</div>
                <h3 style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(17px,3.5vw,24px)',fontWeight:700,color:text0,marginBottom:9,lineHeight:1.25 }}>Track goals,<br/>build streaks</h3>
                <p style={{ fontSize:13,color:text2,lineHeight:1.8,margin:0 }}>Set daily goals and topics by subject. Watch your streak grow every day you study. Weekly activity strip keeps you accountable.</p>
              </div>
              <TiltCard className="lp-demo-win" style={{ background:bg2,border:`1px solid ${border}`,borderRadius:13,overflow:'hidden',boxShadow:isDark?'0 12px 40px rgba(0,0,0,0.5)':'0 6px 24px rgba(0,0,0,0.1)' }}>
                <WinChrome label="📅 Study Planner" />
                <div style={{ padding:11 }}>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:9,flexWrap:'wrap',gap:5 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                      <span style={{ fontSize:15,animation:'lp-flame 1.5s ease-in-out infinite' }}>🔥</span>
                      <span style={{ fontFamily:'monospace',fontSize:17,fontWeight:800,color:'#fb923c' }}>7</span>
                      <span style={{ fontSize:10,color:text3 }}>day streak</span>
                    </div>
                    <div style={{ display:'flex',gap:3 }}>
                      {['S','M','T','W','T','F','S'].map((d,i) => (
                        <div key={i} style={{ width:19,height:19,borderRadius:5,background:i<6?'linear-gradient(135deg,#4d7cff,#7b4cd4)':isDark?'#1e2740':'#e4e7f2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:i<6?'white':text3,fontWeight:600 }}>{d}</div>
                      ))}
                    </div>
                  </div>
                  {[{text:'Finish Chapter 5',done:true},{text:'Practice equations',done:true},{text:'Read History notes',done:false}].map((g,i) => (
                    <div key={i} style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 8px',borderRadius:7,background:g.done?(isDark?'rgba(74,222,128,0.06)':'rgba(74,222,128,0.04)'):isDark?'#111628':'#f5f6fb',border:`1px solid ${g.done?'rgba(74,222,128,0.2)':border}`,marginBottom:5,animation:`lp-note-in .4s ${i*0.12+0.2}s both` }}>
                      <span style={{ fontSize:12 }}>{g.done?'✅':'⭕'}</span>
                      <span style={{ fontSize:11,color:g.done?text3:text1,textDecoration:g.done?'line-through':'none' }}>{g.text}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:8,height:3,borderRadius:2,background:isDark?'#1e2740':'#e4e7f2',overflow:'hidden' }}>
                    <div style={{ height:'100%',width:'67%',borderRadius:2,background:'linear-gradient(90deg,#4ade80,#4d7cff)',animation:'lp-bar 2s ease-out both' }}/>
                  </div>
                  <div style={{ fontSize:9,color:text3,marginTop:3 }}>2 / 3 goals complete</div>
                </div>
              </TiltCard>
            </div>

            {/* ── Game Hub ── */}
            <div className="lp-reveal lp-feature-row">
              <TiltCard className="lp-demo-win" style={{ background:bg2,border:`1px solid ${border}`,borderRadius:13,overflow:'hidden',boxShadow:isDark?'0 12px 40px rgba(0,0,0,0.5)':'0 6px 24px rgba(0,0,0,0.1)' }}>
                <WinChrome label="🎮 Math Quiz" />
                <div style={{ padding:13,textAlign:'center' }}>
                  <div style={{ fontSize:10,color:'#f472b6',fontWeight:700,marginBottom:6 }}>Q 4 / 10 · Score: 3</div>
                  <div style={{ height:3,borderRadius:2,background:isDark?'#1e2740':'#e4e7f2',marginBottom:11,overflow:'hidden' }}>
                    <div style={{ height:'100%',width:'40%',background:'#f472b6',borderRadius:2,animation:'lp-bar 1.5s ease-out both' }}/>
                  </div>
                  <div style={{ fontSize:20,fontWeight:800,color:text0,fontFamily:'monospace',marginBottom:11 }}>12 × 8 = ?</div>
                  <div className="lp-quiz-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:7 }}>
                    {[86,96,106,76].map((n,i) => (
                      <div key={i} style={{ padding:'9px',borderRadius:8,fontSize:15,fontWeight:700,fontFamily:'monospace',background:i===1?(isDark?'rgba(74,222,128,0.15)':'rgba(74,222,128,0.1)'):isDark?'#111628':'#f0f2f8',border:`2px solid ${i===1?'#4ade80':border}`,color:i===1?'#4ade80':text1,animation:i===1?'lp-correct .5s .8s both':'none' }}>{n}</div>
                    ))}
                  </div>
                </div>
              </TiltCard>
              <div>
                <div style={{ fontSize:11,color:'#f472b6',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:7 }}>🎮 Game Hub</div>
                <h3 style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(17px,3.5vw,24px)',fontWeight:700,color:text0,marginBottom:9,lineHeight:1.25 }}>Learn through<br/>play</h3>
                <p style={{ fontSize:13,color:text2,lineHeight:1.8,margin:0 }}>4 educational games — Math Quiz, Word Scramble, Memory Match and True or False. Best scores saved locally.</p>
                <div style={{ display:'flex',gap:6,marginTop:13,flexWrap:'wrap' }}>
                  {['🧮 Math','🔤 Words','🃏 Memory','✅ T or F'].map((g,i) => (
                    <span key={i} style={{ fontSize:11,padding:'4px 9px',borderRadius:100,background:isDark?'#111628':'#eceef5',color:text2,border:`1px solid ${border}` }}>{g}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Whiteboard ── */}
            <div className="lp-reveal lp-feature-row">
              <div>
                <div style={{ fontSize:11,color:'#00d4e8',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:7 }}>✏️ Whiteboard</div>
                <h3 style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(17px,3.5vw,24px)',fontWeight:700,color:text0,marginBottom:9,lineHeight:1.25 }}>Sketch, diagram<br/>& visualize</h3>
                <p style={{ fontSize:13,color:text2,lineHeight:1.8,margin:0 }}>Draw freehand, add shapes and text, undo up to 30 steps, and download your canvas as a PNG. Works on touch too.</p>
              </div>
              <TiltCard className="lp-demo-win" style={{ background:isDark?'#06080f':'#1a1f35',border:`1px solid ${border}`,borderRadius:13,overflow:'hidden',boxShadow:isDark?'0 12px 40px rgba(0,0,0,0.5)':'0 6px 24px rgba(0,0,0,0.1)' }}>
                <div style={{ padding:'7px 11px',background:isDark?'#0a0d18':'#0d1120',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:4 }}>
                  {['✏️','⬜','⭕','➖','🔤'].map((t,i) => (
                    <div key={i} style={{ width:21,height:21,borderRadius:5,background:i===0?'rgba(0,212,232,0.2)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,border:i===0?'1px solid rgba(0,212,232,0.4)':'none' }}>{t}</div>
                  ))}
                  <div style={{ flex:1 }}/>
                  {['#f0f4ff','#4d7cff','#f87171','#fbbf24'].map((c,i) => <div key={i} style={{ width:11,height:11,borderRadius:'50%',background:c,border:'1px solid rgba(255,255,255,0.2)' }}/>)}
                </div>
                <div className="lp-wb-canvas" style={{ position:'relative' }}>
                  <svg width="100%" height="100%" style={{ position:'absolute',inset:0 }}>
                    <path d="M 28 70 Q 70 28 118 70 Q 166 112 210 70" fill="none" stroke="#4d7cff" strokeWidth="2.5" strokeLinecap="round" style={{ strokeDasharray:210,strokeDashoffset:210,animation:'lp-draw 2s ease forwards' }}/>
                    <circle cx="155" cy="90" r="24" fill="none" stroke="#00d4e8" strokeWidth="2" style={{ strokeDasharray:150,strokeDashoffset:150,animation:'lp-draw 1.5s 1s ease forwards' }}/>
                    <text x="155" y="94" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="monospace" style={{ opacity:0,animation:'lp-fade 0.5s 2.2s ease forwards' }}>nucleus</text>
                    <path d="M 33 118 L 105 118" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" style={{ strokeDasharray:72,strokeDashoffset:72,animation:'lp-draw 1s 0.5s ease forwards' }}/>
                    <text x="70" y="112" textAnchor="middle" fill="#f472b6" fontSize="9" fontFamily="monospace" style={{ opacity:0,animation:'lp-fade 0.5s 1.6s ease forwards' }}>wave</text>
                  </svg>
                </div>
              </TiltCard>
            </div>

          </div>
        </section>

        {/* ══════════ STATS ══════════ */}
        <section className="lp-section" style={{ padding:'60px 20px', textAlign:'center' }}>
          <span className="lp-sec-label lp-reveal">The numbers</span>
          <h2 className="lp-sec-h2 lp-reveal" style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(22px,5vw,40px)',fontWeight:700,letterSpacing:'-0.02em',color:text0,textAlign:'center',marginBottom:36 }}>Built for students like you</h2>
          <div className="lp-stat-grid">
            {STATS.map((s,i) => (
              <div key={s.label} className="lp-reveal lp-stat-card" style={{ transitionDelay:`${i*0.08}s`, background:bg2, border:`1px solid ${border}` }}>
                <div className="lp-stat-num">{s.num}</div>
                <div style={{ fontSize:12,color:text2,fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section className="lp-section" style={{ padding:'60px 20px' }}>
          <span className="lp-sec-label lp-reveal">What students say</span>
          <h2 className="lp-sec-h2 lp-reveal" style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(22px,5vw,40px)',fontWeight:700,letterSpacing:'-0.02em',color:text0,textAlign:'center',marginBottom:36 }}>Real feedback</h2>
          <div className="lp-testi-grid">
            {TESTIMONIALS.map((t,i) => (
              <div key={t.name} className="lp-reveal" style={{ transitionDelay:`${i*0.1}s`,background:bg2,border:`1px solid ${border}`,borderRadius:16,padding:'20px 18px' }}>
                <div style={{ fontSize:24,color:'#6e97ff',fontFamily:'Georgia,serif',lineHeight:1,marginBottom:11 }}>"</div>
                <div style={{ fontSize:13,lineHeight:1.8,color:text2,marginBottom:16,fontStyle:'italic' }}>{t.quote}</div>
                <div style={{ display:'flex',alignItems:'center',gap:9 }}>
                  <div style={{ width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,flexShrink:0,background:t.bg,color:t.color,fontFamily:'Syne,sans-serif' }}>{t.init}</div>
                  <div>
                    <div style={{ fontSize:12,fontWeight:600,color:text0 }}>{t.name}</div>
                    <div style={{ fontSize:11,color:text3,marginTop:2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ FAQ ══════════ */}
        <section className="lp-section" style={{ padding:'60px 20px' }}>
          <span className="lp-sec-label lp-reveal">Got questions?</span>
          <h2 className="lp-sec-h2 lp-reveal" style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(22px,5vw,40px)',fontWeight:700,letterSpacing:'-0.02em',color:text0,textAlign:'center',marginBottom:28 }}>Frequently asked</h2>
          <div style={{ maxWidth:680,margin:'0 auto',display:'flex',flexDirection:'column',gap:8 }}>
            {FAQS.map((faq,i) => {
              const open = faqOpen === i;
              return (
                <div key={i} className="lp-reveal" style={{ transitionDelay:`${i*0.05}s` }}>
                  <div onClick={() => setFaqOpen(open?null:i)} style={{ background:open?bg2:bg3,border:`1px solid ${open?'rgba(77,124,255,0.3)':border}`,borderRadius:13,overflow:'hidden',cursor:'pointer',transition:'border-color .2s,background .2s' }}>
                    <div className="lp-faq-row" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 16px',gap:10 }}>
                      <span className="lp-faq-q" style={{ fontSize:14,fontWeight:600,color:open?text0:text1,fontFamily:"'DM Sans',sans-serif",flex:1,lineHeight:1.4 }}>{faq.q}</span>
                      <motion.span animate={{rotate:open?45:0}} transition={{duration:0.2}} style={{ flexShrink:0,width:20,height:20,borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',background:open?'rgba(77,124,255,0.2)':border,color:open?'#6e97ff':text3,fontSize:16,lineHeight:1,fontWeight:300 }}>+</motion.span>
                    </div>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25,ease:[0.23,1,0.32,1]}} style={{overflow:'hidden'}}>
                          <p style={{ padding:'0 16px 15px',paddingTop:11,margin:0,fontSize:13,lineHeight:1.8,color:text2,borderTop:`1px solid ${border}` }}>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="lp-section" style={{ padding:'60px 16px',display:'flex',justifyContent:'center' }}>
          <div className="lp-reveal lp-final-cta" style={{ maxWidth:640,width:'100%',textAlign:'center',background:isDark?'linear-gradient(135deg,rgba(77,124,255,0.08),rgba(0,212,232,0.06))':'linear-gradient(135deg,rgba(77,124,255,0.06),rgba(0,212,232,0.04))',border:'1px solid rgba(77,124,255,0.2)',borderRadius:22,padding:'48px 28px' }}>
            <h2 style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(20px,5vw,42px)',fontWeight:800,color:text0,marginBottom:12,letterSpacing:'-0.02em',lineHeight:1.15 }}>
              Start learning today.<br/>It's completely free.
            </h2>
            <p style={{ fontSize:'clamp(13px,2vw,15px)',color:text2,marginBottom:30,lineHeight:1.65 }}>No signup. No credit card. No limits.<br/>Just ask your first question.</p>
            <div className="lp-final-btns" style={{ display:'flex',gap:11,justifyContent:'center',flexWrap:'wrap' }}>
              <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.96}} onClick={onEnter} className="lp-cta-btn" style={{fontSize:15}}>
                Open Hif AI
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
              <motion.button whileHover={{scale:1.06,y:-2}} whileTap={{scale:0.94}} onClick={handleShare}
                style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7,padding:'12px 20px',borderRadius:13,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",background:shared?'linear-gradient(135deg,#4ade80,#16a34a)':'linear-gradient(135deg,#f472b6,#db2777)',color:shared?'#0a1a0f':'white',boxShadow:'0 4px 20px rgba(244,114,182,0.35)',transition:'background 0.3s',whiteSpace:'nowrap' }}
              >
                {shared
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share</>
                }
              </motion.button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ textAlign:'center',padding:'22px 16px 36px',borderTop:`1px solid ${border}`,fontSize:12,color:text3,lineHeight:1.9 }}>
          <span style={{ color:'#6e97ff',fontWeight:700 }}>Hif AI</span>{' '}— আপনার বন্ধু, আপনার শিক্ষক
          <span style={{ margin:'0 5px' }}>·</span>Free forever
          <span style={{ margin:'0 5px' }}>·</span>No login needed
          <span style={{ margin:'0 5px' }}>·</span>Built with ❤️ for students
        </footer>
      </div>

      {/* ══════════ INSTALL BUTTON ══════════ */}
      <AnimatePresence>
        {canInstall && !isInstalled && (
          <motion.div
            initial={{opacity:0,scale:0.6,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.6,y:20}}
            transition={{type:'spring',stiffness:340,damping:22,delay:1.2}}
            style={{ position:'fixed',bottom:18,right:14,zIndex:100,display:'flex',flexDirection:'column',borderRadius:13,overflow:'hidden',boxShadow:'0 4px 28px rgba(74,222,128,0.45),0 0 0 1px rgba(74,222,128,0.2)' }}
          >
            <motion.button
              whileHover={!installing?{scale:1.03}:{}} whileTap={!installing?{scale:0.96}:{}}
              onClick={handleInstall} disabled={installing}
              style={{ display:'flex',alignItems:'center',gap:7,padding:'11px 17px',border:'none',cursor:installing?'default':'pointer',fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",background:'linear-gradient(135deg,#4ade80,#16a34a)',color:'#0a1a0f' }}
            >
              <AnimatePresence mode="wait">
                {installing
                  ? <motion.span key="spin" initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} exit={{opacity:0}} style={{display:'flex'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'lp-spin 1s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    </motion.span>
                  : <motion.span key="dl" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{display:'flex'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </motion.span>
                }
              </AnimatePresence>
              {installing?'Installing…':'Install App'}
            </motion.button>
            <AnimatePresence>
              {installing && (
                <motion.div initial={{height:0}} animate={{height:4}} exit={{height:0}} style={{background:'#0a1a0f',overflow:'hidden'}}>
                  <motion.div animate={{width:`${progress}%`}} transition={{duration:0.3,ease:'easeOut'}} style={{ height:'100%',background:progress===100?'#4d7cff':'linear-gradient(90deg,#16a34a,#86efac)',borderRadius:2 }}/>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}