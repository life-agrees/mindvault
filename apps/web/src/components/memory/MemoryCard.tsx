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

export function MemoryCard({ memory, onClick }: Props) {
  const isEncrypted = memory.title && memory.title.includes(':') && memory.title.length > 60;
  const displayTitle = isEncrypted ? '🔐 Encrypted memory' : (memory.title || 'Untitled session');

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
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <p className="text-sm font-medium leading-snug flex-1 line-clamp-2"
           style={{ color: '#1c1914' }}>
          {displayTitle}
        </p>
        <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#c8b4a0' }}>
          {timeAgo(memory.created_at)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: '#a8927f' }}>
          {memory.message_count} messages
        </span>
        <span style={{ color: '#d4c4b0' }}>·</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-colors"
               style={{ background: 'rgba(99,102,241,0.65)' }}>
            <span className="text-white text-[7px] font-bold">0G</span>
          </div>
          <span className="text-xs font-mono" style={{ color: '#c8b4a0' }}>
            {memory.root_hash.slice(0, 10)}…
          </span>
        </div>
        {isEncrypted && (
          <span className="ml-auto text-[10px] font-semibold rounded px-1.5 py-0.5"
                style={{ color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.18)' }}>
            E2EE
          </span>
        )}
      </div>
    </button>
  );
}
