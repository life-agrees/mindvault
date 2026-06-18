import axios from 'axios';
import { ethers } from 'ethers';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const RPC = process.env.ZERO_G_RPC!;
const STORAGE_RPC = process.env.ZERO_G_STORAGE_RPC!;
const COMPUTE_ENDPOINT = process.env.ZERO_G_COMPUTE_ENDPOINT!;
const PRIVATE_KEY = process.env.ZERO_G_PRIVATE_KEY!;
const API_KEY = process.env.ZERO_G_API_KEY || PRIVATE_KEY;

function getSigner() {
  const provider = new ethers.JsonRpcProvider(RPC);
  return new ethers.Wallet(PRIVATE_KEY, provider);
}

// Try to load either the recommended or legacy SDK at runtime without
// static imports so missing packages don't crash startup.
async function getStorageSdk(): Promise<any> {
  try {
    const req = Function('return require')();
    const m = req('@0gfoundation/0g-storage-ts-sdk');
    if (m) return m;
  } catch {}
  try {
    const req = Function('return require')();
    const m = req('@0glabs/0g-ts-sdk');
    if (m) return m;
  } catch {}
  try {
    return await import('@0gfoundation/0g-storage-ts-sdk');
  } catch {}
  try {
    return await import('@0glabs/0g-ts-sdk');
  } catch {}
  throw new Error('No 0G storage SDK installed. Install @0gfoundation/0g-storage-ts-sdk or @0glabs/0g-ts-sdk');
}

export type Message = { role: 'user' | 'assistant' | 'system'; content: string };

export async function computeChat(messages: Message[], systemPrompt: string): Promise<string> {
  try {
    const baseUrl = COMPUTE_ENDPOINT.endsWith('/v1')
      ? COMPUTE_ENDPOINT
      : `${COMPUTE_ENDPOINT}/v1`;

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: 'deepseek-v4-pro',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        timeout: 30000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from 0G Compute');

    console.log('✅ Response from 0G Compute');
    return text;
  } catch (err: any) {
    console.warn('0G Compute unavailable, using fallback:', err?.message);
    return await fallbackChat(messages, systemPrompt);
  }
}

async function fallbackChat(messages: Message[], systemPrompt: string): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';

  const localEchoFallback = async () => {
    const last = messages[messages.length - 1]?.content ?? '';
    return `Echo: ${last}`;
  };

  if (!GROQ_API_KEY) return await localEchoFallback();

  try {
    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1000,
      temperature: 0.7,
    };

    const res = await axios.post(`${GROQ_API_URL}/chat/completions`, payload, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      timeout: 30000,
    });

    const text = res.data?.choices?.[0]?.message?.content;

    if (!text) return await localEchoFallback();
    return text;
  } catch (err: any) {
    console.warn('GROQ fallback failed, using local echo:', err?.message);
    return await localEchoFallback();
  }
}

export type StoredMemory = {
  sessionId: string;
  userId: string;
  messages: Message[];
  summary: string;
  timestamp: number;
  version: string;
};

export async function storeMemory(memory: StoredMemory, encryptionKey?: string): Promise<string | null> {
  try {
    const signer = getSigner();
    let content = JSON.stringify({ ...memory, storedAt: Date.now(), app: 'mindvault' });
    
    if (encryptionKey) {
      const { encryptAES } = await import('./crypto');
      content = encryptAES(content, encryptionKey);
    }
    
    const buffer = Buffer.from(content, 'utf-8');

    const tmpName = `mindvault-memory-${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
    const tmpPath = path.join(os.tmpdir(), tmpName);

    let file: any;
    try {
      await fs.writeFile(tmpPath, buffer);
      const sdk = await getStorageSdk();
      const ZgFileLocal = sdk.ZgFile ?? sdk.Blob ?? sdk.default?.ZgFile ?? sdk.default ?? sdk;

      if (typeof ZgFileLocal.fromFilePath === 'function') file = await ZgFileLocal.fromFilePath(tmpPath);
      else if (typeof ZgFileLocal.fromFile === 'function') file = await ZgFileLocal.fromFile(tmpPath);
      else if (typeof ZgFileLocal.fromBuffer === 'function') file = await ZgFileLocal.fromBuffer(buffer, 'application/json');
      else if (typeof ZgFileLocal.fromBytes === 'function') file = await ZgFileLocal.fromBytes(buffer, 'application/json');
      else throw new Error('No compatible ZgFile factory found in installed SDK');
    } catch (zErr) {
      console.error('0G ZgFile creation error:', zErr && zErr.stack ? zErr.stack : zErr);
      try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
      return null;
    }

    let tree: any;
    try {
      const maybeTree = await file.merkleTree?.();
      if (Array.isArray(maybeTree)) {
        tree = maybeTree[0];
        if (!tree) throw maybeTree[1] ?? new Error('Empty merkle tree');
      } else tree = maybeTree;
    } catch (treeErr) {
      console.error('0G merkleTree error:', treeErr && treeErr.stack ? treeErr.stack : treeErr);
      try { await file.close?.(); } catch {}
      try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
      return null;
    }

    let rootHash: string | undefined;
    try { rootHash = typeof tree.rootHash === 'function' ? tree.rootHash() : tree.root_hash ?? tree.rootHash; } catch (rhErr) {
      console.error('Failed to read rootHash from merkle tree:', rhErr && rhErr.stack ? rhErr.stack : rhErr);
      return null;
    }

    try {
      const sdk2 = await getStorageSdk();
      const IndexerLocal = sdk2.Indexer ?? sdk2.default?.Indexer ?? sdk2.Indexer;
      const indexer = new IndexerLocal(STORAGE_RPC);
      const res = await indexer.upload(file, RPC, signer);
      if (Array.isArray(res)) {
        const [, uploadErr] = res;
        if (uploadErr) {
          console.error('0G upload error (tuple):', uploadErr);
          try { await file.close?.(); } catch {}
          try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
          return null;
        }
      }
    } catch (uploadErr) {
      console.error('0G upload exception:', uploadErr && uploadErr.stack ? uploadErr.stack : uploadErr);
      try { await file.close?.(); } catch {}
      try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
      return null;
    }

    try { await file.close?.(); } catch {}
    try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
    console.log('✅ Memory stored on 0G Storage:', rootHash);
    return rootHash ?? null;
  } catch (err) {
    console.warn('0G storage failed:', err && err.stack ? err.stack : err);
    return null;
  }
}

export async function loadMemory(rootHash: string, encryptionKey?: string): Promise<StoredMemory | null> {
  const tmpName = `mindvault-download-${rootHash}-${Date.now()}.json`;
  const tmpPath = path.join(os.tmpdir(), tmpName);
  try {
    const sdk = await getStorageSdk();
    const IndexerLocal = sdk.Indexer ?? sdk.default?.Indexer ?? sdk.Indexer;
    const indexer = new IndexerLocal(STORAGE_RPC);
    const downloadErr = await indexer.download(rootHash, tmpPath, false);

    if (downloadErr) {
      console.error('loadMemory 0G download error:', downloadErr);
      try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
      return null;
    }

    const data = await fs.readFile(tmpPath);
    let content = data.toString('utf-8');
    try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
    
    if (!content.trim().startsWith('{')) {
      // Content is encrypted
      if (encryptionKey) {
        const { decryptAES } = await import('./crypto');
        content = decryptAES(content, encryptionKey);
        return JSON.parse(content) as StoredMemory;
      } else {
        return { isEncrypted: true, ciphertext: content } as any;
      }
    }
    
    return JSON.parse(content) as StoredMemory;
  } catch (err) {
    console.error('loadMemory error:', err && err.stack ? err.stack : err);
    try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
    return null;
  }
}
