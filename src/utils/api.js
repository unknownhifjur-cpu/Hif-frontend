/**
 * API utility — connects frontend to backend
 * Base URL is configurable via VITE_API_URL environment variable.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Send a question and get an AI answer
 */
export async function askQuestion({ sessionId, chatId, question, subject }) {
  const res = await fetch(`${BASE_URL}/chat/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, chatId, question, subject })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Failed to get AI response');
  }

  return res.json();
}

/**
 * Get all chats for the current session
 */
export async function getChatHistory(sessionId) {
  const res = await fetch(`${BASE_URL}/chat/history?sessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error('Failed to load chat history');
  return res.json();
}

/**
 * Get full chat messages
 */
export async function getChatById(chatId, sessionId) {
  const res = await fetch(`${BASE_URL}/chat/${chatId}?sessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error('Failed to load chat');
  return res.json();
}

/**
 * Delete a chat
 */
export async function deleteChat(chatId, sessionId) {
  const res = await fetch(`${BASE_URL}/chat/${chatId}?sessionId=${encodeURIComponent(sessionId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete chat');
  return res.json();
}

/**
 * Create a new empty chat
 */
export async function createNewChat(sessionId, subject = 'General') {
  const res = await fetch(`${BASE_URL}/chat/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, subject })
  });
  if (!res.ok) throw new Error('Failed to create chat');
  return res.json();
}