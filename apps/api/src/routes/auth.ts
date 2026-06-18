import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { signToken } from '../lib/jwt';
import { PrivyClient } from '@privy-io/server-auth';

const router = Router();

// Singleton — reuses cached verification key across requests
const privyClient = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
  { timeout: 15000 }
);

router.post('/login', async (req: Request, res: Response) => {
  const { privyToken, email } = req.body;

  if (!privyToken) {
    return res.status(400).json({ error: 'privyToken is required' });
  }

  try {
    let privyDid: string;

    // Support dev bypass for E2E testing
    if (process.env.DEV_AUTH === 'true' && privyToken.startsWith('did:privy:')) {
      privyDid = privyToken;
    } else {
      const claims = await privyClient.verifyAuthToken(privyToken);

      privyDid = claims.userId;
    }

    let { data: user } = await supabase
      .from('mv_users')
      .select('*')
      .eq('privy_did', privyDid)
      .single();

    if (!user) {
      const { data: newUser, error } = await supabase
        .from('mv_users')
        .insert({ privy_did: privyDid, email: email ?? null })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    }

    const token = signToken({
      userId: user.id,
      privyDid: user.privy_did,
    });

    res.json({ token, user });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;

// Dev-only token helper (enabled with DEV_AUTH=true)
if (process.env.DEV_AUTH === 'true') {
  router.post('/dev-token', (req: Request, res: Response) => {
    const { privyDid, email } = req.body;
    if (!privyDid) return res.status(400).json({ error: 'privyDid is required' });

    const token = signToken({ userId: `dev-${privyDid}`, privyDid });
    return res.json({ token, user: { id: `dev-${privyDid}`, privy_did: privyDid, email: email ?? null } });
  });
}
