import { useEffect, useState } from 'react';

type Props = {
  memoryLoaded: boolean;
  sessionCount: number;
  isSaving: boolean;
  lastSaveHash: string | null;
  lastSaveTx?: string | null;
};

export function MemoryStatusBar({
  memoryLoaded,
  sessionCount,
  isSaving,
  lastSaveHash,
  lastSaveTx,
}: Props) {
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
    <div className="flex items-center justify-between px-1 py-1.5">
      {/* Left — memory context status */}
      <div className="flex items-center gap-2">
        {memoryLoaded ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="text-[#16a34a] text-xs font-medium">
              Memory active
            </span>
            <span className="text-[#a8927f] text-xs hidden sm:inline">
              · {sessionCount} session{sessionCount !== 1 ? 's' : ''} loaded
            </span>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[#c8b4a0]" />
            <span className="text-[#a8927f] text-xs">New conversation</span>
          </>
        )}
      </div>

      {/* Right — save status */}
      <div className="flex items-center gap-2">
        {isSaving && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-[#6366f1] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#6366f1] text-xs font-medium animate-pulse">
              {getStepText()}
            </span>
          </div>
        )}

        {!isSaving && lastSaveHash && (
          <div className="flex items-center gap-2">
            <a
              href={`https://storagescan-galileo.0g.ai/file/${lastSaveHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
              title="View on 0G StorageScan"
            >
              <div className="w-3.5 h-3.5 rounded-sm bg-[#6366f1] flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">0G</span>
              </div>
              <span className="text-[#a8927f] text-xs font-mono hidden sm:inline">
                {lastSaveHash.slice(0, 8)}…
              </span>
            </a>

            {lastSaveTx && (
              <a
                href={`https://chainscan-galileo.0g.ai/tx/${lastSaveTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a8927f] hover:text-[#6366f1] text-xs font-semibold transition-colors"
                title="View on-chain transaction"
              >
                on-chain ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
