import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Memories from './pages/Memories';
import { SplashScreen } from './components/ui/SplashScreen';

import { useAuth } from './hooks/useAuth';

function Protected({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { mvUser, isSyncing } = useAuth();

  if (!ready || isSyncing || !mvUser) return <SplashScreen />;
  return authenticated ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const { ready, authenticated } = usePrivy();
  if (!ready) return <SplashScreen />;

  return (
    <Routes>
      <Route
        path="/"
        element={authenticated ? <Navigate to="/chat" replace /> : <Onboarding />}
      />
      <Route path="/chat" element={<Protected><Chat /></Protected>} />
      <Route path="/memories" element={<Protected><Memories /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
