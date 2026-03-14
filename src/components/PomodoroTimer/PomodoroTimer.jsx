import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Settings, Check, Volume2, VolumeX } from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────────────── */
const MODES = {
  focus:       { label: 'Focus',        color: '#4d7cff', dim: 'rgba(77,124,255,0.15)',  defaultMins: 25 },
  shortBreak:  { label: 'Short Break',  color: '#4ade80', dim: 'rgba(74,222,128,0.12)', defaultMins: 5  },
  longBreak:   { label: 'Long Break',   color: '#9f7aea', dim: 'rgba(159,122,234,0.12)',defaultMins: 15 },
};

const STORAGE_KEY = 'hifai-pomodoro';

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      focusMins:      s.focusMins      ?? 25,
      shortBreakMins: s.shortBreakMins ?? 5,
      longBreakMins:  s.longBreakMins  ?? 15,
      sessionsCount:  s.sessionsCount  ?? 0,
      soundEnabled:   s.soundEnabled   ?? true,
    };
  } catch { return { focusMins: 25, shortBreakMins: 5, longBreakMins: 15, sessionsCount: 0, soundEnabled: true }; }
}

function saveSettings(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

/* ─── Beep via Web Audio API ────────────────────────────────────────── */
function playBeep(type = 'done') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = type === 'done' ? [523, 659, 784] : [392, 330];
    freqs.forEach((f, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.35);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime  + i * 0.18 + 0.36);
    });
  } catch {}
}

/* ─── SVG circular progress ring ───────────────────────────────────── */
function Ring({ pct, color, size = 220 }) {
  const r    = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct);
  const cx   = size / 2;
  const cy   = size / 2;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-4)" strokeWidth={10} />
      {/* Progress */}
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: dash }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
      />
    </svg>
  );
}

/* ─── Settings Panel ────────────────────────────────────────────────── */
function SettingsPanel({ settings, onChange, onClose }) {
  const [local, setLocal] = useState({ ...settings });

  const save = () => { onChange(local); onClose(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{    opacity: 0, y: 10, scale: 0.97  }}
      transition={{ duration: 0.22 }}
      className="absolute top-12 right-0 z-30 rounded-2xl p-5 w-64"
      style={{
        background: 'var(--bg-3)',
        border: '1px solid var(--border-2)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <p className="text-xs font-bold mb-4 uppercase tracking-widest" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-head)' }}>
        Timer Settings
      </p>

      {[
        { key: 'focusMins',      label: 'Focus (min)',       min: 1, max: 90 },
        { key: 'shortBreakMins', label: 'Short Break (min)', min: 1, max: 30 },
        { key: 'longBreakMins',  label: 'Long Break (min)',  min: 1, max: 60 },
      ].map(f => (
        <div key={f.key} className="mb-3">
          <label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>{f.label}</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={f.min} max={f.max}
              value={local[f.key]}
              onChange={e => setLocal(l => ({ ...l, [f.key]: +e.target.value }))}
              className="flex-1 accent-[var(--accent)]"
              style={{ accentColor: 'var(--accent)' }}
            />
            <span className="text-xs w-7 text-right" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
              {local[f.key]}
            </span>
          </div>
        </div>
      ))}

      <motion.button
        onClick={save}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="w-full mt-2 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
        style={{ background: 'var(--accent)', color: 'white', border: 'none', boxShadow: '0 2px 12px rgba(77,124,255,0.35)' }}
      >
        <Check size={13} /> Save & Reset
      </motion.button>
    </motion.div>
  );
}

/* ─── PomodoroTimer ─────────────────────────────────────────────────── */
export default function PomodoroTimer({ onClose }) {
  const [settings,     setSettings]     = useState(loadSettings);
  const [mode,         setMode]         = useState('focus');
  const [running,      setRunning]      = useState(false);
  const [secondsLeft,  setSecondsLeft]  = useState(() => loadSettings().focusMins * 60);
  const [sessions,     setSessions]     = useState(() => loadSettings().sessionsCount);
  const [showSettings, setShowSettings] = useState(false);
  const [justFinished, setJustFinished] = useState(false);

  const intervalRef = useRef(null);
  const modeData    = MODES[mode];

  const totalSeconds = (
    mode === 'focus'      ? settings.focusMins      :
    mode === 'shortBreak' ? settings.shortBreakMins :
                            settings.longBreakMins
  ) * 60;

  const pct = secondsLeft / totalSeconds;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  /* Auto-advance when timer hits zero */
  const handleFinish = useCallback(() => {
    setRunning(false);
    setJustFinished(true);
    setTimeout(() => setJustFinished(false), 2000);
    if (settings.soundEnabled) playBeep('done');

    if (mode === 'focus') {
      const newCount = sessions + 1;
      setSessions(newCount);
      saveSettings({ ...settings, sessionsCount: newCount });
      // Every 4 sessions → long break
      const nextMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setSecondsLeft((nextMode === 'longBreak' ? settings.longBreakMins : settings.shortBreakMins) * 60);
    } else {
      setMode('focus');
      setSecondsLeft(settings.focusMins * 60);
    }
  }, [mode, sessions, settings]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { clearInterval(intervalRef.current); handleFinish(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, handleFinish]);

  /* Switch mode manually */
  const switchMode = (m) => {
    setRunning(false);
    setMode(m);
    setSecondsLeft((
      m === 'focus' ? settings.focusMins :
      m === 'shortBreak' ? settings.shortBreakMins :
      settings.longBreakMins
    ) * 60);
  };

  /* Reset */
  const reset = () => {
    setRunning(false);
    setSecondsLeft(totalSeconds);
  };

  /* Apply new settings */
  const applySettings = (s) => {
    setSettings(s);
    saveSettings({ ...s, sessionsCount: sessions });
    setRunning(false);
    setSecondsLeft((
      mode === 'focus' ? s.focusMins :
      mode === 'shortBreak' ? s.shortBreakMins :
      s.longBreakMins
    ) * 60);
    setShowSettings(false);
  };

  /* Update document title while running */
  useEffect(() => {
    if (running) document.title = `${mins}:${secs} — ${modeData.label} | Hif AI`;
    else document.title = 'Hif AI';
    return () => { document.title = 'Hif AI'; };
  }, [running, mins, secs, modeData.label]);

  return (
    <motion.div
      className="flex-1 overflow-y-auto flex flex-col items-center"
      style={{ background: 'var(--bg-1)', padding: '28px 20px 40px' }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="w-full max-w-md">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(77,124,255,0.15), rgba(159,122,234,0.12))',
                border: '1px solid var(--border-2)',
              }}
            >
              🍅
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
                Pomodoro Timer
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {sessions} session{sessions !== 1 ? 's' : ''} completed today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Sound toggle */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                const s = { ...settings, soundEnabled: !settings.soundEnabled };
                setSettings(s);
                saveSettings({ ...s, sessionsCount: sessions });
              }}
              className="icon-btn"
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            >
              {settings.soundEnabled
                ? <Volume2  size={16} />
                : <VolumeX  size={16} />
              }
            </motion.button>

            {/* Settings */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setShowSettings(o => !o)}
                className="icon-btn"
                style={{ background: showSettings ? 'var(--accent-dim)' : undefined, color: showSettings ? 'var(--accent-light)' : undefined }}
              >
                <Settings size={16} />
              </motion.button>
              <AnimatePresence>
                {showSettings && (
                  <SettingsPanel
                    settings={settings}
                    onChange={applySettings}
                    onClose={() => setShowSettings(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.button onClick={onClose} whileTap={{ scale: 0.88 }} className="icon-btn">
              <X size={17} />
            </motion.button>
          </div>
        </div>

        {/* ── Mode tabs ── */}
        <motion.div
          className="flex gap-2 justify-center mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {Object.entries(MODES).map(([key, m]) => (
            <motion.button
              key={key}
              onClick={() => switchMode(key)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: mode === key ? m.dim : 'var(--bg-3)',
                color:      mode === key ? m.color : 'var(--text-3)',
                border:     `1px solid ${mode === key ? m.color + '50' : 'var(--border-1)'}`,
                boxShadow:  mode === key ? `0 0 14px ${m.color}22` : 'none',
              }}
            >
              {m.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Ring + time display ── */}
        <div className="flex flex-col items-center mb-8 relative">

          {/* Finished flash */}
          <AnimatePresence>
            {justFinished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0, scale: 1.2  }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-5xl pointer-events-none"
              >
                {mode === 'focus' ? '🎉' : '💪'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ring */}
          <div className="relative">
            <Ring pct={pct} color={modeData.color} size={220} />

            {/* Center content */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              {/* Mode label */}
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold mb-1 uppercase tracking-widest"
                style={{ color: modeData.color, fontFamily: 'var(--font-head)' }}
              >
                {modeData.label}
              </motion.p>

              {/* Time */}
              <motion.div
                key={`${mins}:${secs}`}
                className="font-bold tabular-nums"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 52,
                  color: 'var(--text-0)',
                  letterSpacing: '-2px',
                  lineHeight: 1,
                }}
              >
                {mins}
                <motion.span
                  animate={{ opacity: running ? [1, 0.3, 1] : 1 }}
                  transition={{ duration: 1, repeat: running ? Infinity : 0, ease: 'linear' }}
                >
                  :
                </motion.span>
                {secs}
              </motion.div>

              {/* Session dots */}
              <div className="flex gap-1.5 mt-3">
                {[0,1,2,3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: i < (sessions % 4) ? 1 : 0.7 }}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: i < (sessions % 4) ? modeData.color : 'var(--bg-5)',
                      boxShadow: i < (sessions % 4) ? `0 0 6px ${modeData.color}88` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center justify-center gap-4">
          {/* Reset */}
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9  }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border-2)',
              color: 'var(--text-3)',
            }}
          >
            <RotateCcw size={16} />
          </motion.button>

          {/* Play / Pause */}
          <motion.button
            onClick={() => setRunning(r => !r)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            animate={running ? {} : { scale: [1, 1.04, 1] }}
            transition={running ? {} : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${modeData.color}, ${modeData.color}cc)`,
              border: 'none',
              boxShadow: `0 4px 24px ${modeData.color}55`,
              color: 'white',
            }}
          >
            <AnimatePresence mode="wait">
              {running ? (
                <motion.div key="pause"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 30 }}
                  transition={{ duration: 0.18 }}
                >
                  <Pause size={24} />
                </motion.div>
              ) : (
                <motion.div key="play"
                  initial={{ scale: 0, rotate: 30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -30 }}
                  transition={{ duration: 0.18 }}
                >
                  <Play size={24} style={{ marginLeft: 3 }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Skip to next */}
          <motion.button
            onClick={handleFinish}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9  }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border-2)',
              color: 'var(--text-3)',
              fontFamily: 'var(--font-head)',
            }}
            title="Skip to next"
          >
            ⏭
          </motion.button>
        </div>

        {/* ── Info strip ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] mt-8"
          style={{ color: 'var(--text-4)' }}
        >
          Every 4 focus sessions → long break · Settings persist across sessions
        </motion.p>
      </div>
    </motion.div>
  );
}