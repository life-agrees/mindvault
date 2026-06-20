import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export type MemoryIndexItem = {
  id: string;
  session_id: string;
  title: string;
  root_hash: string;
  message_count: number;
  created_at: string;
};

export type FullMemory = {
  sessionId: string;
  messages: { role: string; content: string }[];
  summary: string;
  timestamp: number;
  isEncrypted?: boolean;
  txHash?: string | null;
};

export function useMemories() {
  const [memories, setMemories] = useState<MemoryIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/chat/memories');
      setMemories(data.memories ?? []);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  return { memories, isLoading, refetch: fetchMemories };
}

export function useMemoryDetail(hash: string | null) {
  const [memory, setMemory] = useState<FullMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) { setMemory(null); return; }
    setIsLoading(true);
    setError(null);
    setMemory(null);

    api
      .get(`/chat/memory/${hash}`)
      .then(({ data }) => {
        setMemory(data.memory ? { ...data.memory, txHash: data.txHash } : null);
      })
      .catch(() => setError('Could not load this memory from 0G Storage'))
      .finally(() => setIsLoading(false));
  }, [hash]);

  return { memory, isLoading, error };
}
