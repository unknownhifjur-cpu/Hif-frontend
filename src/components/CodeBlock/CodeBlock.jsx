import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Play, Download, MessageSquarePlus, Zap } from 'lucide-react';

/* ─── Simple tokenizer for display purposes ─────────────────────────── */
function tokenizePython(code) {
  const keywords = /\b(import|from|as|def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|with|pass|break|continue|lambda|yield|global|nonlocal|del|raise|assert|async|await)\b/g;
  const builtins  = /\b(print|len|range|type|str|int|float|list|dict|set|tuple|bool|open|input|enumerate|zip|map|filter|sorted|reversed|sum|min|max|abs|round|isinstance|hasattr|getattr|setattr)\b/g;
  const strings   = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  const comments  = /(#[^\n]*)/g;
  const numbers   = /\b(\d+\.?\d*)\b/g;
  const decorators = /(@\w+)/g;
  const classNames = /\b([A-Z][a-zA-Z0-9_]*)\b/g;

  // We'll just return the code with <span> wrappers via a simple sequential replace
  // Safe approach: replace non-overlapping tokens
  let result = '';
  let i = 0;
  const src = code;

  // Build a flat list of token ranges
  const tokens = [];

  const addTokens = (regex, cls) => {
    let m;
    regex.lastIndex = 0;
    while ((m = regex.exec(src)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, cls, text: m[0] });
    }
  };

  addTokens(strings,   'tok-str');
  addTokens(comments,  'tok-cmt');
  addTokens(decorators,'tok-dec');
  addTokens(keywords,  'tok-kw');
  addTokens(builtins,  'tok-fn');
  addTokens(numbers,   'tok-num');
  addTokens(classNames,'tok-cls');

  // Sort by start, remove overlaps
  tokens.sort((a, b) => a.start - b.start);
  const filtered = [];
  let lastEnd = 0;
  for (const tok of tokens) {
    if (tok.start >= lastEnd) {
      filtered.push(tok);
      lastEnd = tok.end;
    }
  }

  // Build JSX parts
  const parts = [];
  let pos = 0;
  for (const tok of filtered) {
    if (tok.start > pos) {
      parts.push(<span key={`t-${pos}`}>{src.slice(pos, tok.start)}</span>);
    }
    parts.push(<span key={`tok-${tok.start}`} className={tok.cls}>{tok.text}</span>);
    pos = tok.end;
  }
  if (pos < src.length) {
    parts.push(<span key={`t-end`}>{src.slice(pos)}</span>);
  }
  return parts;
}

function tokenizeJS(code) {
  // reuse same approach with JS keywords
  const keywords = /\b(import|export|from|as|default|const|let|var|function|class|return|if|else|for|while|do|in|of|new|this|typeof|instanceof|null|undefined|true|false|try|catch|finally|throw|async|await|yield|break|continue|switch|case|=>)\b/g;
  const builtins = /\b(console|Math|Array|Object|String|Number|Boolean|Promise|fetch|JSON|document|window|process|module|require|exports)\b/g;
  const strings  = /(`[\s\S]*?`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  const comments = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
  const numbers  = /\b(\d+\.?\d*)\b/g;
  const classNames = /\b([A-Z][a-zA-Z0-9_]*)\b/g;

  const src = code;
  const tokens = [];
  const addTokens = (regex, cls) => {
    let m; regex.lastIndex = 0;
    while ((m = regex.exec(src)) !== null)
      tokens.push({ start: m.index, end: m.index + m[0].length, cls, text: m[0] });
  };

  addTokens(strings, 'tok-str');
  addTokens(comments, 'tok-cmt');
  addTokens(keywords, 'tok-kw');
  addTokens(builtins, 'tok-fn');
  addTokens(numbers,  'tok-num');
  addTokens(classNames, 'tok-cls');

  tokens.sort((a, b) => a.start - b.start);
  const filtered = [];
  let lastEnd = 0;
  for (const tok of tokens) {
    if (tok.start >= lastEnd) { filtered.push(tok); lastEnd = tok.end; }
  }

  const parts = [];
  let pos = 0;
  for (const tok of filtered) {
    if (tok.start > pos) parts.push(<span key={`t-${pos}`}>{src.slice(pos, tok.start)}</span>);
    parts.push(<span key={`tok-${tok.start}`} className={tok.cls}>{tok.text}</span>);
    pos = tok.end;
  }
  if (pos < src.length) parts.push(<span key="t-end">{src.slice(pos)}</span>);
  return parts;
}

function tokenizeGeneric(code) {
  return [<span key="0">{code}</span>];
}

function tokenize(code, lang) {
  try {
    const l = (lang || '').toLowerCase();
    if (l === 'python' || l === 'py') return tokenizePython(code);
    if (l === 'javascript' || l === 'js' || l === 'jsx' || l === 'ts' || l === 'tsx') return tokenizeJS(code);
    return tokenizeGeneric(code);
  } catch {
    return tokenizeGeneric(code);
  }
}

/* ─── LANG_META: display names + aliases ────────────────────────────── */
const LANG_META = {
  python: { label: 'Python', ext: 'py', alt: ['py'] },
  javascript: { label: 'JavaScript', ext: 'js', alt: ['js', 'jsx'] },
  typescript: { label: 'TypeScript', ext: 'ts', alt: ['ts', 'tsx'] },
  cpp: { label: 'C++', ext: 'cpp', alt: ['c++', 'c'] },
  java: { label: 'Java', ext: 'java', alt: [] },
  bash: { label: 'Bash', ext: 'sh', alt: ['sh', 'shell'] },
  json: { label: 'JSON', ext: 'json', alt: [] },
  html: { label: 'HTML', ext: 'html', alt: [] },
  css: { label: 'CSS', ext: 'css', alt: [] },
};

function resolveLang(raw) {
  const l = (raw || '').toLowerCase().trim();
  if (LANG_META[l]) return l;
  for (const [key, meta] of Object.entries(LANG_META)) {
    if (meta.alt.includes(l)) return key;
  }
  return null;
}

/* ─── CodeBlock ─────────────────────────────────────────────────────── */
export default function CodeBlock({ code = '', language = '' }) {
  const resolved = resolveLang(language);
  const meta = resolved ? LANG_META[resolved] : null;
  const displayLang = meta ? meta.label : (language || 'Plain text');
  const ext = meta ? meta.ext : 'txt';

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = code.split('\n');
  const tokenized = tokenize(code, resolved || language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="code-wrapper"
    >
      {/* Header row: language tabs + copy */}
      <div className="code-header">
        <div className="lang-tabs">
          <button className="lang-tab active">{displayLang}</button>
        </div>
        <button className="code-copy-btn" onClick={handleCopy}>
          <AnimatePresence mode="wait">
            {copied
              ? <motion.span key="check" initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-green-400">
                  <Check size={11} /> Copied
                </motion.span>
              : <motion.span key="copy" initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <Copy size={11} /> Copy
                </motion.span>
            }
          </AnimatePresence>
        </button>
      </div>

      {/* Code body: line numbers + highlighted code */}
      <div className="code-body">
        <div className="line-numbers">
          {lines.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <div className="code-content">
          <pre>{tokenized}</pre>
        </div>
      </div>

      {/* Action buttons */}
      <div className="code-actions">
        <button className="action-btn">
          <Play size={11} /> Run code
        </button>
        <button className="action-btn" onClick={handleDownload}>
          <Download size={11} />
          Download as
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ml-0.5"
            style={{ background: 'rgba(77,124,255,0.2)', color: 'var(--accent-light)', border: '1px solid rgba(77,124,255,0.3)' }}
          >
            {ext}
          </span>
        </button>
        <button className="action-btn">
          <MessageSquarePlus size={11} /> Add explanation
        </button>
        <button className="action-btn">
          <Zap size={11} /> Optimize script
        </button>
      </div>
    </motion.div>
  );
}