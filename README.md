# MindVault 🧠

**The AI that actually remembers you — and you own every memory.**

Built for The Zero Cup · 0G's Global Vibe Coding Tournament

---

## The Problem

Every AI assistant you use today has amnesia. Close ChatGPT, come back 
tomorrow — it doesn't remember your name, your goals, or what you talked 
about. Worse: even if it did remember, that memory lives on someone 
else's server. They can delete it, sell it, or shut down and take your 
data with them.

## What MindVault Does

MindVault is a personal AI companion built entirely on 0G's decentralized 
network:

- **0G Compute** runs every AI inference — no centralized AI server
- **0G Storage** permanently stores every conversation — you own it, 
  cryptographically
- Close the app for months, come back — MindVault remembers everything, 
  verifiable by a hash only you can access

Remove 0G from this app and it stops working entirely. There's no 
database storing your conversations — there's only a 0G Storage root 
hash, indexed so you can find it.

## How It Works
You send a message

↓

0G Compute (Llama 3.3 70B) generates a response with full memory context

↓

After each exchange, the full conversation is hashed and stored 
permanently on 0G Storage

↓

Next session, MindVault loads your memory history from 0G and 
greets you like it never forgot

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Auth:** Privy (Google/email login)
- **AI Inference:** 0G Compute Network (Llama 3.3 70B)
- **Storage:** 0G Storage (decentralized, permanent)
- **Index:** Supabase (stores only hash pointers, never content)

## Running Locally

```bash
git clone <repo-url>
cd mindvault
pnpm install

# Set up environment variables in apps/web/.env and apps/api/.env
# See .env.example in each folder

pnpm dev
```

## Live Demo

[mindvault-demo.vercel.app](#)

## Demo Video

[Watch the 2-minute walkthrough](#)

## What's Next

- 0G Chain integration for on-chain memory ownership verification
- Export/share specific memories via their 0G hash
- Multi-modal memory — voice and image context stored on 0G
