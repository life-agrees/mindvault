import { useMemoryDetail } from '../../hooks/useMemories';
import { ProofCard } from '../ui/ProofCard';

type Props = { hash: string | null; onClose: () => void };

export function MemoryDetailModal({ hash, onClose }: Props) {
  const { memory, isLoading, error } = useMemoryDetail(hash);
  if (!hash) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(28,20,14,0.35)' }} />

      {/* Sheet */}
      <div
        className="relative w-full max-w-2xl flex flex-col shadow-2xl"
        style={{
          background: '#fefcf8',
          border: '1px solid rgba(120,95,68,0.15)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '85vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0"
          style={{ background: 'rgba(120,95,68,0.2)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(120,95,68,0.10)' }}>
          <div>
            <p className="font-bold text-base" style={{ color: '#1c1914' }}>Memory Detail</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.7)' }}>
                <span className="text-white text-[7px] font-bold">0G</span>
              </div>
               <a
                href={`https://storagescan-galileo.0g.ai/file/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono underline hover:text-[#6366f1] transition-colors"
                style={{ color: '#a8927f' }}
                title="View on 0G Storage Explorer"
              >
                {hash.slice(0, 16)}…{hash.slice(-8)}
              </a>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: '#a8927f' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
              <p className="text-xs" style={{ color: '#a8927f' }}>Retrieving from 0G Storage…</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
              <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          {!isLoading && memory && (
            <div className="flex flex-col gap-3">
              {memory.isEncrypted ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    🔐
                  </div>
                  <div className="text-center">
                    <p className="font-semibold mb-1" style={{ color: '#1c1914' }}>End-to-End Encrypted</p>
                    <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#a8927f' }}>
                      This memory is AES-256-GCM encrypted. Only your derived key can unlock it.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  {memory.summary && (
                    <div className="rounded-xl p-3.5"
                      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: '#6366f1' }}>Summary</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#5c4f42' }}>{memory.summary}</p>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex flex-col gap-2 mt-1">
                    {(memory.messages || []).map((msg, i) => (
                      <div key={i} className="rounded-xl px-3.5 py-2.5 text-sm"
                        style={msg.role === 'user'
                          ? { background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', marginLeft: '2rem' }
                          : { background: '#f5f0e8', border: '1px solid rgba(120,95,68,0.12)', marginRight: '2rem' }
                        }>
                        <p className="text-xs mb-1 font-semibold uppercase tracking-wide"
                          style={{ color: '#c8b4a0' }}>
                          {msg.role === 'user' ? 'You' : 'MindVault'}
                        </p>
                        <p className="leading-relaxed" style={{ color: '#3d3028' }}>{msg.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* On-chain Transaction Proof - full proof card */}
                  <ProofCard rootHash={hash} txHash={memory.txHash} />

                  {/* Footer */}
                  <div className="text-center pt-3 pb-1 mt-2"
                    style={{ borderTop: '1px solid rgba(120,95,68,0.10)' }}>
                    <p className="text-xs leading-relaxed" style={{ color: '#c8b4a0' }}>
                      Permanently stored on 0G's decentralized network.<br />
                      No one can alter or delete it.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
