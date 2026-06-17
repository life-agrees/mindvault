import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { signToken } from '../lib/jwt';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { privyDid, email } = req.body;

  if (!privyDid) {
    return res.status(400).json({ error: 'privyDid is required' });
  }

  try {
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
