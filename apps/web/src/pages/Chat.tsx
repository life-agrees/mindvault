import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { ChatInput } from '../components/chat/ChatInput';
import { MemoryStatusBar } from '../components/chat/MemoryStatusBar';
import { PersonalityPanel } from '../components/memory/PersonalityPanel';
import { ProofCard } from '../components/ui/ProofCard';
import logoImg from '../assets/logo.png';
import coverImg from '../assets/cover.jpg';

export default function Chat() {
  const { logout: privyLogout } = usePrivy();
  const { mvUser, isSyncing, logout: localLogout } = useAuth();
  const chat = useChat();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);
  const [showPersonality, setShowPersonality] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, chat.isThinking]);

  useEffect(() => {
    if (chat.messages.length > 0 && chat.messages.length % 4 === 0) {
      chat.saveSession();
    }
  }, [chat.messages.length]);

  useEffect(() => {
    const handleUnload = () => { if (chat.messages.length >= 2) chat.saveSession(); };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [chat.messages]);

  // Visual viewport keyboard auto-scroll listener
  useEffect(() => {
    const handleResize = () => {
      scrollRef.current?.scrollIntoView({ behavior: 'auto' });
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // Auto-show and then dismiss the memory-saved toast
  useEffect(() => {
    if (!chat.toastMessage) { setToastVisible(false); return; }
    setToastExiting(false);
    setToastVisible(true);
    const hideTimer = setTimeout(() => {
      setToastExiting(true);
      setTimeout(() => { setToastVisible(false); chat.clearToast(); }, 300);
    }, 3200);
    return () => clearTimeout(hideTimer);
  }, [chat.toastMessage]);

  function handleLogout() { localLogout(); privyLogout(); }
  function handleNewChat() { chat.saveSession(); chat.startNewSession(); }

  const displayName = mvUser?.email?.split('@')[0] ?? mvUser?.display_name ?? 'friend';

  return (
    <div className="h-screen w-full flex overflow-hidden relative" style={{ background: '#f5f0e8' }}>

      {/* Decorative ambient lighting orbs (0G color theme + parchment) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
             style={{ background: 'radial-gradient(circle, rgba(212,196,168,0.45) 0%, transparent 70%)' }} />
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] rounded-full blur-[120px] opacity-30"
             style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#1c1914]/30 md:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col flex-shrink-0 h-full transition-transform duration-300 transform md:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          width: '220px',
          background: '#ede7dc',
          borderRight: '1px solid rgba(120,95,68,0.15)',
        }}
      >
        {/* Brand (with safe-top for notched devices) */}
        <div className="flex items-center gap-2.5 px-4 py-5 safe-top"
             style={{ borderBottom: '1px solid rgba(120,95,68,0.12)' }}>
          <img src={logoImg} className="w-8 h-8 rounded-[9px] shadow-sm flex-shrink-0" alt="MindVault Logo" />
          <div>
            <p className="font-bold text-sm leading-none" style={{ color: '#1c1914' }}>MindVault</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#a8927f' }}>AI Memory</p>
          </div>
        </div>

        {/* Nav Actions */}
        <div className="flex flex-col gap-1 px-3 py-3">
          {/* New Chat */}
          <button
            onClick={() => { handleNewChat(); setSidebarOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: '#ffffff', background: '#6366f1', boxShadow: '0 2px 8px rgba(99,102,241,0.20)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4f52d4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#6366f1')}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>

          {/* Memories */}
          <button
            onClick={() => { navigate('/memories'); setSidebarOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
            style={{ color: '#5c4f42', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(120,95,68,0.10)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Memories
          </button>
          {/* Personality export */}
          <button
            onClick={() => { setShowPersonality(true); setSidebarOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
            style={{ color: '#5c4f42', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(120,95,68,0.10)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Personality
          </button>
        </div>

        {/* Recent Sessions */}
        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-1" style={{ color: '#a8927f' }}>
            Recent Sessions
          </p>
          {chat.recentSessions.length === 0 ? (
            <p className="text-[11px] px-3 italic" style={{ color: '#a8927f' }}>No recent sessions</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {chat.recentSessions.map(session => {
                const isActive = chat.sessionId === session.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => { chat.loadSession(session); setSidebarOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all duration-150 truncate flex items-center justify-between group`}
                    style={{
                      color: isActive ? '#1c1914' : '#5c4f42',
                      background: isActive ? 'rgba(120,95,68,0.08)' : 'transparent',
                      fontWeight: isActive ? '600' : 'normal'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(120,95,68,0.06)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                  >
                    <span className="truncate pr-2">{session.title}</span>
                    {session.lastSaveHash && (
                      <span className="flex-shrink-0 text-[8px] font-bold px-1 py-0.5 rounded"
                            style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                        0G
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Memory Status */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(120,95,68,0.12)' }}>
          {chat.memoryLoaded ? (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#16a34a' }} />
              <span className="text-[11px]" style={{ color: '#6b5a49' }}>
                {chat.sessionCount} memor{chat.sessionCount === 1 ? 'y' : 'ies'} loaded
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#c8b4a0' }} />
              <span className="text-[11px]" style={{ color: '#a8927f' }}>No past memories</span>
            </div>
          )}

          {chat.isSaving && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin flex-shrink-0"
                   style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
              <span className="text-[10px]" style={{ color: '#a8927f' }}>Saving to 0G…</span>
            </div>
          )}

          {chat.lastSaveHash && !chat.isSaving && (
            <div className="mb-3">
              <ProofCard rootHash={chat.lastSaveHash} txHash={chat.lastSaveTx} compact={true} />
            </div>
          )}

          {/* User + Sign out */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ background: '#6366f1' }}>
                <span className="text-white text-[8px] font-bold">{displayName[0]?.toUpperCase()}</span>
              </div>
              <span className="text-xs truncate" style={{ color: '#6b5a49' }}>{displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex-shrink-0 p-1 rounded-lg transition-colors"
              style={{ color: '#c8b4a0' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#c8b4a0'; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#ede7dc]/80 backdrop-blur-md safe-top"
             style={{ borderBottom: '1px solid rgba(120,95,68,0.12)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg transition-colors"
            style={{ color: '#6b5a49' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm" style={{ color: '#1c1914' }}>🧠 MindVault</span>
          <button
            onClick={handleNewChat}
            className="p-1 rounded-lg transition-colors"
            style={{ color: '#6b5a49' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-5">

            {isSyncing && (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 rounded-full animate-spin"
                     style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
              </div>
            )}

            {!isSyncing && chat.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                {/* Custom Submission Banner */}
                <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-[rgba(120,95,68,0.13)]">
                  <img src={coverImg} className="w-full h-auto object-cover block" alt="MindVault Submission Banner" />
                </div>

                <img src={logoImg} className="w-18 h-18 rounded-[20px] shadow-md" alt="MindVault Logo" />

                <div className="text-center max-w-sm px-4">
                  <p className="font-bold text-xl leading-tight" style={{ color: '#1c1914' }}>
                    {chat.memoryLoaded ? `Welcome back, ${displayName} 👋` : mvUser ? `Hello, ${displayName}` : 'Hello there'}
                  </p>
                  {chat.memoryLoaded ? (
                    <p className="text-sm mt-3 leading-relaxed" style={{ color: '#a8927f' }}>
                      I remember you — <strong style={{ color: '#6b5a49' }}>{chat.sessionCount} past session{chat.sessionCount !== 1 ? 's' : ''}</strong> loaded from your encrypted vault on 0G. Pick up where we left off.
                    </p>
                  ) : (
                    <p className="text-sm mt-3 leading-relaxed" style={{ color: '#a8927f' }}>
                      Tell me anything. Every conversation is encrypted and stored permanently
                      on a network nobody controls.
                    </p>
                  )}
                </div>

                {/* Starter prompt chips — context-aware when memory is loaded */}
                <div className="flex flex-wrap justify-center gap-2 max-w-sm px-4">
                  {(chat.memoryLoaded
                    ? [
                        'What did we last talk about?',
                        'Continue where we left off',
                        'What do you remember about me?',
                        'Help me plan something new',
                      ]
                    : [
                        'What should I focus on this week?',
                        'Help me think through a decision',
                        'What have we talked about before?',
                        'I need to vent about something',
                      ]
                  ).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => chat.sendMessage(prompt)}
                      className="text-sm px-3.5 py-2 rounded-full transition-all duration-150 active:scale-95"
                      style={{
                        background: '#fefcf8',
                        border: '1px solid rgba(120,95,68,0.18)',
                        color: '#5c4f42',
                        boxShadow: '0 1px 4px rgba(120,95,68,0.06)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#f0e8d8';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,95,68,0.32)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '#fefcf8';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,95,68,0.18)';
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
                     style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', color: '#6366f1' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#6366f1' }} />
                  Powered by 0G Compute · Memories on 0G Storage
                </div>
              </div>
            )}

            {chat.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isError={msg.isError}
                onRetry={msg.isError ? chat.retryMessage : undefined}
              />
            ))}
            {chat.isThinking && <TypingIndicator />}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* ── Input Bar ── (pinned to bottom, content centered, safe-bottom for notched phones) */}
        <div className="w-full flex-shrink-0 px-4 sm:px-6 pb-5 pt-3 safe-bottom"
             style={{ background: 'rgba(245,240,232,0.95)', borderTop: '1px solid rgba(120,95,68,0.10)' }}>
          <div className="max-w-2xl mx-auto">
            <MemoryStatusBar
              memoryLoaded={chat.memoryLoaded}
              sessionCount={chat.sessionCount}
              isSaving={chat.isSaving}
              lastSaveHash={chat.lastSaveHash}
            />
            <ChatInput
              onSend={chat.sendMessage}
              disabled={chat.isThinking}
              onSave={chat.saveSession}
              isSaving={chat.isSaving}
              canSave={chat.messages.length >= 2 && !chat.lastSaveHash}
            />
            <div className="flex items-center justify-between mt-2 px-4">
              <div
                className="text-[11px] flex items-center gap-1 cursor-help group relative"
                style={{ color: '#c8b4a0' }}
              >
                <span>🔐 End-to-end encrypted · Stored on 0G</span>
                <span className="hidden sm:inline-block opacity-65 hover:opacity-100 transition-opacity">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>

                {/* Cryptographic info tooltip */}
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col gap-1 p-3 rounded-xl shadow-xl border text-[10px] w-64 leading-normal z-50 transition-all pointer-events-none"
                     style={{ background: '#fefcf8', borderColor: 'rgba(120,95,68,0.15)', color: '#6b5a49', boxShadow: '0 4px 20px rgba(120,95,68,0.12)' }}>
                  <p className="font-semibold text-[#1c1914] flex items-center gap-1">
                    🛡️ Cryptographic Spec
                  </p>
                  <p><strong>Algorithm:</strong> AES-256-GCM (Authenticated Encryption)</p>
                  <p><strong>Key Source:</strong> Derived via SHA-256 from your Privy embedded wallet signature</p>
                  <p><strong>Zero-Knowledge:</strong> Backend only sees ciphertext. Decryption is 100% client-side.</p>
                </div>
              </div>
              <p className="text-[11px] hidden sm:block" style={{ color: '#c8b4a0' }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Memory Saved Toast ── */}
      {toastVisible && chat.toastMessage && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none ${toastExiting ? 'toast-exit' : 'toast-enter'}`}
        >
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg"
               style={{
                 background: '#1c1914',
                 color: '#f5f0e8',
                 fontSize: '13px',
                 fontWeight: 500,
                 boxShadow: '0 8px 32px rgba(28,25,20,0.35)',
                 whiteSpace: 'nowrap',
               }}>
            <span style={{ color: '#4ade80' }}>✓</span>
            {chat.toastMessage}
          </div>
        </div>
      )}

      {/* ── Personality Panel ── */}
      {showPersonality && (
        <PersonalityPanel onClose={() => setShowPersonality(false)} />
      )}
    </div>
  );
}

