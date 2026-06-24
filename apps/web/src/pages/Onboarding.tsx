import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PoweredByBadge } from '../components/ui/PoweredByBadge';
import logoImg from '../assets/logo.png';
import coverImg from '../assets/cover.jpg';

export default function Onboarding() {
  const { ready, authenticated, login } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && authenticated) navigate('/chat');
  }, [ready, authenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
         style={{ background: '#f5f0e8' }}>
      
      {/* Dynamic inline styles for premium float and staggered entry animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientPulse {
          0%, 100% { opacity: 0.25; transform: scale(1) translate(-50%, -50%); }
          50% { opacity: 0.35; transform: scale(1.15) translate(-48%, -52%); }
        }
        .animate-float-logo {
          animation: float 5s ease-in-out infinite;
        }
        .animate-fade-in-stagger {
          opacity: 0;
          animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .glow-orb-1 {
          animation: gradientPulse 8s ease-in-out infinite alternate;
        }
        .glow-orb-2 {
          animation: gradientPulse 10s ease-in-out infinite alternate-reverse;
        }
      `}</style>

      {/* Decorative ambient lighting orbs (0G color theme + parchment) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/2 w-[650px] h-[650px] rounded-full blur-[90px] glow-orb-1"
             style={{ background: 'radial-gradient(circle, rgba(212,196,168,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[80px] glow-orb-2"
             style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm flex flex-col z-10">
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center mb-9 text-center animate-fade-in-stagger" style={{ animationDelay: '50ms' }}>
          <img src={logoImg} className="w-20 h-20 rounded-[22px] mb-5 shadow-lg animate-float-logo" alt="MindVault Logo" />
          <h1 className="text-4xl font-bold tracking-tight" 
              style={{ 
                color: '#1c1914', 
                fontFamily: 'Outfit, Inter, sans-serif',
                letterSpacing: '-0.02em' 
              }}>
            MindVault
          </h1>
          <p className="text-sm mt-3 text-center max-w-[280px] leading-relaxed" style={{ color: '#6b5a49' }}>
            The AI companion that remembers you forever — and <strong style={{ color: '#1c1914', fontWeight: 600 }}>you own</strong> every memory.
          </p>
        </div>

        {/* Cover Image Banner */}
        <div className="w-full rounded-2xl overflow-hidden shadow-md border border-[rgba(120,95,68,0.13)] mb-6 animate-fade-in-stagger"
             style={{ animationDelay: '100ms' }}>
          <img src={coverImg} className="w-full h-auto object-cover block" alt="MindVault Banner" />
        </div>

        {/* Tactile Feature cards */}
        <div className="flex flex-col gap-3 mb-9">
          {[
            { icon: '🧠', title: 'Permanent Memory', desc: 'Remembers every conversation context' },
            { icon: '🔐', title: 'Cryptographic Privacy', desc: 'AES-256-GCM encrypted via your wallet signature' },
            { icon: '⛓️', title: 'Decentralized Sovereignty', desc: 'Stored permanently on the 0G network' },
          ].map((item, index) => (
            <div key={item.title}
              className="flex items-center gap-4 rounded-2xl px-4.5 py-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(120,95,68,0.06)] cursor-default group animate-fade-in-stagger"
              style={{ 
                background: '#fefcf8', 
                border: '1px solid rgba(120,95,68,0.13)',
                animationDelay: `${(index + 1) * 120}ms`
              }}
            >
              <div className="text-2xl flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors group-hover:bg-rgba(99,102,241,0.05)"
                   style={{ background: 'rgba(120,95,68,0.04)' }}>
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: '#1c1914' }}>{item.title}</p>
                <p className="text-xs mt-0.5 leading-normal" style={{ color: '#a8927f' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="flex flex-col gap-3.5 animate-fade-in-stagger" style={{ animationDelay: '480ms' }}>
          <button
            onClick={login}
            className="w-full text-white font-semibold py-4.5 rounded-2xl
                       transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] cursor-pointer"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', 
              boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
              fontSize: '15px'
            }}
          >
            Start your memory vault →
          </button>
          <div className="text-center flex flex-col gap-3">
            <p className="text-xs leading-relaxed max-w-[280px] mx-auto" style={{ color: '#a8927f' }}>
              No logins or emails required. Access is cryptographically backed by your signature.
            </p>
            <div style={{ opacity: 0.8 }}>
              <PoweredByBadge />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
