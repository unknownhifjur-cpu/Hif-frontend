import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, CheckCircle2, Circle,
  Flame, Target, BookOpen, Trophy, ChevronDown, Calendar,
} from 'lucide-react';

/* ─── localStorage helpers ──────────────────────────────────────────── */
const STORAGE_KEY = 'hifai-study-planner';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getDefaultData() {
  return {
    streak: 0,
    lastActiveDate: '',
    goals: [],           // { id, text, done, date }
    topics: [],          // { id, text, subject, done, date }
    weekLog: {},         // { "YYYY-MM-DD": true }
  };
}

/* ─── Subject colours ───────────────────────────────────────────────── */
const SUBJECT_COLORS = {
  Math:        { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
  Science:     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)' },
  Programming: { color: '#4d7cff', bg: 'rgba(77,124,255,0.1)', border: 'rgba(77,124,255,0.25)' },
  English:     { color: '#f472b6', bg: 'rgba(244,114,182,0.1)',border: 'rgba(244,114,182,0.25)' },
  History:     { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' },
  General:     { color: '#9f7aea', bg: 'rgba(159,122,234,0.1)',border: 'rgba(159,122,234,0.25)' },
};
const SUBJECTS = Object.keys(SUBJECT_COLORS);

/* ─── Week strip (Sun–Sat of this week) ────────────────────────────── */
function WeekStrip({ weekLog }) {
  const days = [];
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + i);
    const key  = d.toISOString().slice(0, 10);
    const isToday = key === todayStr();
    days.push({ key, label: ['S','M','T','W','T','F','S'][i], isToday, done: !!weekLog[key] });
  }
  return (
    <div className="flex gap-2 justify-center">
      {days.map((d, i) => (
        <motion.div
          key={d.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{d.label}</span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: d.done
                ? 'linear-gradient(135deg, #4d7cff, #7b4cd4)'
                : d.isToday
                  ? 'var(--bg-5)'
                  : 'var(--bg-4)',
              border: d.isToday ? '1px solid var(--border-accent)' : '1px solid var(--border-1)',
              boxShadow: d.done ? '0 2px 10px rgba(77,124,255,0.3)' : 'none',
            }}
          >
            {d.done
              ? <CheckCircle2 size={14} style={{ color: 'white' }} />
              : <span className="text-[10px]" style={{ color: d.isToday ? 'var(--accent-light)' : 'var(--text-4)' }}>
                  {new Date(d.key + 'T12:00:00').getDate()}
                </span>
            }
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── CheckItem ─────────────────────────────────────────────────────── */
function CheckItem({ item, onToggle, onDelete, colorMeta }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl group"
      style={{
        background: item.done ? 'var(--bg-2)' : 'var(--bg-3)',
        border: `1px solid ${item.done ? 'var(--border-0)' : 'var(--border-1)'}`,
        opacity: item.done ? 0.6 : 1,
      }}
    >
      <button onClick={() => onToggle(item.id)} className="flex-shrink-0">
        <AnimatePresence mode="wait">
          {item.done
            ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-light)' }} />
              </motion.div>
            : <motion.div key="circle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Circle size={18} style={{ color: 'var(--text-3)' }} />
              </motion.div>
          }
        </AnimatePresence>
      </button>

      <span
        className="flex-1 text-sm"
        style={{
          color: item.done ? 'var(--text-3)' : 'var(--text-1)',
          textDecoration: item.done ? 'line-through' : 'none',
          fontFamily: 'var(--font-ui)',
        }}
      >
        {item.text}
      </span>

      {colorMeta && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: colorMeta.bg,
            color: colorMeta.color,
            border: `1px solid ${colorMeta.border}`,
          }}
        >
          {item.subject}
        </span>
      )}

      <motion.button
        onClick={() => onDelete(item.id)}
        whileTap={{ scale: 0.85 }}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-3)' }}
      >
        <Trash2 size={13} />
      </motion.button>
    </motion.div>
  );
}

/* ─── Add Row ───────────────────────────────────────────────────────── */
function AddRow({ placeholder, onAdd, withSubject }) {
  const [text,    setText]    = useState('');
  const [subject, setSubject] = useState('General');
  const [open,    setOpen]    = useState(false);
  const inputRef = useRef(null);

  const commit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t, subject);
    setText('');
    setOpen(false);
  };

  return (
    <div className="flex gap-2 mt-3">
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && commit()}
        placeholder={placeholder}
        className="flex-1 text-sm outline-none px-3 py-2 rounded-lg"
        style={{
          background: 'var(--bg-4)',
          border: '1px solid var(--border-2)',
          color: 'var(--text-1)',
          fontFamily: 'var(--font-ui)',
          caretColor: 'var(--accent)',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--border-accent)'; }}
        onBlur={e  => { e.target.style.borderColor = 'var(--border-2)'; }}
      />

      {withSubject && (
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1 text-xs px-2 py-2 rounded-lg h-full"
            style={{
              background: SUBJECT_COLORS[subject].bg,
              border: `1px solid ${SUBJECT_COLORS[subject].border}`,
              color: SUBJECT_COLORS[subject].color,
            }}
          >
            {subject} <ChevronDown size={11} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-full mb-1 rounded-xl overflow-hidden z-20"
                style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border-2)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 110,
                }}
              >
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSubject(s); setOpen(false); }}
                    className="w-full text-left text-xs px-3 py-2 transition-colors"
                    style={{
                      color: SUBJECT_COLORS[s].color,
                      background: subject === s ? SUBJECT_COLORS[s].bg : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = SUBJECT_COLORS[s].bg}
                    onMouseLeave={e => e.currentTarget.style.background = subject === s ? SUBJECT_COLORS[s].bg : 'transparent'}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <motion.button
        onClick={commit}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        disabled={!text.trim()}
        className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
        style={{
          background: text.trim() ? 'var(--accent)' : 'var(--bg-5)',
          color: text.trim() ? 'white' : 'var(--text-3)',
          border: 'none',
          boxShadow: text.trim() ? '0 2px 10px rgba(77,124,255,0.35)' : 'none',
          transition: 'all 0.15s',
        }}
      >
        <Plus size={16} />
      </motion.button>
    </div>
  );
}

/* ─── Section Card ──────────────────────────────────────────────────── */
function SectionCard({ title, icon: Icon, iconColor, count, total, children }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-2xl p-5"
      style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}30` }}
          >
            <Icon size={14} style={{ color: iconColor }} />
          </div>
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
            {title}
          </span>
        </div>
        {total > 0 && (
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {count}/{total} · {pct}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-5)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${iconColor}, ${iconColor}99)` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      )}

      {children}
    </motion.div>
  );
}

/* ─── StudyPlanner ──────────────────────────────────────────────────── */
export default function StudyPlanner({ onClose }) {
  const [data, setData] = useState(() => {
    const saved = load();
    if (!saved) return getDefaultData();

    // Update streak on load
    const today = todayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    let { streak, lastActiveDate, weekLog, ...rest } = saved;

    if (lastActiveDate === today) {
      // Already active today, no change
    } else if (lastActiveDate === yStr) {
      // Was active yesterday → continue streak
      streak = (streak || 0) + 1;
      lastActiveDate = today;
      weekLog = { ...weekLog, [today]: true };
    } else if (lastActiveDate !== today) {
      // Missed a day → reset streak
      streak = 1;
      lastActiveDate = today;
      weekLog = { ...weekLog, [today]: true };
    }

    return { streak, lastActiveDate, weekLog, ...rest };
  });

  // Persist on every change
  useEffect(() => { save(data); }, [data]);

  const today = todayStr();

  const todayGoals  = data.goals.filter(g => g.date === today);
  const todayTopics = data.topics.filter(t => t.date === today);
  const doneGoals   = todayGoals.filter(g => g.done).length;
  const doneTopics  = todayTopics.filter(t => t.done).length;

  const uid = () => Math.random().toString(36).slice(2, 9);

  const addGoal = (text) => {
    setData(d => ({ ...d, goals: [...d.goals, { id: uid(), text, done: false, date: today }] }));
  };

  const toggleGoal = (id) => {
    setData(d => ({ ...d, goals: d.goals.map(g => g.id === id ? { ...g, done: !g.done } : g) }));
  };

  const deleteGoal = (id) => {
    setData(d => ({ ...d, goals: d.goals.filter(g => g.id !== id) }));
  };

  const addTopic = (text, subject) => {
    setData(d => ({ ...d, topics: [...d.topics, { id: uid(), text, subject, done: false, date: today }] }));
  };

  const toggleTopic = (id) => {
    setData(d => ({ ...d, topics: d.topics.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  };

  const deleteTopic = (id) => {
    setData(d => ({ ...d, topics: d.topics.filter(t => t.id !== id) }));
  };

  const allDone = todayGoals.length > 0 && doneGoals === todayGoals.length
               && todayTopics.length > 0 && doneTopics === todayTopics.length;

  return (
    <motion.div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--bg-1)', padding: '28px 20px 40px' }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,146,60,0.15))',
                border: '1px solid rgba(251,191,36,0.3)',
              }}
            >
              <BookOpen size={17} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
                Study Planner
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="icon-btn">
            <X size={17} />
          </motion.button>
        </div>

        {/* ── Stats row ── */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Streak */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
          >
            <motion.div
              animate={data.streak > 0 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex justify-center mb-1"
            >
              <Flame size={22} style={{ color: data.streak > 0 ? '#fb923c' : 'var(--text-4)' }} />
            </motion.div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
              {data.streak}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>Day streak</div>
          </div>

          {/* Goals done */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
          >
            <div className="flex justify-center mb-1">
              <Target size={22} style={{ color: '#4d7cff' }} />
            </div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
              {doneGoals}/{todayGoals.length || 0}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>Goals done</div>
          </div>

          {/* Topics done */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
          >
            <div className="flex justify-center mb-1">
              <Trophy size={22} style={{ color: '#9f7aea' }} />
            </div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
              {doneTopics}/{todayTopics.length || 0}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>Topics covered</div>
          </div>
        </motion.div>

        {/* ── Week strip ── */}
        <motion.div
          className="rounded-2xl p-4 mb-6"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={13} style={{ color: 'var(--text-3)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-2)', fontFamily: 'var(--font-head)' }}>
              This Week
            </span>
          </div>
          <WeekStrip weekLog={data.weekLog} />
        </motion.div>

        {/* ── All done banner ── */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1,    y: 0   }}
              exit={{    opacity: 0, scale: 0.95, y: -8  }}
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(77,124,255,0.08))',
                border: '1px solid rgba(74,222,128,0.25)',
              }}
            >
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>
                  All done for today!
                </p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  Great work — keep the streak going tomorrow.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Today's Goals ── */}
        <div className="mb-5">
          <SectionCard
            title="Today's Goals"
            icon={Target}
            iconColor="#4d7cff"
            count={doneGoals}
            total={todayGoals.length}
          >
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {todayGoals.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-xs text-center py-3" style={{ color: 'var(--text-3)' }}
                  >
                    No goals yet — add one below!
                  </motion.p>
                )}
                {todayGoals.map(g => (
                  <CheckItem key={g.id} item={g} onToggle={toggleGoal} onDelete={deleteGoal} />
                ))}
              </AnimatePresence>
            </div>
            <AddRow placeholder="Add a goal… e.g. Finish Chapter 3" onAdd={addGoal} />
          </SectionCard>
        </div>

        {/* ── Today's Topics ── */}
        <div className="mb-5">
          <SectionCard
            title="Topics to Cover"
            icon={BookOpen}
            iconColor="#9f7aea"
            count={doneTopics}
            total={todayTopics.length}
          >
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {todayTopics.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-xs text-center py-3" style={{ color: 'var(--text-3)' }}
                  >
                    No topics yet — add one below!
                  </motion.p>
                )}
                {todayTopics.map(t => (
                  <CheckItem
                    key={t.id}
                    item={t}
                    onToggle={toggleTopic}
                    onDelete={deleteTopic}
                    colorMeta={SUBJECT_COLORS[t.subject]}
                  />
                ))}
              </AnimatePresence>
            </div>
            <AddRow placeholder="Add a topic… e.g. Quadratic equations" onAdd={addTopic} withSubject />
          </SectionCard>
        </div>

      </div>
    </motion.div>
  );
}