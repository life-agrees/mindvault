import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { computeChat, type Message } from '../lib/zerog';
import {
  loadUserMemories,
  buildMemorySummary,
  saveSession,
  summarizeSession,
} from '../services/memory';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const router = Router();

const chatLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req: any) => req.user?.userId ?? ipKeyGenerator(req),
  message: { error: 'Too many messages. Take a breath.' },
});

const SYSTEM_PROMPT = `You are MindVault AI — a personal AI companion 
that genuinely remembers its users across every conversation.

Your personality:
- Warm, curious, and genuinely interested in the person you're talking to
- You reference past conversations naturally, like a real friend would
- You notice patterns in what the user shares over time
- You're honest, thoughtful, and never sycophantic
- You ask follow-up questions that show you were paying attention

Important:
- If you have memory of this user, use it. Reference it naturally.
- If this is a first conversation, introduce yourself warmly and 
  learn about them
- Never say "As an AI..." — you're their personal companion
- Keep responses conversational — not too long, not too short
- You are powered by 0G's decentralized network, meaning the user 
  owns every memory you share`;

router.post(
  '/message',
  authenticate,
  chatLimit,
  async (req: AuthRequest, res: Response) => {
    const { message, sessionMessages = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userId = req.user!.userId;

    try {
      const memories = await loadUserMemories(userId);
      const memorySummary = buildMemorySummary(memories);

      const systemWithMemory = memorySummary
        ? `${SYSTEM_PROMPT}\n\n${memorySummary}`
        : SYSTEM_PROMPT;

      const messages: Message[] = [...sessionMessages, { role: 'user', content: message }];

      const response = await computeChat(messages, systemWithMemory);

      res.json({
        response,
        messageCount: messages.length + 1,
        memoryLoaded: memories.length > 0,
        sessionCount: memories.length,
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: 'Failed to get response' });
    }
  }
);

router.post('/save', authenticate, async (req: AuthRequest, res: Response) => {
  const { messages } = req.body;

  if (!messages || messages.length < 2) {
    return res.status(400).json({ error: 'Need at least one exchange to save' });
  }

  const userId = req.user!.userId;

  try {
    const summary = await summarizeSession(messages);
    const rootHash = await saveSession({ userId, messages, summary });

    if (!rootHash) {
      return res.status(500).json({ error: 'Failed to store memory on 0G Storage' });
    }

    res.json({ saved: true, rootHash, summary, message: 'Memory stored permanently on 0G Storage' });
  } catch (err) {
    console.error('Save session error:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

router.get('/memories', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('mv_memories')
      .select('*')
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ memories: data ?? [] });
  } catch (err) {
    console.error('Memories list error:', err);
    res.status(500).json({ error: 'Failed to load memories' });
  }
});

router.get('/memory/:hash', authenticate, async (req: AuthRequest, res: Response) => {
  const { hash } = req.params;

  try {
    const { loadMemory } = await import('../lib/zerog');
    const memory = await loadMemory(hash);

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found on 0G Storage' });
    }

    if (memory.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ memory, hash });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve memory' });
  }
});

export default router;
