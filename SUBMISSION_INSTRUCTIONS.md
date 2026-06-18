Submission snapshot: 06f8e4742fd9df19095cde1eaec81f7f8d61a95a
Tag: submission-2026-06-18-06f8e47

Quick run instructions

- Install dependencies (root uses pnpm):

```bash
pnpm install
```

- Start the API and web locally (concurrently in two terminals):

```bash
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - Web
cd apps/web
pnpm dev
```

- Production start (API):

```bash
cd apps/api
pnpm build
pnpm start
```

Required env vars (see `apps/api/.env.example`) — do NOT commit secrets.

Testing endpoints

- Test 0G compute directly (replace key):

```bash
ENDPOINT="https://router-api.0g.ai/v1"
KEY="app-sk-..."
curl -v -X POST "$ENDPOINT/chat/completions" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen2.5-omni-7b","messages":[{"role":"system","content":"test"},{"role":"user","content":"hello"}]}'
```

- Test the deployed API (replace host + JWT):

```bash
API_HOST="https://<your-api-host>"
JWT="<user_jwt>"
curl -v -X POST "$API_HOST/chat/message" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","sessionMessages":[]} '
```

Notes for judges

- The repo uses 0G Compute + 0G Storage. Provide valid 0G keys for compute and storage (testnet keys are fine).
- Replace any leaked keys (the contributor rotated secrets after submission). See `apps/api/.env.example` for required env names.
- If you cannot access 0G, set `GROQ_API_KEY` to use the fallback Groq endpoint (or remove fallback to use local echo).

Contact

If you need a runnable demo or zip, ask and I will produce `submission-06f8e47.zip` or a short demo video.
