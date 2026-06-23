type ProofCardProps = {
  rootHash: string;
  txHash?: string | null;
  compact?: boolean;
};

export function ProofCard({ rootHash, txHash, compact = false }: ProofCardProps) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
        style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}
      >
        {/* 0G badge */}
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: '#6366f1' }}
        >
          <span className="text-white font-bold" style={{ fontSize: '8px' }}>0G</span>
        </div>
        <a
          href={`https://storagescan-galileo.0g.ai/file/${rootHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono transition-colors truncate max-w-[120px]"
          style={{ color: '#6366f1' }}
          title={`View on 0G Storage Explorer: ${rootHash}`}
          onClick={e => e.stopPropagation()}
        >
          {rootHash.slice(0, 8)}…{rootHash.slice(-6)}
        </a>
        {txHash && (
          <a
            href={`https://chainscan-newton.0g.ai/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md transition-colors flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}
            title="View on-chain proof"
            onClick={e => e.stopPropagation()}
          >
            ✓ on-chain
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0.02) 100%)',
        border: '1px solid rgba(99,102,241,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#6366f1', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
        >
          <span className="text-white font-bold" style={{ fontSize: '9px' }}>0G</span>
        </div>
        <p className="text-xs font-semibold" style={{ color: '#1c1914' }}>Verified on 0G Network</p>
        <div
          className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          ✓ IMMUTABLE
        </div>
      </div>

      {/* Storage root hash */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#a8927f' }}>
          0G Storage Root Hash
        </p>
        <a
          href={`https://storagescan-galileo.0g.ai/file/${rootHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg flex items-center gap-2 group transition-all"
          style={{
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.12)',
            color: '#6366f1',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)')}
        >
          <span className="truncate">{rootHash}</span>
          <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* On-chain tx */}
      {txHash && (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#a8927f' }}>
            0G Chain Transaction
          </p>
          <a
            href={`https://chainscan-newton.0g.ai/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-all"
            style={{
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.15)',
              color: '#16a34a',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)')}
          >
            <span className="truncate">{txHash}</span>
            <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Compute proof note */}
      <div
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
        style={{ background: 'rgba(120,95,68,0.05)', border: '1px solid rgba(120,95,68,0.10)' }}
      >
        <span style={{ fontSize: '12px' }}>⚡</span>
        <p className="text-[10px] leading-relaxed" style={{ color: '#a8927f' }}>
          Response generated via <strong style={{ color: '#6b5a49' }}>0G Compute</strong> · Memory stored
          via <strong style={{ color: '#6b5a49' }}>0G Storage</strong>
        </p>
      </div>
    </div>
  );
}
