type Props = {
  memoryLoaded: boolean;
  sessionCount: number;
  isSaving: boolean;
  lastSaveHash: string | null;
};

export function MemoryStatusBar({ memoryLoaded, sessionCount, isSaving, lastSaveHash }: Props) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      {/* Left — memory context */}
      <div className="flex items-center gap-2">
        {memoryLoaded ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#16a34a' }} />
            <span className="text-xs font-medium" style={{ color: '#16a34a' }}>Memory active</span>
            <span className="text-xs" style={{ color: '#c8b4a0' }}>
              · {sessionCount} past session{sessionCount !== 1 ? 's' : ''} loaded
            </span>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#c8b4a0' }} />
            <span className="text-xs" style={{ color: '#c8b4a0' }}>No previous context</span>
          </>
        )}
      </div>

      {/* Right — save status */}
      {isSaving && (
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 animate-spin"
               style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
          <span className="text-xs" style={{ color: '#6366f1' }}>Saving to 0G…</span>
        </div>
      )}
      {!isSaving && lastSaveHash && (
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
               style={{ background: 'rgba(99,102,241,0.7)' }}>
            <span className="text-white text-[6px] font-bold">0G</span>
          </div>
          <span className="text-xs font-mono" style={{ color: '#a8927f' }}>
            {lastSaveHash.slice(0, 8)}…
          </span>
          <span className="text-xs" style={{ color: '#16a34a' }}>✓</span>
        </div>
      )}
    </div>
  );
}
