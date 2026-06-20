import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../lib/api';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  timestamp: number;   // unix ms
  isError?: boolean;
};

export type SessionHistoryItem = {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
  lastSaveHash?: string | null;
  lastSaveTx?: string | null;
};

export type ChatState = {
  messages: ChatMessage[];
  isThinking: boolean;
  isSaving: boolean;
  memoryLoaded: boolean;
  sessionCount: number;
  lastSaveHash: string | null;
  lastSaveTx: string | null;
  toastMessage: string | null;
  clearToast: () => void;
  sendMessage: (text: string) => Promise<void>;
  retryMessage: () => Promise<void>;
  saveSession: () => Promise<void>;
  startNewSession: () => void;
  sessionId: string;
  recentSessions: SessionHistoryItem[];
  loadSession: (session: SessionHistoryItem) => void;
};

const STORAGE_KEY = 'mv_active_session';

function genId() {
  return Math.random().toString(36).slice(2);
}

function getSessionTitle(msgs: ChatMessage[]) {
  const firstUser = msgs.find(m => m.role === 'user');
  if (!firstUser) return 'New Chat';
  return firstUser.content.length > 30 ? firstUser.content.slice(0, 28) + '...' : firstUser.content;
}

export function useChat(): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sessionId, setSessionId] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem('mv_active_session_id');
      if (saved) return saved;
      const newId = genId();
      sessionStorage.setItem('mv_active_session_id', newId);
      return newId;
    } catch {
      return genId();
    }
  });

  const [recentSessions, setRecentSessions] = useState<SessionHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('mv_recent_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isThinking, setIsThinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [memoryLoaded, setMemoryLoaded] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastSaveHash, setLastSaveHash] = useState<string | null>(null);
  const [lastSaveTx, setLastSaveTx] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const clearToast = useCallback(() => setToastMessage(null), []);

  // Sync current session changes to localStorage history
  useEffect(() => {
    if (messages.length === 0) return;

    setRecentSessions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === sessionId);
      const title = getSessionTitle(messages);
      const updatedItem: SessionHistoryItem = {
        id: sessionId,
        title,
        messages,
        timestamp: prev[existingIdx]?.timestamp || Date.now(),
        lastSaveHash,
        lastSaveTx,
      };

      let newHistory = [...prev];
      if (existingIdx !== -1) {
        newHistory[existingIdx] = updatedItem;
      } else {
        newHistory.unshift(updatedItem);
      }

      newHistory.sort((a, b) => b.timestamp - a.timestamp);
      newHistory = newHistory.slice(0, 5);

      try {
        localStorage.setItem('mv_recent_sessions', JSON.stringify(newHistory));
      } catch (err) {
        console.error('Failed to save recent sessions to localStorage', err);
      }
      return newHistory;
    });
  }, [messages, sessionId, lastSaveHash, lastSaveTx]);

  // Persist to sessionStorage on every message change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage full — non-critical
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: text, id: genId(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    dirtyRef.current = true;

    try {
      // Pass session history for AI context (exclude the just-added msg)
      const { data } = await api.post('/chat/message', {
        message: text,
        sessionMessages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: data.response,
        id: genId(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (data.memoryLoaded !== undefined) setMemoryLoaded(data.memoryLoaded);
      if (data.sessionCount !== undefined) setSessionCount(data.sessionCount);
    } catch (err: any) {
      console.error('Send message failed:', err);

      const isNetworkError = !err.response;
      const isRateLimit = err.response?.status === 429;
      const serverMessage = err.response?.data?.response;

      const errorContent = serverMessage ?? (
        isRateLimit
          ? "I need a moment — too many messages too fast. Try again shortly."
          : isNetworkError
            ? "I can't reach the network right now. Check your connection and try again."
            : "I'm having trouble responding right now. Try again in a moment."
      );

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorContent, id: genId(), timestamp: Date.now(), isError: true },
      ]);

      if (isNetworkError) dirtyRef.current = false;
    } finally {
      setIsThinking(false);
    }
  }, [messages]);

  const retryMessage = useCallback(async () => {
    // Find the last user message text
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove the last user message and the last error message from state
    setMessages((prev) => {
      const copy = [...prev];
      // Find last error assistant message index
      const errIdx = copy.map(m => m.role === 'assistant' && m.isError).lastIndexOf(true);
      if (errIdx !== -1) {
        copy.splice(errIdx, 1);
      }
      // Find last user message index
      const userIdx = copy.map(m => m.role === 'user').lastIndexOf(true);
      if (userIdx !== -1) {
        copy.splice(userIdx, 1);
      }
      return copy;
    });

    await sendMessage(lastUserMsg.content);
  }, [messages, sendMessage]);

  const saveSession = useCallback(async () => {
    if (messages.length < 2 || !dirtyRef.current) return;

    setIsSaving(true);
    try {
      const { data } = await api.post('/chat/save', {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (data.saved) {
        setLastSaveHash(data.rootHash);
        setLastSaveTx(data.txHash);
        dirtyRef.current = false;
        setToastMessage('✓ Memory stored on 0G — yours forever');
      }
    } catch (err) {
      console.error('Save session failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [messages]);

  const startNewSession = useCallback(() => {
    const newId = genId();
    setSessionId(newId);
    setMessages([]);
    setLastSaveHash(null);
    setLastSaveTx(null);
    setMemoryLoaded(false);
    setSessionCount(0);
    dirtyRef.current = false;
    try {
      sessionStorage.setItem('mv_active_session_id', newId);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const loadSession = useCallback((session: SessionHistoryItem) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setLastSaveHash(session.lastSaveHash || null);
    setLastSaveTx(session.lastSaveTx || null);
    dirtyRef.current = false;
    try {
      sessionStorage.setItem('mv_active_session_id', session.id);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session.messages));
    } catch {}
  }, []);

  return {
    messages,
    isThinking,
    isSaving,
    memoryLoaded,
    sessionCount,
    lastSaveHash,
    lastSaveTx,
    toastMessage,
    clearToast,
    sendMessage,
    retryMessage,
    saveSession,
    startNewSession,
    sessionId,
    recentSessions,
    loadSession,
  };
}
