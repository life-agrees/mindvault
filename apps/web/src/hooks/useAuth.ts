import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { api } from '../lib/api';
import { deriveKeyFromSignature } from '../lib/crypto';

type MVUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  privy_did?: string;
};

export function useAuth() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const [mvUser, setMvUser] = useState<MVUser | null>(() => {
    const stored = localStorage.getItem('mv_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isSyncing, setIsSyncing] = useState(() => {
    try {
      const stored = localStorage.getItem('mv_user');
      const token = localStorage.getItem('mv_token');
      return !stored || !token;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!ready || !authenticated || !user) return;
    const token = localStorage.getItem('mv_token');
    if (!mvUser || !token) {
      syncUser();
    }
  }, [ready, authenticated, user, mvUser]);

  const syncUser = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      // Use Privy JWT access token — backend verifies it cryptographically
      const accessToken = await getAccessToken();
      const email = user.email?.address ?? (user as any).google?.email ?? null;

      const { data } = await api.post('/auth/login', {
        privyToken: accessToken,
        email,
      });

      localStorage.setItem('mv_token', data.token);
      localStorage.setItem('mv_user', JSON.stringify(data.user));
      setMvUser(data.user);

      // Derive E2EE key from privyDid (deterministic, no wallet needed)
      if (user.id && !sessionStorage.getItem('mv_encryption_key')) {
        const key = await deriveKeyFromSignature(user.id);
        sessionStorage.setItem('mv_encryption_key', key);
      }
    } catch (err) {
      console.error('Auth sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mv_token');
    localStorage.removeItem('mv_user');
    sessionStorage.removeItem('mv_encryption_key');
    setMvUser(null);
  };

  return { mvUser, isSyncing, logout };
}
