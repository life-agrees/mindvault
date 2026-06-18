import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PoweredByBadge } from '../components/ui/PoweredByBadge';

export default function Onboarding() {
  const { ready, authenticated, login } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && authenticated) navigate('/chat');
  }, [ready, authenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
         style={{ background: '#f5f0e8' }}>

      {/* Subtle warm glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
             style={{ background: 'radial-gradient(circle, #d4c4a8 0%, transparent 70%)' }} />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-10 relative">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
             style={{ background: '#6366f1', boxShadow: '0 8px 32px rgba(99,102,241,0.25)' }}>
          <span className="text-white text-2xl">🧠</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1c1914' }}>
          MindVault
        </h1>
        <p className="text-sm mt-2 text-center max-w-xs leading-relaxed" style={{ color: '#6b5a49' }}>
          The AI that actually remembers you — and you own every memory.
        </p>
      </div>

      {/* Feature cards */}
      <div className="flex flex-col gap-2.5 mb-10 w-full max-w-sm">
        {[
          { icon: '🧠', title: 'Permanent memory', desc: 'Remembers every conversation, forever' },
          { icon: '🔐', title: 'You own it', desc: 'AES-256-GCM encrypted on 0G Storage' },
          { icon: '⛓️', title: 'Decentralized', desc: 'No company can delete or sell your data' },
        ].map((item) => (
          <div key={item.title}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: '#fefcf8', border: '1px solid rgba(120,95,68,0.13)' }}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#1c1914' }}>{item.title}</p>
              <p className="text-xs" style={{ color: '#a8927f' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={login}
          className="w-full text-white font-semibold py-4 rounded-2xl
                     transition-all duration-150 active:scale-[0.98]"
          style={{ background: '#6366f1', boxShadow: '0 4px 20px rgba(99,102,241,0.25)' }}
        >
          Get started — it's free
        </button>
        <PoweredByBadge />
      </div>
    </div>
  );
}
