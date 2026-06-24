# Submission Instructions & Verification 🧠

**Submission Snapshot:** `e8f0a531021f0be5a0b780382aeae890380b0ee4`
**Latest Tag:** `submission-final`
**Walkthrough Video:** [Watch the YouTube Short Walkthrough](https://youtube.com/shorts/L20Mj668dc0?si=bhGKYH-HyhniXraU)

---

## 🚀 Quick Run Instructions

### 1. Install Dependencies
Run from the root directory to install all monorepo dependencies:
```bash
pnpm install
```

### 2. Configure Environment Variables
Create `.env` files in both workspace directories using the provided examples:
* For the Backend: Copy `apps/api/.env.example` to `apps/api/.env` and populate it.
* For the Frontend: Copy `apps/web/.env.example` to `apps/web/.env` and populate it.

### 3. Start Development Servers
Start both the Frontend and the API Backend concurrently from the root directory:
```bash
pnpm dev
```

### 4. Build for Production
To build both packages concurrently:
```bash
pnpm -r build
```

---

## 🧪 Testing & Verification

### 1. Verify 0G Compute Directly
Use this curl command to test 0G Compute router connectivity (replace with your proxy/router endpoint and api key):
```bash
ENDPOINT="https://router-api.0g.ai/v1" # or your specific proxy endpoint
KEY="app-sk-..."                      # your 0G compute API key
curl -v -X POST "$ENDPOINT/chat/completions" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen2.5-omni-7b","messages":[{"role":"system","content":"test"},{"role":"user","content":"hello"}]}'
```

### 2. Verify Deployed API Endpoints
To test the message and memory pipeline via the API (replace host and user JWT token):
```bash
API_HOST="https://<your-api-host>"
JWT="<user_jwt>"
curl -v -X POST "$API_HOST/chat/message" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","sessionMessages":[]}'
```

### 3. Automated End-to-End Test Scripts
We have included automated testing scripts inside `apps/api/` that test the entire integration and encryption flows:
```bash
cd apps/api

# Test basic auth, chat messaging, and 0G memory storage
node scripts/e2e.js

# Test E2EE AES-256-GCM encryption, decryption, and ciphertext protection
node scripts/e2e-encryption.js
```

---

## ⚖️ Notes for Judges
* **Zero-Knowledge Backend:** All memories are encrypted client-side in the browser using keys derived from the user's Privy embedded EVM wallet signature (`wallet.signMessage`). The backend only processes and stores ciphertext.
* **0G Networks Used:** The application requires 0G Compute (for LLM inference) and 0G Storage/0G Chain (for decentralized, verifiable memory anchors).
* **Galileo Testnet Support:** Transaction verification links correctly point to `https://chainscan-galileo.0g.ai/tx/` and file details to `https://storagescan-galileo.0g.ai/file/`.
* **Graceful Fallbacks:** If you do not have 0G API credentials active, you can define a `GROQ_API_KEY` in the API env to run on fallback, or run in local mock mode by setting `DEV_AUTH=true`.
