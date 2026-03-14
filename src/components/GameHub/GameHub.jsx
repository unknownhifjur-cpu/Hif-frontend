import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Trophy, RotateCcw, Check, Lightbulb, Timer } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   SHARED HELPERS
══════════════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'hifai-game-hub';

function loadScores() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveScores(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ══════════════════════════════════════════════════════════════════════
   GAME 1 — MATH QUIZ
══════════════════════════════════════════════════════════════════════ */
const OPS = ['+', '-', '×', '÷'];

function genQuestion() {
  const op = OPS[Math.floor(Math.random() * 4)];
  let a, b, answer;
  if (op === '+') { a = Math.floor(Math.random()*50)+1; b = Math.floor(Math.random()*50)+1; answer = a+b; }
  if (op === '-') { a = Math.floor(Math.random()*50)+10; b = Math.floor(Math.random()*a)+1; answer = a-b; }
  if (op === '×') { a = Math.floor(Math.random()*12)+1; b = Math.floor(Math.random()*12)+1; answer = a*b; }
  if (op === '÷') { b = Math.floor(Math.random()*11)+2; answer = Math.floor(Math.random()*11)+1; a = b*answer; }
  // Wrong choices
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const d = Math.floor(Math.random()*10)-5;
    if (d !== 0) wrongs.add(answer + d);
  }
  const choices = shuffle([answer, ...[...wrongs]]);
  return { question: `${a} ${op} ${b}`, answer, choices };
}

function MathQuiz({ onBack, scores, onScore }) {
  const TOTAL = 10;
  const TIME  = 15;

  const [q,       setQ]       = useState(genQuestion);
  const [num,     setNum]     = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTime]   = useState(TIME);
  const [chosen,  setChosen]  = useState(null);
  const [done,    setDone]    = useState(false);
  const [streak,  setStreak]  = useState(0);

  useEffect(() => {
    if (done || chosen !== null) return;
    if (timeLeft <= 0) { next(null); return; }
    const id = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, done, chosen]);

  const next = (pick) => {
    const isCorrect = pick === q.answer;
    setChosen(pick);
    if (isCorrect) { setCorrect(c => c+1); setStreak(s => s+1); }
    else setStreak(0);
    setTimeout(() => {
      if (num + 1 >= TOTAL) {
        const s = correct + (isCorrect ? 1 : 0);
        onScore('math', s);
        setDone(true);
      } else {
        setNum(n => n+1);
        setQ(genQuestion());
        setTime(TIME);
        setChosen(null);
      }
    }, 900);
  };

  const pct = timeLeft / TIME;

  if (done) return (
    <ResultScreen
      emoji="🧮" title="Math Quiz"
      score={correct} total={TOTAL}
      best={scores.math || 0}
      onRestart={() => { setNum(0); setCorrect(0); setTime(TIME); setChosen(null); setDone(false); setStreak(0); setQ(genQuestion()); }}
      onBack={onBack}
    />
  );

  return (
    <GameScreen title="Math Quiz" emoji="🧮" onBack={onBack} num={num} total={TOTAL} score={correct}>
      {/* Timer bar */}
      <div className="mb-5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-5)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ background: pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#f87171' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Q {num+1}/{TOTAL}</span>
          <span className="text-[10px] font-mono" style={{ color: timeLeft <= 5 ? '#f87171' : 'var(--text-3)' }}>{timeLeft}s</span>
        </div>
      </div>

      {streak >= 3 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center text-xs mb-3" style={{ color: '#fb923c' }}>
          🔥 {streak} in a row!
        </motion.div>
      )}

      {/* Question */}
      <motion.div
        key={num}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-0)' }}>
          {q.question} = ?
        </p>
      </motion.div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3">
        {q.choices.map((c, i) => {
          const isRight  = chosen !== null && c === q.answer;
          const isWrong  = chosen === c && c !== q.answer;
          return (
            <motion.button
              key={i}
              onClick={() => chosen === null && next(c)}
              whileHover={chosen === null ? { scale: 1.03 } : {}}
              whileTap={chosen === null ? { scale: 0.95 } : {}}
              animate={isRight ? { scale: [1, 1.08, 1] } : {}}
              className="py-4 rounded-xl text-lg font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                background: isRight ? 'rgba(74,222,128,0.15)' : isWrong ? 'rgba(248,113,113,0.12)' : 'var(--bg-4)',
                border: `2px solid ${isRight ? '#4ade80' : isWrong ? '#f87171' : 'var(--border-2)'}`,
                color: isRight ? '#4ade80' : isWrong ? '#f87171' : 'var(--text-0)',
                cursor: chosen !== null ? 'default' : 'pointer',
              }}
            >
              {c}
            </motion.button>
          );
        })}
      </div>
    </GameScreen>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   GAME 2 — WORD SCRAMBLE
══════════════════════════════════════════════════════════════════════ */
const WORD_BANK = [
  { word: 'SCIENCE',    hint: 'Study of the natural world' },
  { word: 'HISTORY',    hint: 'Study of past events' },
  { word: 'PHYSICS',    hint: 'Branch of natural science' },
  { word: 'ALGEBRA',    hint: 'Branch of mathematics' },
  { word: 'BIOLOGY',    hint: 'Study of living things' },
  { word: 'GRAMMAR',    hint: 'Rules of language' },
  { word: 'PYTHON',     hint: 'Popular programming language' },
  { word: 'EQUATION',   hint: 'Mathematical statement' },
  { word: 'GEOGRAPHY',  hint: 'Study of Earth\'s lands' },
  { word: 'CHEMISTRY',  hint: 'Study of matter' },
  { word: 'ALGORITHM',  hint: 'Step-by-step problem solution' },
  { word: 'DEMOCRACY',  hint: 'Government by the people' },
  { word: 'MOLECULE',   hint: 'Smallest unit of a compound' },
  { word: 'FRACTION',   hint: 'Part of a whole number' },
  { word: 'TRIANGLE',   hint: 'Three-sided shape' },
];


/* ── Safe scramble — never infinite loops ── */
function safeScramble(w) {
  if (w.length <= 1) return w;
  const arr = w.split('');
  for (let attempt = 0; attempt < 20; attempt++) {
    // Fisher-Yates in place
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.join('') !== w) return arr.join('');
  }
  // Fallback: reverse
  return arr.reverse().join('');
}

function WordScramble({ onBack, scores, onScore }) {
  const TOTAL = 8;

  // Build deck + scrambles once, together, so indices always match
  const [deck] = useState(() =>
    shuffle(WORD_BANK).slice(0, TOTAL).map(item => ({
      ...item,
      scrambled: safeScramble(item.word),
    }))
  );

  const [idx,    setIdx]    = useState(0);
  const [input,  setInput]  = useState('');
  const [hint,   setHint]   = useState(false);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [score,  setScore]  = useState(0);
  const [done,   setDone]   = useState(false);
  const inputRef = useRef(null);

  const current = deck[idx];

  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  const submit = () => {
    if (!input.trim() || result !== null) return;
    const correct = input.trim().toUpperCase() === current.word;
    setResult(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      setResult(null);
      setHint(false);
      setInput('');
      if (idx + 1 >= TOTAL) {
        onScore('scramble', score + (correct ? 1 : 0));
        setDone(true);
      } else {
        setIdx(i => i + 1);
      }
    }, 900);
  };

  if (done) return (
    <ResultScreen emoji="🔤" title="Word Scramble"
      score={score} total={TOTAL} best={scores.scramble || 0}
      onRestart={() => { setIdx(0); setInput(''); setHint(false); setResult(null); setScore(0); setDone(false); }}
      onBack={onBack}
    />
  );

  return (
    <GameScreen title="Word Scramble" emoji="🔤" onBack={onBack} num={idx} total={TOTAL} score={score}>
      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        {/* Scrambled letters */}
        <div className="flex gap-2 justify-center flex-wrap mb-2">
          {current.scrambled.split('').map((l, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{
                background: 'var(--bg-4)',
                border: '1px solid var(--border-2)',
                color: 'var(--accent-light)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {l}
            </motion.span>
          ))}
        </div>

        <AnimatePresence>
          {hint && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs mt-2" style={{ color: 'var(--text-2)' }}
            >
              💡 {current.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Type your answer…"
          disabled={result !== null}
          className="flex-1 text-sm px-4 py-3 rounded-xl outline-none uppercase"
          style={{
            background: result === 'correct' ? 'rgba(74,222,128,0.1)' : result === 'wrong' ? 'rgba(248,113,113,0.1)' : 'var(--bg-4)',
            border: `2px solid ${result === 'correct' ? '#4ade80' : result === 'wrong' ? '#f87171' : 'var(--border-2)'}`,
            color: 'var(--text-0)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.15em',
          }}
        />
        <motion.button onClick={submit} whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }}
          disabled={result !== null || !input.trim()}
          className="px-4 py-3 rounded-xl font-semibold text-sm"
          style={{
            background: 'var(--accent)', color: 'white', border: 'none',
            boxShadow: '0 2px 12px rgba(77,124,255,0.35)',
            opacity: result !== null ? 0.6 : 1,
          }}
        >
          <Check size={18} />
        </motion.button>
      </div>

      <button
        onClick={() => setHint(true)}
        className="flex items-center gap-1.5 text-xs mx-auto"
        style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <Lightbulb size={13} /> Show hint
      </button>
    </GameScreen>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   GAME 3 — MEMORY MATCH
══════════════════════════════════════════════════════════════════════ */
const PAIRS = [
  ['🧮', 'Math'],    ['🔬', 'Science'],  ['🌍', 'Geography'],
  ['📖', 'English'], ['💻', 'Coding'],   ['⚗️', 'Chemistry'],
  ['🏛️', 'History'], ['🎵', 'Music'],
];

function MemoryMatch({ onBack, scores, onScore }) {
  const [cards, setCards] = useState(() => {
    const deck = PAIRS.flatMap(([emoji, label]) => [
      { id: `${label}-a`, emoji, label, matched: false },
      { id: `${label}-b`, emoji, label, matched: false },
    ]);
    return shuffle(deck);
  });
  const [flipped,  setFlipped]  = useState([]);   // indices
  const [matched,  setMatched]  = useState(0);
  const [moves,    setMoves]    = useState(0);
  const [locked,   setLocked]   = useState(false);
  const [done,     setDone]     = useState(false);
  const total = PAIRS.length;

  const flip = (i) => {
    if (locked || cards[i].matched || flipped.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = next;
      if (cards[a].label === cards[b].label) {
        setTimeout(() => {
          setCards(cs => cs.map((c, idx) =>
            idx === a || idx === b ? { ...c, matched: true } : c
          ));
          const newMatched = matched + 1;
          setMatched(newMatched);
          setFlipped([]);
          setLocked(false);
          if (newMatched >= total) {
            const score = Math.max(0, total * 10 - (moves + 1) * 2);
            onScore('memory', score);
            setDone(true);
          }
        }, 500);
      } else {
        setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
      }
    }
  };

  const score = Math.max(0, total * 10 - moves * 2);

  if (done) return (
    <ResultScreen emoji="🃏" title="Memory Match"
      score={matched} total={total} best={scores.memory || 0}
      extraInfo={`Completed in ${moves} moves`}
      onRestart={() => {
        const deck = PAIRS.flatMap(([emoji, label]) => [
          { id: `${label}-a`, emoji, label, matched: false },
          { id: `${label}-b`, emoji, label, matched: false },
        ]);
        setCards(shuffle(deck)); setFlipped([]); setMatched(0); setMoves(0); setLocked(false); setDone(false);
      }}
      onBack={onBack}
    />
  );

  return (
    <GameScreen title="Memory Match" emoji="🃏" onBack={onBack} num={matched} total={total} score={moves} scoreLabel="Moves">
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || card.matched;
          return (
            <motion.button
              key={card.id}
              onClick={() => flip(i)}
              whileTap={!isFlipped && !locked ? { scale: 0.92 } : {}}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-center"
              style={{
                background: card.matched ? 'rgba(74,222,128,0.1)' : isFlipped ? 'var(--bg-4)' : 'var(--bg-5)',
                border: `2px solid ${card.matched ? '#4ade80' : isFlipped ? 'var(--border-accent)' : 'var(--border-1)'}`,
                cursor: isFlipped ? 'default' : 'pointer',
              }}
            >
              <AnimatePresence mode="wait">
                {isFlipped ? (
                  <motion.div key="front" initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <span className="text-xl">{card.emoji}</span>
                    <span className="text-[9px] font-medium" style={{ color: 'var(--text-2)' }}>{card.label}</span>
                  </motion.div>
                ) : (
                  <motion.div key="back" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.2 }}>
                    <span className="text-2xl">❓</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <p className="text-center text-xs mt-4" style={{ color: 'var(--text-3)' }}>
        {matched}/{total} pairs matched · {moves} moves
      </p>
    </GameScreen>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   GAME 4 — TRUE OR FALSE
══════════════════════════════════════════════════════════════════════ */
const TOF_QUESTIONS = [
  { q: 'The Earth is the third planet from the Sun.',       a: true  },
  { q: 'Light travels slower than sound.',                  a: false },
  { q: 'Python is a compiled programming language.',        a: false },
  { q: 'Water boils at 100°C at sea level.',                a: true  },
  { q: 'The human body has 206 bones.',                     a: true  },
  { q: 'Square root of 144 is 14.',                         a: false },
  { q: 'The Great Wall of China is visible from space.',    a: false },
  { q: 'DNA stands for Deoxyribonucleic Acid.',             a: true  },
  { q: 'Bangladesh gained independence in 1972.',           a: false },
  { q: 'Photosynthesis produces oxygen.',                   a: true  },
  { q: 'An octopus has 8 tentacles.',                       a: true  },
  { q: 'The chemical symbol for Gold is Ag.',               a: false },
  { q: 'A prime number is divisible only by 1 and itself.', a: true  },
  { q: 'HTML is a programming language.',                   a: false },
  { q: 'The moon has its own light source.',                a: false },
  { q: 'Gravity pulls objects toward Earth\'s center.',     a: true  },
  { q: 'Pi is approximately equal to 3.14.',                a: true  },
  { q: 'Humans share 60% DNA with bananas.',                a: true  },
];

function TrueOrFalse({ onBack, scores, onScore }) {
  const TOTAL = 10;
  const TIME  = 8;
  const [deck]   = useState(() => shuffle(TOF_QUESTIONS).slice(0, TOTAL));
  const [idx,     setIdx]    = useState(0);
  const [score,   setScore]  = useState(0);
  const [chosen,  setChosen] = useState(null);
  const [timeLeft, setTime]  = useState(TIME);
  const [done,    setDone]   = useState(false);

  useEffect(() => {
    if (done || chosen !== null) return;
    if (timeLeft <= 0) { pick(null); return; }
    const id = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, done, chosen]);

  const pick = (ans) => {
    const current = deck[idx];
    const correct = ans === current.a;
    setChosen(ans);
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= TOTAL) {
        onScore('tof', score + (correct ? 1 : 0));
        setDone(true);
      } else {
        setIdx(i => i+1);
        setChosen(null);
        setTime(TIME);
      }
    }, 1000);
  };

  const pct = timeLeft / TIME;
  const current = deck[idx];

  if (done) return (
    <ResultScreen emoji="✅" title="True or False"
      score={score} total={TOTAL} best={scores.tof || 0}
      onRestart={() => { setIdx(0); setScore(0); setChosen(null); setTime(TIME); setDone(false); }}
      onBack={onBack}
    />
  );

  return (
    <GameScreen title="True or False" emoji="✅" onBack={onBack} num={idx} total={TOTAL} score={score}>
      {/* Timer */}
      <div className="mb-6">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-5)' }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${pct*100}%` }} transition={{ duration: 0.3 }}
            style={{ background: pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#f87171' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Q {idx+1}/{TOTAL}</span>
          <span className="text-[10px] font-mono" style={{ color: timeLeft <= 3 ? '#f87171' : 'var(--text-3)' }}>{timeLeft}s</span>
        </div>
      </div>

      {/* Question */}
      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-8 text-center"
        style={{ background: 'var(--bg-4)', border: '1px solid var(--border-2)', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-0)' }}>
          {current.q}
        </p>
      </motion.div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {[true, false].map(val => {
          const isChosen  = chosen === val;
          const isCorrect = chosen !== null && val === current.a;
          const isWrong   = isChosen && !isCorrect;
          return (
            <motion.button
              key={String(val)}
              onClick={() => chosen === null && pick(val)}
              whileHover={chosen === null ? { scale: 1.04 } : {}}
              whileTap={chosen === null ? { scale: 0.94 } : {}}
              animate={isCorrect && chosen !== null ? { scale: [1, 1.06, 1] } : {}}
              className="py-5 rounded-2xl text-xl font-bold"
              style={{
                background: isCorrect ? 'rgba(74,222,128,0.12)' : isWrong ? 'rgba(248,113,113,0.1)' : val ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                border: `2px solid ${isCorrect ? '#4ade80' : isWrong ? '#f87171' : val ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: val ? '#4ade80' : '#f87171',
                cursor: chosen !== null ? 'default' : 'pointer',
              }}
            >
              {val ? '✓ True' : '✗ False'}
            </motion.button>
          );
        })}
      </div>
    </GameScreen>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════════════════ */
function GameScreen({ title, emoji, onBack, num, total, score, scoreLabel = 'Score', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Game header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs icon-btn px-2"
          style={{ color: 'var(--text-3)', width: 'auto' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
          {emoji} {title}
        </span>
        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', fontFamily: 'var(--font-mono)' }}>
          {scoreLabel}: {score}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function ResultScreen({ emoji, title, score, total, best, extraInfo, onRestart, onBack }) {
  const pct      = Math.round((score / total) * 100);
  const isNew    = score > best;
  const stars    = score >= total * 0.9 ? 3 : score >= total * 0.6 ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-6xl mb-4"
      >
        {stars === 3 ? '🏆' : stars === 2 ? '🥈' : '🥉'}
      </motion.div>

      <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
        {pct >= 90 ? 'Excellent!' : pct >= 60 ? 'Good job!' : 'Keep practising!'}
      </h2>

      <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
        {emoji} {title}
        {extraInfo && <span className="block text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{extraInfo}</span>}
      </p>

      {/* Score ring */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>
            {score}/{total}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>This round</div>
        </div>
        <div className="w-px h-10" style={{ background: 'var(--border-2)' }} />
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: isNew ? '#4ade80' : 'var(--text-2)' }}>
            {Math.max(score, best)}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
            {isNew ? '🎉 New best!' : 'Best'}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <motion.button onClick={onRestart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--accent)', color: 'white', border: 'none', boxShadow: '0 2px 12px rgba(77,124,255,0.35)' }}
        >
          <RotateCcw size={14} /> Play Again
        </motion.button>
        <motion.button onClick={onBack} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--bg-4)', color: 'var(--text-1)', border: '1px solid var(--border-2)' }}
        >
          <ArrowLeft size={14} /> Hub
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   GAME HUB — MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
const GAMES = [
  {
    id: 'math',
    emoji: '🧮',
    title: 'Math Quiz',
    desc: 'Timed arithmetic challenges — addition, subtraction, multiplication & division.',
    color: '#4d7cff',
    bg: 'rgba(77,124,255,0.08)',
    border: 'rgba(77,124,255,0.2)',
  },
  {
    id: 'scramble',
    emoji: '🔤',
    title: 'Word Scramble',
    desc: 'Unscramble jumbled subject words before the hint runs out.',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.2)',
  },
  {
    id: 'memory',
    emoji: '🃏',
    title: 'Memory Match',
    desc: 'Flip cards and match subject emoji pairs in as few moves as possible.',
    color: '#9f7aea',
    bg: 'rgba(159,122,234,0.08)',
    border: 'rgba(159,122,234,0.2)',
  },
  {
    id: 'tof',
    emoji: '✅',
    title: 'True or False',
    desc: 'Rapid-fire science, math & general knowledge facts — decide fast!',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.2)',
  },
];

export default function GameHub({ onClose }) {
  const [activeGame, setActiveGame] = useState(null);
  const [scores,     setScores]     = useState(loadScores);

  const handleScore = (gameId, score) => {
    setScores(prev => {
      const best = Math.max(prev[gameId] || 0, score);
      const next = { ...prev, [gameId]: best };
      saveScores(next);
      return next;
    });
  };

  return (
    <motion.div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--bg-1)', padding: '28px 20px 40px' }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, rgba(159,122,234,0.2), rgba(77,124,255,0.15))', border: '1px solid var(--border-2)' }}
            >
              🎮
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
                Game Hub
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>Learn while you play</p>
            </div>
          </div>
          <motion.button onClick={onClose} whileTap={{ scale: 0.9 }} className="icon-btn">
            <X size={17} />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div key={activeGame}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {activeGame === 'math'    && <MathQuiz     onBack={() => setActiveGame(null)} scores={scores} onScore={handleScore} />}
              {activeGame === 'scramble'&& <WordScramble onBack={() => setActiveGame(null)} scores={scores} onScore={handleScore} />}
              {activeGame === 'memory' && <MemoryMatch  onBack={() => setActiveGame(null)} scores={scores} onScore={handleScore} />}
              {activeGame === 'tof'    && <TrueOrFalse  onBack={() => setActiveGame(null)} scores={scores} onScore={handleScore} />}
            </motion.div>
          ) : (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Best scores strip */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {GAMES.map(g => (
                  <div key={g.id} className="text-center py-2 px-1 rounded-xl"
                    style={{ background: g.bg, border: `1px solid ${g.border}` }}
                  >
                    <div className="text-lg mb-0.5">{g.emoji}</div>
                    <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: g.color }}>
                      {scores[g.id] ?? '—'}
                    </div>
                    <div className="text-[9px]" style={{ color: 'var(--text-3)' }}>Best</div>
                  </div>
                ))}
              </div>

              {/* Game cards */}
              <div className="flex flex-col gap-3">
                {GAMES.map((g, i) => (
                  <motion.button
                    key={g.id}
                    onClick={() => setActiveGame(g.id)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 rounded-2xl text-left w-full"
                    style={{
                      background: 'var(--bg-3)',
                      border: `1px solid var(--border-1)`,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = g.border; e.currentTarget.style.background = g.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.background = 'var(--bg-3)'; }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: g.bg, border: `1px solid ${g.border}` }}
                    >
                      {g.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold mb-0.5" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
                        {g.title}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                        {g.desc}
                      </p>
                    </div>
                    {scores[g.id] !== undefined && (
                      <div className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                        style={{ background: g.bg, color: g.color, border: `1px solid ${g.border}` }}
                      >
                        <Trophy size={11} /> {scores[g.id]}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-[11px] mt-8" style={{ color: 'var(--text-4)' }}>
                Best scores saved locally in your browser
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}