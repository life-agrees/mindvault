import { useEffect, useState, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
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
  const { wallets } = useWallets();

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

  const [keyDeriving, setKeyDeriving] = useState(false);
  const hasAttemptedRef = useRef(false);

  // Sync Privy state to Backend session token
  useEffect(() => {
    if (!ready || !authenticated || !user) return;
    const token = localStorage.getItem('mv_token');
    if (!mvUser || !token) {
      syncUser();
    }
  }, [ready, authenticated, user, mvUser]);

  // Derive E2EE key from Privy wallet signature (Option 1) & handle page reloads
  useEffect(() => {
    if (!ready || !authenticated || !user) return;

    const cachedKey = sessionStorage.getItem('mv_encryption_key');
    if (cachedKey) {
      if (keyDeriving) setKeyDeriving(false);
      return;
    }

    if (hasAttemptedRef.current) return;

    const isMockUser = !user.id || user.id.includes('test') || user.id.includes('enc') || user.id.includes('mock');

    if (isMockUser) {
      hasAttemptedRef.current = true;
      setKeyDeriving(true);
      deriveKeyFromSignature(user.id)
        .then((key) => {
          sessionStorage.setItem('mv_encryption_key', key);
          setKeyDeriving(false);
        })
        .catch((err) => {
          console.error('Dev key derivation failed:', err);
          setKeyDeriving(false);
        });
      return;
    }

    // Real users: block UI and wait for Privy wallet to load
    if (!keyDeriving) {
      setKeyDeriving(true);
    }

    if (wallets.length > 0) {
      hasAttemptedRef.current = true;
      const deriveKey = async () => {
        try {
          const wallet = wallets.find((w) => w.walletClientType === 'privy') || wallets[0];
          const msg = 'Unlock your MindVault memories securely.';
          const signature = await wallet.signMessage(msg);
          const key = await deriveKeyFromSignature(signature);
          sessionStorage.setItem('mv_encryption_key', key);
        } catch (err) {
          console.error('Wallet key derivation failed:', err);
        } finally {
          setKeyDeriving(false);
        }
      };
      deriveKey();
    }
  }, [ready, authenticated, user, wallets, keyDeriving]);

  const syncUser = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const accessToken = await getAccessToken();
      const email = user.email?.address ?? (user as any).google?.email ?? null;

      const { data } = await api.post('/auth/login', {
        privyToken: accessToken,
        email,
      });

      localStorage.setItem('mv_token', data.token);
      localStorage.setItem('mv_user', JSON.stringify(data.user));
      setMvUser(data.user);
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
    hasAttemptedRef.current = false;
  };

  return { mvUser, isSyncing: isSyncing || keyDeriving, logout };
}
