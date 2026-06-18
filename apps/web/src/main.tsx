import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { privyConfig } from './lib/privy';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <PrivyProvider
          appId={import.meta.env.VITE_PRIVY_APP_ID || 'cmqi2y35q00ac0cjskghu02jq'}
          config={privyConfig}
        >
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </PrivyProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
