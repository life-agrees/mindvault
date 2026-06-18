import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

// Ensure env vars are loaded even when running from the repository root
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const envPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: envPath });
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Runtime guard: ensure the Supabase service-role key is not present
// in any Vite-exposed `VITE_` environment variable. This prevents
// accidental exposure of the service role to the frontend bundle.
try {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    for (const k of Object.keys(process.env)) {
      if (k.startsWith('VITE_')) {
        const v = process.env[k] ?? '';
        if (v && v === serviceKey) {
          console.error(`SECURITY: Detected Supabase service-role key in Vite env var ${k}. Remove this from frontend envs immediately.`);
          // Fail fast to avoid accidental exposure in builds/dev server
          throw new Error('Supabase service-role key exposed in Vite env');
        }

        const keyName = k.toUpperCase();
        if (keyName.includes('SUPABASE') && (keyName.includes('SERVICE') || keyName.includes('ROLE'))) {
          console.error(`SECURITY: Suspicious Vite env var ${k} may contain Supabase service-role data. Verify and remove it.`);
          throw new Error('Possible Supabase service-role exposure in Vite env');
        }
      }
    }
  }
} catch (err) {
  // Re-throw so startup fails and the developer notices immediately.
  throw err;
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // This is a server-side service-role client — Realtime is never used here.
    // Disabling it avoids the WebSocket startup error on Node < 22.
    realtime: {
      timeout: 0,
      heartbeatIntervalMs: 0,
      reconnectAfterMs: () => 999999999,
    } as any,
  }
);
