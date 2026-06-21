import { type PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['email', 'google'],
  appearance: {
    theme: 'dark',
    accentColor: '#6366f1',
    showWalletLoginFirst: false,
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
};
