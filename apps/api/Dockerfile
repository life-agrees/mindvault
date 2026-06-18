# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace manifests so pnpm can resolve the workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json

# Install ONLY the api workspace deps (no frozen-lockfile so CI never chokes
# on minor lockfile drift)
RUN pnpm install --filter api --no-frozen-lockfile

# Copy source and compile
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN pnpm run build

# ── Stage 2: runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm for production install
RUN npm install -g pnpm@9

# Copy workspace manifests (needed so pnpm resolves the api package)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json

# Production-only install
RUN pnpm install --filter api --prod --no-frozen-lockfile

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3002

CMD ["node", "dist/index.js"]
