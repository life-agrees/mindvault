import { useState, useRef } from 'react';
import { api } from '../../lib/api';

type ImportResult = {
  imported: boolean;
  existingMemories: number;
  importedSummaries: number;
  message: string;
  note: string;
};

export function PersonalityPanel({ onClose }: { onClose: () => void }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const { data } = await api.get('/profile/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindvault-personality-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      const text = await file.text();
      const profile = JSON.parse(text);
      const { data } = await api.post('/profile/import', { profile });
      setImportResult(data);
    } catch (err: any) {
      setImportError(err?.response?.data?.error ?? 'Failed to import profile. Make sure it\'s a valid MindVault export.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(28,20,14,0.40)' }} />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg flex flex-col shadow-2xl"
        style={{
          background: '#fefcf8',
          border: '1px solid rgba(120,95,68,0.15)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1 flex-shrink-0"
          style={{ background: 'rgba(120,95,68,0.2)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(120,95,68,0.10)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.18)' }}>
              🧠
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#1c1914' }}>Agent Personality</p>
              <p className="text-[10px]" style={{ color: '#a8927f' }}>Export or import your AI companion's memory context</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: '#a8927f' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Export */}
          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.14)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: 'rgba(99,102,241,0.10)' }}>
                📦
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: '#1c1914' }}>Export Personality</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#a8927f' }}>
                  Download your AI persona as a JSON file. Includes memory summaries, topics,
                  and 0G Storage proof anchors. Use it to share context or back up your vault fingerprint.
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: exportSuccess ? '#16a34a' : '#6366f1',
                color: '#fff',
                boxShadow: '0 2px 10px rgba(99,102,241,0.25)',
                opacity: isExporting ? 0.7 : 1,
              }}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing export…
                </>
              ) : exportSuccess ? (
                '✓ Downloaded!'
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export as JSON
                </>
              )}
            </button>
          </div>

          {/* Import */}
          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'rgba(120,95,68,0.04)', border: '1px solid rgba(120,95,68,0.14)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: 'rgba(120,95,68,0.10)' }}>
                📂
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: '#1c1914' }}>Import Personality</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#a8927f' }}>
                  Load a previously exported MindVault personality file to restore context.
                  Your existing vault memories are preserved.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
              id="personality-import"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: 'rgba(120,95,68,0.10)',
                color: '#5c4f42',
                border: '1.5px dashed rgba(120,95,68,0.30)',
                opacity: isImporting ? 0.7 : 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(120,95,68,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(120,95,68,0.10)')}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Choose JSON File
                </>
              )}
            </button>

            {/* Import result */}
            {importResult && (
              <div className="rounded-xl p-3 flex flex-col gap-1"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}>
                <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>✓ {importResult.message}</p>
                <p className="text-[10px]" style={{ color: '#a8927f' }}>
                  {importResult.importedSummaries} summaries · {importResult.existingMemories} existing memories
                </p>
                <p className="text-[10px] italic" style={{ color: '#c8b4a0' }}>{importResult.note}</p>
              </div>
            )}

            {importError && (
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                <p className="text-xs" style={{ color: '#dc2626' }}>{importError}</p>
              </div>
            )}
          </div>

          {/* What's included note */}
          <div className="rounded-xl px-4 py-3 flex items-start gap-2.5"
            style={{ background: 'rgba(120,95,68,0.04)', border: '1px solid rgba(120,95,68,0.10)' }}>
            <span className="flex-shrink-0 mt-0.5" style={{ fontSize: '13px' }}>🔐</span>
            <p className="text-[10px] leading-relaxed" style={{ color: '#a8927f' }}>
              <strong style={{ color: '#6b5a49' }}>Privacy note:</strong> Exports contain only memory summaries
              and 0G proof anchors — never raw conversation content.
              Your encrypted memories remain permanently on 0G Storage, untouched.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
