import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Plus, X, Search,
  MessageSquare, HelpCircle, Moon, Sun, CalendarCheck, Timer, Gamepad2, PenLine, StickyNote, Download,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { groupChatsByDate, getSubject, formatRelativeTime } from '../../utils/subjects';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/* ─── Icon Rail Item ──────────────────────────────────────────────── */
function NavIcon({ icon: Icon, label, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      title={label}
      className="icon-btn"
      style={{
        background: active ? 'var(--accent-dim)' : 'transparent',
        color: active ? 'var(--accent-light)' : 'var(--text-3)',
      }}
    >
      <Icon size={17} />
    </motion.button>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────────── */
export default function Sidebar({
  chats, activeChatId, onSelectChat, onNewChat, onDeleteChat,
  isOpen, onClose, onHelpOpen, onPlannerOpen, onPomodoroOpen, onGameHubOpen, onWhiteboardOpen, onNotesOpen,
  isDark, onThemeToggle,
}) {
  const [search,     setSearch]     = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isMobile,   setIsMobile]   = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse state
  const { canInstall, install, isInstalled } = usePWAInstall();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Local handlers that optionally close/collapse sidebar ───
  const handleChatsClick = () => {
    // (Optional: switch to chat list view if needed)
    if (isMobile) onClose();
    else setIsCollapsed(true);
  };

  const handleNotesClick = () => {
    onNotesOpen();
    if (isMobile) onClose();
    else setIsCollapsed(true);
  };

  const handlePlannerClick = () => {
    onPlannerOpen();
    if (isMobile) onClose();
    else setIsCollapsed(true);
  };

  const handlePomodoroClick = () => {
    onPomodoroOpen();
    if (isMobile) onClose();
    else setIsCollapsed(true);
  };

  const handleGameHubClick = () => {
    onGameHubOpen();
    if (isMobile) onClose();
    else setIsCollapsed(true);
  };

  const handleWhiteboardClick = () => {
    onWhiteboardOpen();
    if (isMobile) onClose();
    else setIsCollapsed(true);
  };

  const filtered = chats.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const groups = groupChatsByDate(filtered);

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    if (deletingId === chatId) {
      await onDeleteChat(chatId);
      setDeletingId(null);
    } else {
      setDeletingId(chatId);
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  // Sidebar content – the icon rail is always rendered,
  // the chat list column is conditionally shown (on desktop based on isCollapsed, on mobile always when sidebar is open)
  const sidebarContent = (
    <motion.aside
      className="flex h-full"
      style={{ width: isMobile ? 300 : (isCollapsed ? 56 : 300) }}
      initial={false}
      animate={{ width: isMobile ? 300 : (isCollapsed ? 56 : 300) }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* ── Column 1: Icon Rail ─────────────────────── */}
      <div
        className="flex flex-col items-center py-4 gap-2 flex-shrink-0"
        style={{
          width: 56,
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--border-0)',
        }}
      >
        {/* Logo */}
        <div className="mb-3 w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4d7cff22, #00d4e822)', border: '1px solid var(--border-2)' }}
        >
          <img src="/favi-bg.png" alt="Hif AI" className="w-6 h-6 object-contain" />
        </div>

        {/* Desktop expand/collapse toggle – only visible on desktop */}
        {!isMobile && (
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            whileTap={{ scale: 0.9 }}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="icon-btn mb-2"
            style={{
              background: 'var(--bg-4)',
              color: 'var(--text-3)',
            }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </motion.button>
        )}

        {/* Nav icons */}
        <NavIcon icon={MessageSquare} label="Chats"          active onClick={handleChatsClick} />
        <NavIcon icon={StickyNote}    label="Quick Notes"    onClick={handleNotesClick} />
        <NavIcon icon={CalendarCheck} label="Study Planner"  onClick={handlePlannerClick} />
        <NavIcon icon={Timer}         label="Pomodoro Timer" onClick={handlePomodoroClick} />
        <NavIcon icon={Gamepad2}      label="Game Hub"       onClick={handleGameHubClick} />
        <NavIcon icon={PenLine}       label="Whiteboard"     onClick={handleWhiteboardClick} />

        <div className="flex-1" />

        {/* Install PWA button — only shown when installable */}
        <AnimatePresence>
          {canInstall && !isInstalled && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={install}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              title="Install Hif AI app"
              className="icon-btn"
              style={{
                background: 'linear-gradient(135deg, rgba(77,124,255,0.2), rgba(0,212,232,0.15))',
                color: 'var(--accent-light)',
                border: '1px solid var(--border-accent)',
                animation: 'pulse-ring 2s ease infinite',
              }}
            >
              <Download size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Theme toggle */}
        <motion.button
          onClick={onThemeToggle}
          whileTap={{ scale: 0.88 }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="icon-btn"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                exit={{    opacity: 0, rotate:  30, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={16} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: 30,  scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                exit={{    opacity: 0, rotate: -30, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={16} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <NavIcon icon={HelpCircle} label="Help" onClick={onHelpOpen} />
      </div>

      {/* ── Column 2: Chat List – hidden on desktop when collapsed ── */}
      {(!isMobile || (isMobile && isOpen)) && !(isMobile ? false : isCollapsed) && (
        <div
          className="flex-1 flex flex-col min-w-0"
          style={{ background: 'var(--bg-2)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 pt-4 pb-3"
            style={{ borderBottom: '1px solid var(--border-0)' }}
          >
            <div className="flex items-center gap-2">
              <h2
                className="text-sm font-semibold"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}
              >
                Chat logs
              </h2>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: 'var(--bg-5)',
                  color: 'var(--text-2)',
                  border: '1px solid var(--border-1)',
                }}
              >
                {chats.length}/50
              </span>
            </div>
            {isMobile && (
              <button
                onClick={onClose}
                className="icon-btn w-7 h-7"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* New Chat */}
          <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-0)' }}>
            <motion.button
              onClick={onNewChat}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: 'var(--accent)',
                color: 'white',
                boxShadow: '0 2px 12px rgba(77,124,255,0.35)',
                border: 'none',
              }}
            >
              <Plus size={14} /> New Chat
            </motion.button>
          </div>

          {/* Search */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-0)' }}>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: 'var(--bg-4)',
                border: '1px solid var(--border-1)',
              }}
            >
              <Search size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="bg-transparent text-xs outline-none w-full"
                style={{ color: 'var(--text-1)', fontFamily: 'var(--font-ui)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ color: 'var(--text-3)' }}>
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto py-2">
            {chats.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-3xl mb-3">💬</div>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  No chats yet. Start a new conversation!
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  No chats match "{search}"
                </p>
              </div>
            ) : (
              Object.entries(groups).map(([group, groupChats]) => (
                <div key={group} className="mb-4">
                  <div className="px-4 py-1">
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: 'var(--text-4)' }}
                    >
                      {group}
                    </span>
                  </div>
                  <AnimatePresence>
                    {groupChats.map(chat => {
                      const sub      = getSubject(chat.subject);
                      const isActive = chat._id === activeChatId;
                      const isDel    = deletingId === chat._id;

                      return (
                        <motion.div
                          key={chat._id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          onClick={() => { onSelectChat(chat._id); if (isMobile) onClose(); }}
                          className="chat-item group"
                          style={{
                            background: isActive ? 'var(--accent-dim)' : undefined,
                            borderColor: isActive ? 'var(--border-accent)' : 'transparent',
                            cursor: 'pointer',
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && (onSelectChat(chat._id), isMobile && onClose())}
                        >
                          <span className="text-sm flex-shrink-0 mt-0.5">{sub.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-medium truncate"
                              style={{ color: isActive ? 'var(--accent-light)' : 'var(--text-1)' }}
                            >
                              {chat.title}
                            </p>
                            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                              {formatRelativeTime(chat.lastActivity || chat.createdAt)}
                            </p>
                          </div>
                          <motion.button
                            onClick={e => handleDelete(e, chat._id)}
                            whileTap={{ scale: 0.85 }}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md"
                            style={{ color: isDel ? 'var(--red)' : 'var(--text-3)' }}
                            title={isDel ? 'Click to confirm' : 'Delete'}
                          >
                            {isDel
                              ? <span className="text-[10px] font-bold">✓?</span>
                              : <Trash2 size={12} />
                            }
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3 text-center"
            style={{ borderTop: '1px solid var(--border-0)' }}
          >
            <p className="text-[10px]" style={{ color: 'var(--text-4)' }}>
              ⏳ Chats auto-delete after 24h
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  );

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-20 md:hidden"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Slide-in panel */}
        <motion.div
          className="fixed top-0 left-0 h-full z-30"
          style={{ boxShadow: 'var(--shadow-lg)' }}
          initial={{ x: '-100%' }}
          animate={{ x: isOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        >
          {sidebarContent}
        </motion.div>
      </>
    );
  }

  return (
    <div style={{ borderRight: '1px solid var(--border-0)', flexShrink: 0 }}>
      {sidebarContent}
    </div>
  );
}