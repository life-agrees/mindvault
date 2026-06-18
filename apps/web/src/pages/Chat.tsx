import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { ChatInput } from '../components/chat/ChatInput';

export default function Chat() {
  const { logout: privyLogout } = usePrivy();
  const { mvUser, isSyncing, logout: localLogout } = useAuth();
  const chat = useChat();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  function handleLogout() { localLogout(); privyLogout(); }
  function handleNewChat() { chat.saveSession(); chat.startNewSession(); }

  const displayName = mvUser?.email?.split('@')[0] ?? mvUser?.display_name ?? 'friend';

  return (
    <div className="h-screen w-full flex overflow-hidden relative" style={{ background: '#f5f0e8' }}>

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
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>
            <span className="text-white text-sm">🧠</span>
          </div>
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
        </div>

        {/* Spacer */}
        <div className="flex-1" />

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
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-3 h-3 rounded-sm flex items-center justify-center flex-shrink-0"
                   style={{ background: 'rgba(99,102,241,0.65)' }}>
                <span className="text-white" style={{ fontSize: '6px', fontWeight: 700 }}>0G</span>
              </div>
              <span className="text-[10px] font-mono truncate" style={{ color: '#c8b4a0' }}>
                {chat.lastSaveHash.slice(0, 10)}…
              </span>
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
              <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-sm"
                     style={{ background: '#ede7dc', border: '1px solid rgba(120,95,68,0.15)' }}>
                  🧠
                </div>
                <div className="text-center max-w-sm px-4">
                  <p className="font-bold text-xl leading-tight" style={{ color: '#1c1914' }}>
                    {mvUser ? `Welcome back, ${displayName}` : 'Hello there'}
                  </p>
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: '#a8927f' }}>
                    Tell me anything. Every conversation is encrypted and stored permanently
                    on a network nobody controls.
                  </p>
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
            <ChatInput onSend={chat.sendMessage} disabled={chat.isThinking} />
            <p className="text-center text-[11px] mt-2.5" style={{ color: '#c8b4a0' }}>
              🔐 End-to-end encrypted · Permanently stored on 0G Storage
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
