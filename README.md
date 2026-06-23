# MindVault 🧠

**The AI companion that actually remembers you — owned and verified by you.**

Built for **The Zero Cup** · 0G's Global Vibe Coding Tournament

[![Demo Video](https://img.shields.io/badge/Demo_Video-YouTube-red?style=for-the-badge&logo=youtube)](https://youtube.com/shorts/L20Mj668dc0?si=bhGKYH-HyhniXraU)

---

## 📺 Demo Video & Links
* **Watch the Walkthrough Video:** [YouTube Short Demo](https://youtube.com/shorts/L20Mj668dc0?si=bhGKYH-HyhniXraU)
* **Live App Link:** [mindvault-demo.vercel.app](https://mindvault-demo.vercel.app)

---

## 🧠 The Problem
Every AI assistant today has amnesia. Close ChatGPT, lose your context. Sign out of Gemini, it forgets you exist. Even if they do remember, that memory lives on a corporate database where it can be analyzed, deleted, or sold.

**MindVault fixes this by decoupling AI intelligence from memory storage.** Your companion remembers you permanently, but the memory database doesn't live on our servers — it belongs entirely to you on **0G's decentralized network**.

---

## 🚀 Key Features

### 🔐 1. Client-Side End-to-End Encryption (E2EE)
* **Wallet-Secured Keys:** Every memory is encrypted in the browser using a symmetric key derived cryptographically from your Privy embedded EVM wallet signature (`wallet.signMessage`).
* **Zero-Knowledge Backend:** The backend only sees and uploads opaque AES-256-GCM ciphertext to 0G Storage. Even the memory titles indexed in the database are fully encrypted.
* **Backward Compatibility:** Seamlessly falls back to legacy DID-based key derivation to decrypt older memories.
* **Self-Healing Key Timeout:** Falls back to DID-based derivation if wallet connection takes longer than 2.5 seconds to prevent onboarding hangs.

### 🔗 2. Dual-Layer On-Chain Verifiability
* **StorageScan Links:** Easily navigate to the exact 0G storage location to verify your raw data block at `storagescan-galileo.0g.ai/file/[root_hash]`.
* **ChainScan Galileo Links:** Inspect the EVM smart contract transaction verifying execution of your memory block storage on the blockchain at `chainscan-galileo.0g.ai/tx/[tx_hash]`.
* **Verifiable UI Badges:** Real-time visual cards and immutable stamps detail your transaction roots.

### 🧠 3. Agent Personality Export & Import (SNAP Snapshot)
* **Export SNAP Snapshot:** Download your companion's memory fingerprints, topic logs, and 0G cryptographic proof anchors as a portable JSON profile.
* **Restore Context:** Import a snapshot to instantly align a new session with your AI's custom personality snapshot.
* **Privacy-First:** SNAP snapshots contain only AI summaries and anchors — never raw message content.

### 📱 4. Premium Responsive UX & Performance
* **Visual Viewport Adaptive Typing:** Smooth scrolling keeps messages pinned above the keyboard when typing on mobile.
* **Parchment Theme Splash Screen:** Soft, pulsing load states keep onboarding delightful during signature/key derivation.
* **Temporal Awareness:** Real-time current date/time injected dynamically into 0G Compute prompts so the LLM understands relative dates.
* **Robust Error Boundaries:** Parchment-styled error boundaries ensure gracefully trapped errors instead of white screens.

---

## 🛠️ Architecture

```
[ User Prompt ]
       │
       ▼
[ Privy Auth & E2EE Key Derivation ] ──(Symmetric Key)
       │
       ▼
[ 0G Compute (Llama-3.3-70B) ] ──(Generates Response)
       │
       ▼
[ Client-Side Encryption (AES-256-GCM) ]
       │
       ▼
[ 0G Storage ] ──(Saves Ciphertext Root Hash)
       │
       ▼
[ 0G Chain (Newton Testnet) ] ──(Publishes Transaction Proof)
```

---

## 💻 Tech Stack
* **Frontend:** React + Vite + TailwindCSS (styled with custom warm parchment palette)
* **Backend:** Node.js + Express + TypeScript
* **Auth:** Privy (embedded wallets, social & email login)
* **AI Inference:** 0G Compute Network (Llama 3.3 70B)
* **Storage:** 0G Storage (decentralized, verifiable, permanent)
* **Database:** Supabase (stores only hash pointers and encrypted metadata)

---

## ⚙️ Running Locally

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/life-agrees/mindvault.git
   cd mindvault
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   * Create `apps/web/.env` and copy variables from `apps/web/.env.example`.
   * Create `apps/api/.env` and copy variables from `apps/api/.env.example`.

4. **Start Development Servers:**
   ```bash
   pnpm dev
   ```

5. **Build for Production:**
   ```bash
   pnpm -r build
   ```
