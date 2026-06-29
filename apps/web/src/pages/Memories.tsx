import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemories } from '../hooks/useMemories';
import { MemoryCard } from '../components/memory/MemoryCard';
import { MemoryDetailModal } from '../components/memory/MemoryDetailModal';
import { PoweredByBadge } from '../components/ui/PoweredByBadge';

export default function Memories() {
  const { memories, isLoading } = useMemories();
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f0e8' }}>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl"
           style={{ background: 'rgba(245,240,232,0.92)', borderBottom: '1px solid rgba(120,95,68,0.13)' }}>
        <div className="flex items-center gap-3 px-4 py-3.5 max-w-2xl mx-auto">
          <button onClick={() => navigate('/chat')}
            className="p-1 rounded-lg transition-colors"
            style={{ color: '#a8927f' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#1c1914' }}>Your Memories</p>
            <p className="text-xs" style={{ color: '#a8927f' }}>Permanently stored on 0G — owned by you</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center"
                 style={{ background: 'rgba(99,102,241,0.7)' }}>
              <span className="text-white text-[8px] font-bold">0G</span>
            </div>
            <span className="text-xs" style={{ color: '#a8927f' }}>{memories.length} stored</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto w-full">

          {isLoading && (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl p-4 h-20 animate-pulse"
                     style={{ background: '#ede7dc', border: '1px solid rgba(120,95,68,0.10)' }} />
              ))}
            </div>
          )}

          {!isLoading && memories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                   style={{ background: '#ede7dc', border: '1px solid rgba(120,95,68,0.15)' }}>
                🧠
              </div>
              <div className="text-center px-6">
                <p className="font-semibold text-base" style={{ color: '#1c1914' }}>
                  No memories yet
                </p>
                <p className="text-sm mt-2 leading-relaxed max-w-[240px]" style={{ color: '#a8927f' }}>
                  Start a conversation. After a few exchanges MindVault saves
                  your memory permanently to 0G Storage.
                </p>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="hover:opacity-90 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-opacity active:scale-95"
                style={{ background: '#6366f1', boxShadow: '0 2px 12px rgba(99,102,241,0.2)' }}
              >
                Start a conversation →
              </button>
            </div>
          )}

          {!isLoading && memories.length > 0 && (
            <div className="flex flex-col gap-2">
              {memories.map((mem) => (
                <MemoryCard key={mem.id} memory={mem}
                  onClick={() => setSelectedHash(mem.root_hash)} />
              ))}
            </div>
          )}

          <div className="mt-8 mb-4">
            <PoweredByBadge />
          </div>
        </div>
      </div>

      <MemoryDetailModal hash={selectedHash} onClose={() => setSelectedHash(null)} />
    </div>
  );
}
