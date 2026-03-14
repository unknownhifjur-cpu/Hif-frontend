import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Search, Trash2, Pin, PinOff,
  Tag, Edit3, Check, ChevronDown,
} from 'lucide-react';

/* ─── Storage ───────────────────────────────────────────────────────── */
const KEY = 'hifai-quick-notes';

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function saveNotes(notes) {
  try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch {}
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ─── Config ────────────────────────────────────────────────────────── */
const NOTE_COLORS = [
  { id: 'default', bg: 'var(--bg-3)',              border: 'var(--border-1)',          label: 'Default' },
  { id: 'blue',    bg: 'rgba(77,124,255,0.08)',    border: 'rgba(77,124,255,0.25)',    label: 'Blue'    },
  { id: 'purple',  bg: 'rgba(159,122,234,0.08)',   border: 'rgba(159,122,234,0.25)',   label: 'Purple'  },
  { id: 'green',   bg: 'rgba(74,222,128,0.08)',    border: 'rgba(74,222,128,0.25)',    label: 'Green'   },
  { id: 'yellow',  bg: 'rgba(251,191,36,0.08)',    border: 'rgba(251,191,36,0.25)',    label: 'Yellow'  },
  { id: 'pink',    bg: 'rgba(244,114,182,0.08)',   border: 'rgba(244,114,182,0.25)',   label: 'Pink'    },
  { id: 'orange',  bg: 'rgba(251,146,60,0.08)',    border: 'rgba(251,146,60,0.25)',    label: 'Orange'  },
  { id: 'red',     bg: 'rgba(248,113,113,0.08)',   border: 'rgba(248,113,113,0.25)',   label: 'Red'     },
];

const COLOR_DOTS = {
  default: 'var(--text-3)',
  blue:    '#4d7cff',
  purple:  '#9f7aea',
  green:   '#4ade80',
  yellow:  '#fbbf24',
  pink:    '#f472b6',
  orange:  '#fb923c',
  red:     '#f87171',
};

const PRESET_TAGS = ['Math', 'Science', 'English', 'Programming', 'History', 'General', 'Important', 'Revision'];

/* ─── Helpers ───────────────────────────────────────────────────────── */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)   return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── NoteCard ──────────────────────────────────────────────────────── */
function NoteCard({ note, onEdit, onDelete, onPin, onTagClick }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const col = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) { onDelete(note.id); }
    else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{    opacity: 0, y: -10, scale: 0.96  }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className="group rounded-2xl p-4 flex flex-col gap-3 cursor-pointer"
      style={{
        background: col.bg,
        border: `1px solid ${col.border}`,
        boxShadow: note.pinned ? `0 0 0 2px ${COLOR_DOTS[note.color] || 'var(--accent)'}33` : 'none',
      }}
      onClick={() => onEdit(note)}
    >
      {/* Title */}
      {note.title && (
        <p className="text-sm font-semibold leading-snug line-clamp-1"
          style={{ color: 'var(--text-0)', fontFamily: 'var(--font-head)' }}
        >
          {note.title}
        </p>
      )}

      {/* Body */}
      <p className="text-xs leading-relaxed line-clamp-4 flex-1"
        style={{ color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}
      >
        {note.body || <span style={{ color: 'var(--text-4)' }}>Empty note…</span>}
      </p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {note.tags.map(t => (
            <button
              key={t}
              onClick={e => { e.stopPropagation(); onTagClick(t); }}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--bg-5)',
                color: 'var(--text-2)',
                border: '1px solid var(--border-1)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: 'var(--text-4)' }}>
          {timeAgo(note.updatedAt)}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={e => { e.stopPropagation(); onPin(note.id); }}
            whileTap={{ scale: 0.85 }}
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--bg-5)', color: note.pinned ? 'var(--accent-light)' : 'var(--text-3)' }}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            {note.pinned ? <PinOff size={11} /> : <Pin size={11} />}
          </motion.button>
          <motion.button
            onClick={handleDelete}
            whileTap={{ scale: 0.85 }}
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{
              background: confirmDelete ? 'rgba(248,113,113,0.15)' : 'var(--bg-5)',
              color: confirmDelete ? '#f87171' : 'var(--text-3)',
            }}
            title={confirmDelete ? 'Click again to delete' : 'Delete'}
          >
            {confirmDelete ? <Check size={11} /> : <Trash2 size={11} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── NoteEditor ────────────────────────────────────────────────────── */
function NoteEditor({ note, onSave, onClose }) {
  const [title,   setTitle]   = useState(note?.title  || '');
  const [body,    setBody]    = useState(note?.body    || '');
  const [tags,    setTags]    = useState(note?.tags    || []);
  const [color,   setColor]   = useState(note?.color   || 'default');
  const [tagInput,setTagInput]= useState('');
  const [showTags,setShowTags]= useState(false);
  const bodyRef = useRef(null);

  useEffect(() => { bodyRef.current?.focus(); }, []);

  const addTag = (t) => {
    const clean = t.trim();
    if (clean && !tags.includes(clean)) setTags(prev => [...prev, clean]);
    setTagInput('');
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const handleSave = () => {
    if (!title.trim() && !body.trim()) { onClose(); return; }
    onSave({
      id:        note?.id || uid(),
      title:     title.trim(),
      body:      body.trim(),
      tags,
      color,
      pinned:    note?.pinned || false,
      createdAt: note?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
    onClose();
  };

  const col = NOTE_COLORS.find(c => c.id === color) || NOTE_COLORS[0];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) handleSave(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-lg rounded-2xl flex flex-col"
        style={{
          background: col.bg !== 'var(--bg-3)' ? col.bg : 'var(--bg-2)',
          border: `1px solid ${col.border}`,
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Note title…"
            className="flex-1 text-sm font-semibold bg-transparent outline-none"
            style={{ color: 'var(--text-0)', fontFamily: 'var(--font-head)' }}
          />
          <button onClick={handleSave} className="icon-btn w-7 h-7" title="Save & close">
            <Check size={15} style={{ color: 'var(--accent-light)' }} />
          </button>
          <button onClick={onClose} className="icon-btn w-7 h-7">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <textarea
          ref={bodyRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your note here…"
          className="flex-1 bg-transparent resize-none outline-none px-4 py-2 text-sm leading-relaxed"
          style={{
            color: 'var(--text-1)',
            fontFamily: 'var(--font-ui)',
            minHeight: 160,
            caretColor: 'var(--accent)',
          }}
        />

        {/* Tags row */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <Tag size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            {tags.map(t => (
              <span
                key={t}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-5)', color: 'var(--text-1)', border: '1px solid var(--border-2)' }}
              >
                {t}
                <button onClick={() => removeTag(t)} style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
                }}
                placeholder="Add tag…"
                className="text-[10px] bg-transparent outline-none w-16"
                style={{ color: 'var(--text-2)', caretColor: 'var(--accent)' }}
              />
              <button
                onClick={() => setShowTags(s => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}
              >
                <ChevronDown size={11} />
              </button>
            </div>
          </div>

          {/* Preset tags */}
          <AnimatePresence>
            {showTags && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-1 flex-wrap mb-3 overflow-hidden"
              >
                {PRESET_TAGS.filter(t => !tags.includes(t)).map(t => (
                  <button
                    key={t}
                    onClick={() => addTag(t)}
                    className="text-[10px] px-2 py-0.5 rounded-full transition-all"
                    style={{
                      background: 'var(--bg-5)',
                      color: 'var(--text-2)',
                      border: '1px solid var(--border-1)',
                      cursor: 'pointer',
                    }}
                  >
                    + {t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Color picker */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2" style={{ borderTop: '1px solid var(--border-0)' }}>
            <span className="text-[10px]" style={{ color: 'var(--text-4)' }}>Colour:</span>
            {NOTE_COLORS.map(c => (
              <motion.button
                key={c.id}
                onClick={() => setColor(c.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                title={c.label}
                className="w-4 h-4 rounded-full"
                style={{
                  background: COLOR_DOTS[c.id],
                  border: color === c.id ? '2px solid var(--text-0)' : '1px solid var(--border-2)',
                  boxShadow: color === c.id ? `0 0 0 2px var(--bg-2), 0 0 0 4px ${COLOR_DOTS[c.id]}` : 'none',
                  transition: 'box-shadow 0.15s',
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── QuickNotes ────────────────────────────────────────────────────── */
export default function QuickNotes({ onClose }) {
  const [notes,       setNotes]       = useState(loadNotes);
  const [search,      setSearch]      = useState('');
  const [activeTag,   setActiveTag]   = useState(null);
  const [editingNote, setEditingNote] = useState(null); // null | note | 'new'
  const [sortBy,      setSortBy]      = useState('updated'); // 'updated' | 'created' | 'alpha'

  useEffect(() => { saveNotes(notes); }, [notes]);

  const handleSave = (note) => {
    setNotes(prev => {
      const exists = prev.find(n => n.id === note.id);
      return exists
        ? prev.map(n => n.id === note.id ? note : n)
        : [note, ...prev];
    });
  };

  const handleDelete = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  const handlePin = (id) => setNotes(prev =>
    prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
  );

  /* Filter + sort */
  const allTags = [...new Set(notes.flatMap(n => n.tags))].sort();

  const filtered = notes
    .filter(n => {
      const q = search.toLowerCase();
      const matchSearch = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
      const matchTag    = !activeTag || n.tags.includes(activeTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      if (sortBy === 'alpha')   return a.title.localeCompare(b.title);
      if (sortBy === 'created') return b.createdAt - a.createdAt;
      return b.updatedAt - a.updatedAt;
    });

  const pinned   = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  return (
    <>
      <motion.div
        className="flex-1 overflow-y-auto"
        style={{ background: 'var(--bg-1)', padding: '20px 20px 40px' }}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="max-w-3xl mx-auto">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,146,60,0.1))',
                  border: '1px solid rgba(251,191,36,0.25)',
                }}
              >
                📝
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>
                  Quick Notes
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {notes.length} note{notes.length !== 1 ? 's' : ''} saved locally
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setEditingNote('new')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--accent)', color: 'white', border: 'none', boxShadow: '0 2px 12px rgba(77,124,255,0.35)' }}
              >
                <Plus size={14} /> New Note
              </motion.button>
              <motion.button onClick={onClose} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="icon-btn">
                <X size={17} />
              </motion.button>
            </div>
          </div>

          {/* ── Search + sort ── */}
          <div className="flex gap-2 mb-4">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}
            >
              <Search size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="flex-1 text-xs bg-transparent outline-none"
                style={{ color: 'var(--text-1)', fontFamily: 'var(--font-ui)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={11} />
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl outline-none"
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border-2)',
                color: 'var(--text-2)',
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
              }}
            >
              <option value="updated">Last edited</option>
              <option value="created">Newest</option>
              <option value="alpha">A → Z</option>
            </select>
          </div>

          {/* ── Tag filter pills ── */}
          {allTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-1.5 flex-wrap mb-5"
            >
              <button
                onClick={() => setActiveTag(null)}
                className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: !activeTag ? 'var(--accent-dim)' : 'var(--bg-3)',
                  color: !activeTag ? 'var(--accent-light)' : 'var(--text-3)',
                  border: `1px solid ${!activeTag ? 'var(--border-accent)' : 'var(--border-1)'}`,
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              {allTags.map(t => (
                <motion.button
                  key={t}
                  onClick={() => setActiveTag(activeTag === t ? null : t)}
                  whileTap={{ scale: 0.94 }}
                  className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: activeTag === t ? 'var(--accent-dim)' : 'var(--bg-3)',
                    color: activeTag === t ? 'var(--accent-light)' : 'var(--text-3)',
                    border: `1px solid ${activeTag === t ? 'var(--border-accent)' : 'var(--border-1)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* ── Empty state ── */}
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-4"
            >
              <div className="text-5xl animate-float">📝</div>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>No notes yet.</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                Click <strong style={{ color: 'var(--accent-light)' }}>+ New Note</strong> to get started.
              </p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-sm py-16" style={{ color: 'var(--text-3)' }}
            >
              No notes match your search.
            </motion.p>
          ) : (
            <>
              {/* Pinned */}
              {pinned.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-4)' }}>
                    📌 Pinned
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {pinned.map(n => (
                        <NoteCard key={n.id} note={n}
                          onEdit={setEditingNote}
                          onDelete={handleDelete}
                          onPin={handlePin}
                          onTagClick={setActiveTag}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* All notes */}
              {unpinned.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-4)' }}>
                      Notes
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {unpinned.map(n => (
                        <NoteCard key={n.id} note={n}
                          onEdit={setEditingNote}
                          onDelete={handleDelete}
                          onPin={handlePin}
                          onTagClick={setActiveTag}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* ── Editor modal ── */}
      <AnimatePresence>
        {editingNote && (
          <NoteEditor
            note={editingNote === 'new' ? null : editingNote}
            onSave={handleSave}
            onClose={() => setEditingNote(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}