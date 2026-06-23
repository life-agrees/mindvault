import { useEffect, useState } from 'react';

type Props = {
  memoryLoaded: boolean;
  sessionCount: number;
  isSaving: boolean;
  lastSaveHash: string | null;
};

export function MemoryStatusBar({ memoryLoaded, sessionCount, isSaving, lastSaveHash }: Props) {
  const [saveStep, setSaveStep] = useState(0);

  useEffect(() => {
    if (isSaving) {
      setSaveStep(1);
      const t1 = setTimeout(() => setSaveStep(2), 1200);
      const t2 = setTimeout(() => setSaveStep(3), 2800);
      const t3 = setTimeout(() => setSaveStep(4), 4500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setSaveStep(0);
    }
  }, [isSaving]);

  const getStepText = () => {
    switch (saveStep) {
      case 1: return '0G Compute: Summarizing memory…';
      case 2: return 'E2EE: Encrypting payload locally…';
      case 3: return '0G Storage: Storing ciphertext…';
      case 4: return '0G Galileo Chain: Settling proof…';
      default: return 'Saving to 0G…';
    }
  };

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
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 animate-spin flex-shrink-0"
               style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
          <span className="text-xs font-medium animate-pulse" style={{ color: '#6366f1' }}>
            {getStepText()}
          </span>
        </div>
      )}
      {!isSaving && lastSaveHash && (
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)' }}>
            <span className="text-[#6366f1] text-[7px] font-bold">0G</span>
          </div>
          <a
            href={`https://storagescan-galileo.0g.ai/file/${lastSaveHash}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View on 0G StorageScan"
            className="text-xs font-mono underline hover:text-[#6366f1] transition-colors"
            style={{ color: '#a8927f' }}
          >
            {lastSaveHash.slice(0, 8)}…
          </a>
          <span className="text-xs" style={{ color: '#16a34a' }} title="Proof settled on Galileo chain">✓</span>
        </div>
      )}
    </div>
  );
}
