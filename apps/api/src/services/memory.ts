import { supabase } from '../lib/supabase';
import {
  storeMemory,
  loadMemory,
  computeChat,
  type Message,
  type StoredMemory,
} from '../lib/zerog';
import { v4 as uuid } from 'uuid';

function generateTitle(messages: Message[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (!firstUserMsg) return 'New conversation';
  const text = firstUserMsg.content;
  return text.length > 50 ? text.slice(0, 47) + '...' : text;
}

export function buildMemorySummary(memories: StoredMemory[]): string {
  if (memories.length === 0) return '';

  const lines: string[] = [];
  lines.push('=== YOUR MEMORY OF THIS USER ===');
  lines.push(`You have had ${memories.length} previous conversation(s) with this user.`);
  lines.push('');

  const recent = memories.slice(-3);
  const older = memories.slice(0, -3);

  if (older.length > 0) {
    lines.push(`Earlier sessions (${older.length} total):`);
    for (const mem of older) {
      lines.push(`- ${new Date(mem.timestamp).toLocaleDateString()}: ${mem.summary}`);
    }
    lines.push('');
  }

  lines.push('Recent sessions (detailed):');
  for (const mem of recent) {
    lines.push(`\n[${new Date(mem.timestamp).toLocaleDateString()}]`);
    lines.push(`Summary: ${mem.summary}`);
    lines.push('Key exchanges:');
    const keyMessages = mem.messages.slice(-6);
    for (const msg of keyMessages) {
      const role = msg.role === 'user' ? 'User' : 'You';
      lines.push(`  ${role}: ${msg.content.slice(0, 200)}`);
    }
  }

  lines.push('\n=== END MEMORY ===');
  lines.push('Use this context to respond personally. Reference past conversations naturally.');

  return lines.join('\n');
}

export async function loadUserMemories(userId: string, encryptionKey?: string): Promise<StoredMemory[]> {
  const { data: memoryIndex, error } = await supabase
    .from('mv_memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Supabase query error loading memories:', error);
    return [];
  }

  if (!memoryIndex || memoryIndex.length === 0) return [];
  const memories = await Promise.all(
    (memoryIndex as any[]).map(async (idx) => {
      const root = idx.root_hash;
      console.log('Attempting to load memory from root_hash:', root);
      const mem = await loadMemory(root, encryptionKey, userId);
      if (!mem) console.error('Failed to load memory for root_hash:', root);
      return mem;
    })
  );

  return memories.filter((m): m is StoredMemory => m !== null && !(m as any).isEncrypted);
}

export async function saveSession(params: {
  userId: string;
  messages: Message[];
  summary: string;
  encryptionKey?: string;
}): Promise<{ rootHash: string; txHash: string | null } | null> {
  const { userId, messages, summary, encryptionKey } = params;
  const sessionId = uuid();

  const memory: StoredMemory = {
    sessionId,
    userId,
    messages,
    summary,
    timestamp: Date.now(),
    version: '1.0',
  };

  const result = await storeMemory(memory, encryptionKey);
  if (!result) return null;

  let dbTitle = summary || generateTitle(messages);
  if (encryptionKey) {
    try {
      const { encryptAES } = await import('../lib/crypto');
      dbTitle = encryptAES(dbTitle, encryptionKey);
    } catch (encErr) {
      console.error('Failed to encrypt database title:', encErr);
    }
  }

  const { data: insertData, error: insertError } = await supabase.from('mv_memories').insert({
    user_id: userId,
    session_id: sessionId,
    title: dbTitle,
    root_hash: result.rootHash,
    tx_hash: result.txHash,
    message_count: messages.length,
  });

  if (insertError) {
    console.error('Supabase insert error for mv_memories:', insertError);
    // continue returning result so caller knows upload succeeded
  }

  return result;
}

export async function summarizeSession(messages: Message[]): Promise<string> {
  if (messages.length === 0) return 'Empty session';

  try {
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');

    const summary = await computeChat(
      [
        {
          role: 'user',
          content: `Summarize this conversation in one sentence (max 100 chars):\n\n${transcript}`,
        },
      ],
      'You summarize conversations concisely. Return only the summary, nothing else.'
    );

    return summary.slice(0, 200);
  } catch {
    return generateTitle(messages);
  }
}
