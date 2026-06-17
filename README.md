# MindVault — Local setup

This repository contains the MindVault monorepo. Run the following from your terminal to create the frontend scaffold and install the listed packages.

Step 1 — initialize workspace

```bash
cd ~
mkdir mindvault
cd mindvault
pnpm init
pnpm add -D concurrently -w
mkdir -p apps/web apps/api
git init
echo "node_modules\n.env\ndist\n.turbo" > .gitignore
```

Step 2 — frontend scaffold

```bash
cd apps/web
pnpm create vite . --template react-ts
pnpm install
pnpm add tailwindcss @tailwindcss/vite
pnpm add @privy-io/react-auth
pnpm add @tanstack/react-query
pnpm add react-router-dom
pnpm add axios
pnpm add framer-motion
pnpm add lucide-react
pnpm add clsx
```

After running these commands, continue with the backend scaffold and env files as you planned.
