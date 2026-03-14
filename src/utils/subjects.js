/**
 * Subject configuration with colors and icons
 */
export const SUBJECTS = [
  { id: 'General',     label: 'General',     emoji: '💬', color: 'bg-slate-700  text-slate-200 border-slate-600' },
  { id: 'Math',        label: 'Math',         emoji: '🔢', color: 'bg-blue-900/60  text-blue-300 border-blue-700' },
  { id: 'Science',     label: 'Science',      emoji: '🔬', color: 'bg-green-900/60 text-green-300 border-green-700' },
  { id: 'Programming', label: 'Programming',  emoji: '💻', color: 'bg-purple-900/60 text-purple-300 border-purple-700' },
  { id: 'English',     label: 'English',      emoji: '📖', color: 'bg-yellow-900/60 text-yellow-300 border-yellow-700' },
  { id: 'History',     label: 'History',      emoji: '🏛️', color: 'bg-orange-900/60 text-orange-300 border-orange-700' },
  { id: 'Geography',   label: 'Geography',    emoji: '🌍', color: 'bg-teal-900/60  text-teal-300 border-teal-700' },
  { id: 'Other',       label: 'Other',        emoji: '✨', color: 'bg-pink-900/60  text-pink-300 border-pink-700' },
];

export function getSubject(id) {
  return SUBJECTS.find(s => s.id === id) || SUBJECTS[0];
}

/**
 * Group chats by time period (Today, Yesterday, Older)
 */
export function groupChatsByDate(chats) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Older: [] };

  chats.forEach(chat => {
    const chatDate = new Date(chat.lastActivity || chat.createdAt);
    const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

    if (chatDay >= today) {
      groups.Today.push(chat);
    } else if (chatDay >= yesterday) {
      groups.Yesterday.push(chat);
    } else {
      groups.Older.push(chat);
    }
  });

  return groups;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
