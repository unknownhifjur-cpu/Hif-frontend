import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, X, Search } from 'lucide-react';
import { groupChatsByDate, getSubject, formatRelativeTime } from '../../utils/subjects';

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose
}) {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filtered = chats.filter(chat =>
    chat.title.toLowerCase().includes(search.toLowerCase())
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

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed md:relative top-0 left-0 h-full z-30 w-72 flex flex-col bg-[#0f172a] border-r border-sky-500/10 shadow-2xl"
        initial={{ x: isMobile ? '-100%' : 0 }}
        animate={{ x: isMobile ? (isOpen ? 0 : '-100%') : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
     {/* Header */}
<div className="p-4 border-b border-sky-500/10">
  <div className="flex items-center justify-between mb-3">
    <img src="/favi-bg.png" alt="Hif AI" className="h-10 w-auto" />
    {isMobile && (
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 transition-colors"
      >
        <X size={18} />
      </button>
    )}
  </div>

  <motion.button
    onClick={onNewChat}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-700 text-white text-sm font-medium hover:from-sky-500 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-95"
  >
    <Plus size={16} />
    New Chat
  </motion.button>
</div>
        {/* Search */}
        <div className="px-3 py-2 border-b border-sky-500/10">
          <div className="flex items-center gap-2 bg-[#1e293b] rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-sky-400 transition-all">
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto py-2 scroll-smooth">
          {chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-3xl mb-2 animate-float">💬</div>
              <p className="text-slate-500 text-xs">No chats yet. Start a new conversation!</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-slate-500 text-xs">No chats match "{search}"</p>
            </div>
          ) : (
            Object.entries(groups).map(([group, groupChats]) => (
              <div key={group} className="mb-3">
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {group}
                  </span>
                </div>
                <AnimatePresence>
                  {groupChats.map(chat => {
                    const sub = getSubject(chat.subject);
                    const isActive = chat._id === activeChatId;
                    const isDeleting = deletingId === chat._id;

                    return (
                      <motion.div
                        key={chat._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        role="button"
                        tabIndex={0}
                        onClick={() => { onSelectChat(chat._id); onClose(); }}
                        onKeyDown={e => e.key === 'Enter' && (onSelectChat(chat._id), onClose())}
                        className={`w-full text-left px-3 py-2 mx-1 rounded-xl cursor-pointer transition-all duration-150 group relative
                          ${isActive ? 'bg-sky-500/10 border border-sky-500/30 shadow-lg' : 'hover:bg-[#1e293b]'}`}
                        style={{ width: 'calc(100% - 8px)' }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-base flex-shrink-0 mt-0.5">{sub.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActive ? 'text-sky-300' : 'text-slate-300'}`}>
                              {chat.title}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {formatRelativeTime(chat.lastActivity || chat.createdAt)}
                            </p>
                          </div>

                          <motion.button
                            onClick={e => handleDelete(e, chat._id)}
                            className={`flex-shrink-0 p-1 rounded-lg text-[10px] transition-all`}
                            whileHover={{ scale: 1.2 }}
                            title={isDeleting ? 'Click again to confirm delete' : 'Delete chat'}
                          >
                            {isDeleting ? (
                              <span className="text-red-400 font-bold">✓?</span>
                            ) : (
                              <Trash2 size={14} className="text-slate-500 group-hover:text-red-400" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sky-500/10">
          <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1">
            <span className="text-sky-400">⏳</span> Chats auto-delete after 24h • Free forever
          </p>
        </div>
      </motion.aside>
    </>
  );
}