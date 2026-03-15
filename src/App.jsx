import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/ChatWindow/ChatWindow';
import InputBar from './components/InputBar/InputBar';
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';
import HelpPage from './components/HelpPage/HelpPage';
import StudyPlanner from './components/StudyPlanner/StudyPlanner';
import PomodoroTimer from './components/PomodoroTimer/PomodoroTimer';
import GameHub from './components/GameHub/GameHub';
import Whiteboard from './components/Whiteboard/Whiteboard';
import QuickNotes from './components/QuickNotes/QuickNotes';
import LandingPage from './components/LandingPage/LandingPage';
import { askQuestion, getChatHistory, getChatById, deleteChat } from './utils/api';

function getSessionId() {
  let id = localStorage.getItem('hif-ai-session');
  if (!id) { id = uuidv4(); localStorage.setItem('hif-ai-session', id); }
  return id;
}

export default function App() {
  const sessionId = useRef(getSessionId()).current;

  // Show landing page to first-time visitors
  const [showLanding, setShowLanding] = useState(
    () => !localStorage.getItem('hifai-visited')
  );

  const handleEnterApp = () => {
    localStorage.setItem('hifai-visited', '1');
    setShowLanding(false);
  };

  const [chats,            setChats]            = useState([]);
  const [activeChatId,     setActiveChatId]     = useState(null);
  const [activeChat,       setActiveChat]       = useState(null);
  const [isLoading,        setIsLoading]        = useState(false);
  const [error,            setError]            = useState(null);
  const [subject,          setSubject]          = useState('General');
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [helpOpen,         setHelpOpen]         = useState(false);
  const [plannerOpen,      setPlannerOpen]      = useState(false);
  const [pomodoroOpen,     setPomodoroOpen]     = useState(false);
  const [gameHubOpen,      setGameHubOpen]      = useState(false);
  const [whiteboardOpen,   setWhiteboardOpen]   = useState(false);
  const [notesOpen,        setNotesOpen]        = useState(false);
  const [isDark,           setIsDark]           = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Apply light/dark class to <body>
  useEffect(() => {
    document.body.classList.toggle('light', !isDark);
  }, [isDark]);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [searchFocus,      setSearchFocus]      = useState(false);

  // ── Load history ────────────────────────────────────────────────────
  useEffect(() => {
    loadHistory();
    const iv = setInterval(loadHistory, 30000);
    return () => clearInterval(iv);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getChatHistory(sessionId);
      setChats(data.chats || []);
    } catch { /* silent */ } finally {
      setIsHistoryLoading(false);
    }
  }, [sessionId]);

  // ── Select chat ──────────────────────────────────────────────────────
  const selectChat = useCallback(async (chatId) => {
    setActiveChatId(chatId);
    setError(null);
    const local = chats.find(c => c._id === chatId);
    if (local) setActiveChat({ ...local, messages: [] });
    try {
      const data = await getChatById(chatId, sessionId);
      setActiveChat(data.chat);
      if (data.chat.subject) setSubject(data.chat.subject);
    } catch { setError('Failed to load chat.'); }
  }, [chats, sessionId]);

  // ── New chat ─────────────────────────────────────────────────────────
  const startNewChat = useCallback(() => {
    setActiveChatId(null);
    setActiveChat(null);
    setError(null);
    setSidebarOpen(false);
  }, []);

  // ── Send message ─────────────────────────────────────────────────────
  const handleSend = useCallback(async (question, overrideSubject) => {
    const sub = overrideSubject || subject;
    setIsLoading(true);
    setError(null);

    const tempMsg = {
      _id: 'temp-' + Date.now(),
      role: 'user',
      content: question,
      subject: sub,
      createdAt: new Date().toISOString(),
    };
    setActiveChat(prev => ({
      ...(prev || { _id: null, messages: [], subject: sub }),
      messages: [...(prev?.messages || []), tempMsg],
    }));

    try {
      const data = await askQuestion({ sessionId, chatId: activeChatId, question, subject: sub });
      if (!activeChatId) setActiveChatId(data.chatId);
      setActiveChat(prev => {
        const msgs = (prev?.messages || []).filter(m => !m._id?.startsWith('temp-'));
        return { ...prev, _id: data.chatId, title: data.title, messages: [...msgs, data.userMessage, data.assistantMessage] };
      });
      await loadHistory();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setActiveChat(prev => ({
        ...prev,
        messages: (prev?.messages || []).filter(m => !m._id?.startsWith('temp-')),
      }));
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, sessionId, subject, loadHistory]);

  const handleWelcomeStart = useCallback((question, questionSubject) => {
    setSubject(questionSubject);
    handleSend(question, questionSubject);
  }, [handleSend]);

  const handleRegenerate = useCallback(async () => {
    if (!activeChat?.messages?.length) return;
    const lastUser = [...(activeChat.messages || [])].reverse().find(m => m.role === 'user');
    if (lastUser) await handleSend(lastUser.content);
  }, [activeChat, handleSend]);

  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      await deleteChat(chatId, sessionId);
      setChats(prev => prev.filter(c => c._id !== chatId));
      if (activeChatId === chatId) { setActiveChatId(null); setActiveChat(null); }
    } catch { /* silent */ }
  }, [activeChatId, sessionId]);

  const hasChat = !!(activeChatId || activeChat);

  // Show landing page to new visitors
  if (showLanding) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          style={{ height: '100vh', overflowY: 'auto' }}
        >
          <LandingPage onEnter={handleEnterApp} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-1)' }}>
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={startNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHelpOpen={       () => { setHelpOpen(true);       setPlannerOpen(false); setPomodoroOpen(false); setGameHubOpen(false); setWhiteboardOpen(false); setNotesOpen(false); }}
        onPlannerOpen={    () => { setPlannerOpen(true);    setHelpOpen(false);    setPomodoroOpen(false); setGameHubOpen(false); setWhiteboardOpen(false); setNotesOpen(false); }}
        onPomodoroOpen={   () => { setPomodoroOpen(true);   setHelpOpen(false);    setPlannerOpen(false);  setGameHubOpen(false); setWhiteboardOpen(false); setNotesOpen(false); }}
        onGameHubOpen={    () => { setGameHubOpen(true);    setHelpOpen(false);    setPlannerOpen(false);  setPomodoroOpen(false); setWhiteboardOpen(false); setNotesOpen(false); }}
        onWhiteboardOpen={ () => { setWhiteboardOpen(true); setHelpOpen(false);    setPlannerOpen(false);  setPomodoroOpen(false); setGameHubOpen(false);   setNotesOpen(false); }}
        onNotesOpen={      () => { setNotesOpen(true);      setHelpOpen(false);    setPlannerOpen(false);  setPomodoroOpen(false); setGameHubOpen(false);   setWhiteboardOpen(false); }}
        isDark={isDark}
        onThemeToggle={() => setIsDark(d => !d)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top Header ── */}
        <header
          className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{
            height: 52,
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--border-0)',
          }}
        >
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden icon-btn"
            style={{ flexShrink: 0 }}
          >
            <Menu size={17} />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {helpOpen ? (
              <div>
                <h1 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>Help Center</h1>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Hif AI · Documentation</p>
              </div>
            ) : plannerOpen ? (
              <div>
                <h1 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>Study Planner</h1>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Hif AI · Daily Goals & Streaks</p>
              </div>
            ) : pomodoroOpen ? (
              <div>
                <h1 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>Pomodoro Timer</h1>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Hif AI · Focus Sessions</p>
              </div>
            ) : gameHubOpen ? (
              <div>
                <h1 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>Game Hub</h1>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Hif AI · Learn While You Play</p>
              </div>
            ) : whiteboardOpen ? (
              <div>
                <h1 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>Whiteboard</h1>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Hif AI · Sketch & Diagram</p>
              </div>
            ) : notesOpen ? (
              <div>
                <h1 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}>Quick Notes</h1>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Hif AI · Saved Locally</p>
              </div>
            ) : hasChat ? (
              <div>
                <h1
                  className="text-sm font-semibold truncate"
                  style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}
                >
                  {activeChat?.title || 'New Chat'}
                </h1>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                  Hif AI · Student Tutor
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1
                  className="text-sm font-bold"
                  style={{ fontFamily: 'var(--font-head)', color: 'var(--text-0)' }}
                >
                  AI Chat Helper
                </h1>
              </div>
            )}
          </div>

          {/* Search bar */}
          <motion.div
            animate={{ width: searchFocus ? 200 : 150 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: 'var(--bg-4)',
              border: `1px solid ${searchFocus ? 'var(--border-accent)' : 'var(--border-1)'}`,
            }}
          >
            <Search size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Search..."
              className="bg-transparent text-xs outline-none w-full"
              style={{ color: 'var(--text-1)', fontFamily: 'var(--font-ui)' }}
            />
          </motion.div>

          {/* Status dot */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="w-1.5 h-1.5 rounded-full pulse-ring"
              style={{ background: 'var(--green)' }}
            />
            <span className="text-[10px] hidden sm:inline" style={{ color: 'var(--text-3)' }}>
              Online
            </span>
          </div>
        </header>

        {/* ── Content area ── */}
        <AnimatePresence mode="wait">
          {helpOpen ? (
            <HelpPage key="help" onClose={() => setHelpOpen(false)} />
          ) : plannerOpen ? (
            <StudyPlanner key="planner" onClose={() => setPlannerOpen(false)} />
          ) : pomodoroOpen ? (
            <PomodoroTimer key="pomodoro" onClose={() => setPomodoroOpen(false)} />
          ) : gameHubOpen ? (
            <GameHub key="gamehub" onClose={() => setGameHubOpen(false)} />
          ) : whiteboardOpen ? (
            <Whiteboard key="whiteboard" onClose={() => setWhiteboardOpen(false)} />
          ) : notesOpen ? (
            <QuickNotes key="notes" onClose={() => setNotesOpen(false)} />
          ) : (
            <motion.div
              key="chat"
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {hasChat ? (
                <>
                  <ChatWindow
                    chat={activeChat}
                    isLoading={isLoading}
                    error={error}
                    onRegenerate={handleRegenerate}
                  />
                  <InputBar
                    onSend={handleSend}
                    disabled={isLoading}
                    currentSubject={subject}
                    onSubjectChange={setSubject}
                  />
                </>
              ) : (
                <>
                  <WelcomeScreen
                    onStartChat={handleWelcomeStart}
                    onSubjectSelect={setSubject}
                  />
                  <InputBar
                    onSend={handleSend}
                    disabled={isLoading}
                    currentSubject={subject}
                    onSubjectChange={setSubject}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}