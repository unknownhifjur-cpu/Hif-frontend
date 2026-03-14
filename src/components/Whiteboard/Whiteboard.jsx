import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Pencil, Eraser, Square, Circle, Minus,
  Trash2, Undo2, Download, Type, MousePointer2,
} from 'lucide-react';

/* ─── Tool config ───────────────────────────────────────────────────── */
const TOOLS = [
  { id: 'select',  icon: MousePointer2, label: 'Select'  },
  { id: 'pen',     icon: Pencil,        label: 'Pen'     },
  { id: 'eraser',  icon: Eraser,        label: 'Eraser'  },
  { id: 'line',    icon: Minus,         label: 'Line'    },
  { id: 'rect',    icon: Square,        label: 'Rect'    },
  { id: 'ellipse', icon: Circle,        label: 'Ellipse' },
  { id: 'text',    icon: Type,          label: 'Text'    },
];

const COLORS = [
  '#f0f4ff', '#4d7cff', '#9f7aea', '#f472b6',
  '#4ade80', '#fbbf24', '#fb923c', '#f87171',
  '#00d4e8', '#ffffff', '#8892b0', '#1e2740',
];

const SIZES = [2, 4, 8, 14];

/* ─── Whiteboard ────────────────────────────────────────────────────── */
export default function Whiteboard({ onClose }) {
  const canvasRef     = useRef(null);
  const overlayRef    = useRef(null); // for shape preview
  const containerRef  = useRef(null);

  const [tool,        setTool]      = useState('pen');
  const [color,       setColor]     = useState('#f0f4ff');
  const [size,        setSize]      = useState(4);
  const [history,     setHistory]   = useState([]);   // array of ImageData
  const [isDrawing,   setIsDrawing] = useState(false);
  const [startPos,    setStartPos]  = useState({ x: 0, y: 0 });
  const [textInput,   setTextInput] = useState('');
  const [textPos,     setTextPos]   = useState(null);
  const [bgDark,      setBgDark]    = useState(true);

  /* ── Canvas setup ── */
  useEffect(() => {
    const canvas  = canvasRef.current;
    const overlay = overlayRef.current;
    const resize  = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      // Save current drawing
      const ctx = canvas.getContext('2d');
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width  = width;
      canvas.height = height;
      overlay.width  = width;
      overlay.height = height;

      // Fill background
      ctx.fillStyle = bgDark ? '#0d1120' : '#f5f6fb';
      ctx.fillRect(0, 0, width, height);

      // Restore drawing
      ctx.putImageData(img, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  /* ── Background toggle ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Only fill if canvas is blank (first time)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const blank = data.every(v => v === 0);
    if (blank) {
      ctx.fillStyle = bgDark ? '#0d1120' : '#f5f6fb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [bgDark]);

  /* ── Save snapshot for undo ── */
  const saveSnapshot = useCallback(() => {
    const ctx = canvasRef.current.getContext('2d');
    const snap = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory(h => [...h.slice(-29), snap]);
  }, []);

  /* ── Undo ── */
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const ctx  = canvasRef.current.getContext('2d');
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
  }, [history]);

  /* ── Clear ── */
  const clear = useCallback(() => {
    saveSnapshot();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.fillStyle = bgDark ? '#0d1120' : '#f5f6fb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [saveSnapshot, bgDark]);

  /* ── Get pos from event ── */
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  /* ── Draw helpers ── */
  const applyStroke = (ctx) => {
    ctx.strokeStyle = tool === 'eraser' ? (bgDark ? '#0d1120' : '#f5f6fb') : color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = tool === 'eraser' ? size * 4 : size;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  };

  /* ── Pointer down ── */
  const onPointerDown = (e) => {
    if (tool === 'select') return;
    const pos = getPos(e);

    if (tool === 'text') {
      setTextPos(pos);
      setTextInput('');
      return;
    }

    saveSnapshot();
    setIsDrawing(true);
    setStartPos(pos);

    if (tool === 'pen' || tool === 'eraser') {
      const ctx = canvasRef.current.getContext('2d');
      applyStroke(ctx);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  /* ── Pointer move ── */
  const onPointerMove = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    const ovr = overlayRef.current.getContext('2d');

    if (tool === 'pen' || tool === 'eraser') {
      applyStroke(ctx);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      return;
    }

    // Shape preview on overlay
    ovr.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    applyStroke(ovr);
    ovr.beginPath();

    if (tool === 'line') {
      ovr.moveTo(startPos.x, startPos.y);
      ovr.lineTo(pos.x, pos.y);
      ovr.stroke();
    }
    if (tool === 'rect') {
      ovr.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    }
    if (tool === 'ellipse') {
      const rx = Math.abs(pos.x - startPos.x) / 2;
      const ry = Math.abs(pos.y - startPos.y) / 2;
      const cx = (startPos.x + pos.x) / 2;
      const cy = (startPos.y + pos.y) / 2;
      ovr.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ovr.stroke();
    }
  };

  /* ── Pointer up ── */
  const onPointerUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    const ovr = overlayRef.current.getContext('2d');

    ovr.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    applyStroke(ctx);
    ctx.beginPath();

    if (tool === 'line') {
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    if (tool === 'rect') {
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    }
    if (tool === 'ellipse') {
      const rx = Math.abs(pos.x - startPos.x) / 2;
      const ry = Math.abs(pos.y - startPos.y) / 2;
      const cx = (startPos.x + pos.x) / 2;
      const cy = (startPos.y + pos.y) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (tool === 'pen' || tool === 'eraser') ctx.closePath();
  };

  /* ── Commit text ── */
  const commitText = () => {
    if (!textInput.trim() || !textPos) return;
    saveSnapshot();
    const ctx = canvasRef.current.getContext('2d');
    ctx.font      = `${size * 5 + 10}px DM Sans, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextPos(null);
    setTextInput('');
  };

  /* ── Download ── */
  const download = () => {
    const link    = document.createElement('a');
    link.download = 'hifai-whiteboard.png';
    link.href     = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.key === 'p') setTool('pen');
      if (e.key === 'e') setTool('eraser');
      if (e.key === 'l') setTool('line');
      if (e.key === 'r') setTool('rect');
      if (e.key === 'o') setTool('ellipse');
      if (e.key === 't') setTool('text');
      if (e.key === 'Escape') { setTextPos(null); setTextInput(''); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo]);

  const cursorStyle = {
    select:  'default',
    pen:     'crosshair',
    eraser:  'cell',
    line:    'crosshair',
    rect:    'crosshair',
    ellipse: 'crosshair',
    text:    'text',
  }[tool];

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-1)' }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* ── Toolbar ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 flex-wrap"
        style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border-1)' }}
      >
        {/* Tools */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}>
          {TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                onClick={() => setTool(t.id)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                title={`${t.label} (${t.id[0]})`}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: tool === t.id ? 'var(--accent-dim)' : 'transparent',
                  color: tool === t.id ? 'var(--accent-light)' : 'var(--text-3)',
                  border: tool === t.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                }}
              >
                <Icon size={15} />
              </motion.button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-7" style={{ background: 'var(--border-1)' }} />

        {/* Colors */}
        <div className="flex gap-1 flex-wrap">
          {COLORS.map(c => (
            <motion.button
              key={c}
              onClick={() => setColor(c)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              title={c}
              className="w-5 h-5 rounded-full flex-shrink-0"
              style={{
                background: c,
                border: color === c ? '2px solid var(--accent-light)' : '1px solid var(--border-2)',
                boxShadow: color === c ? `0 0 0 2px var(--bg-2), 0 0 0 4px ${c}` : 'none',
                transition: 'box-shadow 0.15s',
              }}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-7" style={{ background: 'var(--border-1)' }} />

        {/* Brush sizes */}
        <div className="flex items-center gap-1.5">
          {SIZES.map(s => (
            <motion.button
              key={s}
              onClick={() => setSize(s)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              title={`Size ${s}`}
              className="flex items-center justify-center w-7 h-7 rounded-lg"
              style={{
                background: size === s ? 'var(--accent-dim)' : 'transparent',
                border: size === s ? '1px solid var(--border-accent)' : '1px solid transparent',
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: Math.min(s * 2.5, 18),
                  height: Math.min(s * 2.5, 18),
                  background: color,
                  border: '1px solid var(--border-2)',
                }}
              />
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-7" style={{ background: 'var(--border-1)' }} />

        {/* Actions */}
        <div className="flex gap-1">
          <motion.button onClick={undo} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
            disabled={history.length === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)', color: history.length === 0 ? 'var(--text-4)' : 'var(--text-2)' }}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </motion.button>

          <motion.button onClick={clear} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)', color: 'var(--text-2)' }}
            title="Clear canvas"
          >
            <Trash2 size={14} />
          </motion.button>

          <motion.button onClick={download} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)', color: 'var(--text-2)' }}
            title="Download as PNG"
          >
            <Download size={14} />
          </motion.button>
        </div>

        {/* BG toggle */}
        <motion.button
          onClick={() => setBgDark(d => !d)}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
          className="px-3 h-8 rounded-lg text-xs font-medium ml-auto"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
          title="Toggle background"
        >
          {bgDark ? '☀ Light BG' : '☾ Dark BG'}
        </motion.button>

        <motion.button onClick={onClose} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} className="icon-btn">
          <X size={17} />
        </motion.button>
      </motion.div>

      {/* ── Canvas area ── */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ touchAction: 'none' }}>
        {/* Main canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: cursorStyle, display: 'block' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        {/* Overlay for shape preview */}
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ display: 'block' }}
        />

        {/* Text input floating at click position */}
        <AnimatePresence>
          {textPos && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'absolute',
                left: textPos.x,
                top: textPos.y - 16,
                zIndex: 10,
              }}
            >
              <input
                autoFocus
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitText();
                  if (e.key === 'Escape') { setTextPos(null); setTextInput(''); }
                }}
                onBlur={commitText}
                placeholder="Type & press Enter"
                style={{
                  background: 'rgba(13,17,32,0.85)',
                  border: `2px solid ${color}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  color,
                  fontSize: size * 5 + 10,
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  backdropFilter: 'blur(8px)',
                  boxShadow: `0 0 0 3px ${color}33`,
                  minWidth: 120,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tool hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] px-3 py-1 rounded-full pointer-events-none"
          style={{ background: 'rgba(13,17,32,0.7)', color: 'var(--text-3)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-1)' }}
        >
          {tool === 'pen' && 'Draw freely · P'}
          {tool === 'eraser' && 'Eraser · E'}
          {tool === 'line' && 'Draw a straight line · L'}
          {tool === 'rect' && 'Draw a rectangle · R'}
          {tool === 'ellipse' && 'Draw an ellipse · O'}
          {tool === 'text' && 'Click anywhere to add text · T'}
          {tool === 'select' && 'Selection tool'}
        </motion.div>
      </div>
    </motion.div>
  );
}