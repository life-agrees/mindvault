import { type MemoryIndexItem } from '../../hooks/useMemories';

type Props = { memory: MemoryIndexItem; onClick: () => void };

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const EXPLORER_BASE = 'https://storagescan-galileo.0g.ai/file/';

export function MemoryCard({ memory, onClick }: Props) {
  const isEncrypted = !!(memory.title && memory.title.includes(':') && memory.title.length > 60);
  const cardTitle = isEncrypted ? '🔐 Encrypted Memory' : '🧠 Conversation Memory';
  const summaryText = isEncrypted
    ? 'This memory is AES-256-GCM encrypted. Only your derived key can unlock and read it.'
    : (memory.title || 'No summary available.');

  const hashShort = memory.root_hash.slice(0, 10) + '…';
  const explorerUrl = `${EXPLORER_BASE}${memory.root_hash}`;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all duration-150 active:scale-[0.99] group"
      style={{
        background: '#fefcf8',
        border: '1px solid rgba(120,95,68,0.13)',
        boxShadow: '0 1px 4px rgba(120,95,68,0.05)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = '#f5efe4';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,95,68,0.22)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = '#fefcf8';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,95,68,0.13)';
      }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider"
           style={{ color: '#6366f1' }}>
          {cardTitle}
        </p>
        <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#c8b4a0' }}>
          {timeAgo(memory.created_at)}
        </span>
      </div>

      {/* Summary preview */}
      <p className="text-sm font-medium leading-relaxed mb-3" style={{ color: '#1c1914' }}>
        {summaryText}
      </p>

      {/* Footer row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs" style={{ color: '#a8927f' }}>
          {memory.message_count} messages
        </span>
        <span style={{ color: '#d4c4b0' }}>·</span>

        {/* 0G hash — clickable block explorer link */}
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}  // don't open modal on hash click
          className="flex items-center gap-1.5 group/hash"
          title="View on 0G Storage Explorer"
        >
          <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
               style={{ background: 'rgba(99,102,241,0.65)' }}>
            <span className="text-white text-[7px] font-bold">0G</span>
          </div>
          <span className="text-xs font-mono transition-colors"
                style={{ color: '#c8b4a0' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6366f1')}
                onMouseLeave={e => (e.currentTarget.style.color = '#c8b4a0')}>
            {hashShort}
          </span>
          {/* External link icon */}
          <svg className="w-2.5 h-2.5 opacity-0 group-hover/hash:opacity-60 transition-opacity"
               style={{ color: '#6366f1' }}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* On-chain proof badge */}
        {memory.tx_hash && (
          <a
            href={`https://chainscan-galileo.0g.ai/tx/${memory.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            title="View on-chain transaction"
            className="flex items-center gap-1 ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-md transition-colors"
            style={{ background: 'rgba(34,197,94,0.10)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.20)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.10)')}
          >
            ✓ on-chain
          </a>
        )}

        {isEncrypted && !memory.tx_hash && (
          <span className="ml-auto text-[10px] font-semibold rounded px-1.5 py-0.5"
                style={{ color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.18)' }}>
            E2EE
          </span>
        )}
      </div>
    </button>
  );
}

