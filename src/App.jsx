import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/ChatWindow/ChatWindow';
import InputBar from './components/InputBar/InputBar';
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';
import { askQuestion, getChatHistory, getChatById, deleteChat } from './utils/api';

/**
 * Get or create a persistent session ID stored in localStorage
 * This identifies the user without requiring login
 */
function getSessionId() {
  let id = localStorage.getItem('hif-ai-session');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('hif-ai-session', id);
  }
  return id;
}

export default function App() {
  const sessionId = useRef(getSessionId()).current;

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState('General');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // ─── Load chat history on mount ────────────────────────────────────────────
  useEffect(() => {
    loadHistory();

    // Poll for history updates every 30 seconds
    const interval = setInterval(loadHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getChatHistory(sessionId);
      setChats(data.chats || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [sessionId]);

  // ─── Load a specific chat when selected ────────────────────────────────────
  const selectChat = useCallback(async (chatId) => {
    setActiveChatId(chatId);
    setError(null);

    // Optimistically show the chat from our list first
    const localChat = chats.find(c => c._id === chatId);
    if (localChat) setActiveChat({ ...localChat, messages: [] });

    try {
      const data = await getChatById(chatId, sessionId);
      setActiveChat(data.chat);
      // Update subject to match the chat
      if (data.chat.subject) setSubject(data.chat.subject);
    } catch (err) {
      setError('Failed to load chat messages.');
    }
  }, [chats, sessionId]);

  // ─── Start a new chat session ───────────────────────────────────────────────
  const startNewChat = useCallback(() => {
    setActiveChatId(null);
    setActiveChat(null);
    setError(null);
    setSidebarOpen(false);
  }, []);

  // ─── Send a message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async (question, overrideSubject) => {
    const sub = overrideSubject || subject;
    setIsLoading(true);
    setError(null);

    // Optimistically add user message to UI
    const tempUserMsg = {
      _id: 'temp-user-' + Date.now(),
      role: 'user',
      content: question,
      subject: sub,
      createdAt: new Date().toISOString()
    };

    setActiveChat(prev => ({
      ...(prev || { _id: null, messages: [], subject: sub }),
      messages: [...(prev?.messages || []), tempUserMsg]
    }));

    try {
      const data = await askQuestion({
        sessionId,
        chatId: activeChatId,
        question,
        subject: sub
      });

      // Update active chat ID if this was a new chat
      if (!activeChatId) {
        setActiveChatId(data.chatId);
      }

      // Replace temp message with real messages from server
      setActiveChat(prev => {
        const messages = (prev?.messages || []).filter(m => !m._id?.startsWith('temp-'));
        return {
          ...prev,
          _id: data.chatId,
          title: data.title,
          messages: [...messages, data.userMessage, data.assistantMessage]
        };
      });

      // Refresh sidebar history
      await loadHistory();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      // Remove temp message on error
      setActiveChat(prev => ({
        ...prev,
        messages: (prev?.messages || []).filter(m => !m._id?.startsWith('temp-'))
      }));
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, sessionId, subject, loadHistory]);

  // ─── Handle welcome screen quick start ────────────────────────────────────
  const handleWelcomeStart = useCallback((question, questionSubject) => {
    setSubject(questionSubject);
    handleSend(question, questionSubject);
  }, [handleSend]);

  // ─── Delete a chat ──────────────────────────────────────────────────────────
  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      await deleteChat(chatId, sessionId);
      setChats(prev => prev.filter(c => c._id !== chatId));

      if (activeChatId === chatId) {
        setActiveChatId(null);
        setActiveChat(null);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  }, [activeChatId, sessionId]);

  return (
    <div className="h-screen flex bg-surface-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={startNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-surface-600 bg-surface-800/80 backdrop-blur-sm flex-shrink-0">
          {/* Hamburger for mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Chat title or logo */}
          <div className="flex-1 min-w-0">
            {activeChat ? (
              <div>
                <h1 className="text-sm font-semibold text-slate-200 truncate">{activeChat.title || 'New Chat'}</h1>
                <p className="text-[10px] text-slate-500">Hif AI • Student Tutor</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Custom logo image */}
                <img src="/favi-bg.png" alt="Hif AI" className="h-6 w-auto" />
                <span className="text-xs text-slate-500 hidden sm:inline">— Your AI Tutor</span>
              </div>
            )}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            <span className="text-[10px] text-slate-500 hidden sm:inline">Online</span>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeChatId || activeChat ? (
            <>
              <ChatWindow
                chat={activeChat}
                isLoading={isLoading}
                error={error}
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
        </div>
      </div>
    </div>
  );
}