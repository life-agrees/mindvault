import { useState, useRef, type KeyboardEvent } from 'react';

type Props = {
  onSend: (text: string) => void;
  disabled: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
};

export function ChatInput({ onSend, disabled, onSave, isSaving, canSave }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const canSubmit = !!value.trim() && !disabled;
  const charCount = value.length;
  const showCount = charCount > 200;

  // Dynamic border glow based on char count
  const getBorderStyle = () => {
    if (charCount > 1000) return 'rgba(220,38,38,0.55)';
    if (charCount > 800) return 'rgba(234,179,8,0.45)';
    return 'rgba(120,95,68,0.18)';
  };

  const getBoxShadow = () => {
    if (charCount > 1000) return '0 0 0 2px rgba(220,38,38,0.12), 0 1px 6px rgba(220,38,38,0.10)';
    if (charCount > 800) return '0 0 0 2px rgba(234,179,8,0.10), 0 1px 6px rgba(120,95,68,0.06)';
    return '0 1px 6px rgba(120,95,68,0.06)';
  };

  return (
    <div>
      <div
        className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-all duration-200"
        style={{
          background: '#fefcf8',
          border: `1px solid ${getBorderStyle()}`,
          boxShadow: getBoxShadow(),
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); handleInput(); }}
          onKeyDown={handleKeyDown}
          placeholder="Tell MindVault anything..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-base sm:text-sm outline-none resize-none py-1.5 max-h-[120px]"
          style={{ color: '#1c1914', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
        />

        {/* Character count badge — only visible when long */}
        {showCount && (
          <span
            className="text-[10px] self-end pb-2 flex-shrink-0 font-mono transition-colors"
            style={{ color: charCount > 1000 ? '#dc2626' : charCount > 800 ? '#ca8a04' : '#c8b4a0' }}
          >
            {charCount}
          </span>
        )}

        {/* Manual save to 0G button */}
        {canSave && onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            title="Save this conversation to 0G Storage"
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 self-end"
            style={{
              background: isSaving ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.10)',
              border: '1px solid rgba(99,102,241,0.18)',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!isSaving) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSaving ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.10)'; }}
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                   style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8" />
              </svg>
            )}
          </button>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSubmit}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                     transition-all duration-150 active:scale-95 self-end"
          style={{
            background: canSubmit ? '#6366f1' : 'rgba(120,95,68,0.08)',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? '0 2px 12px rgba(99,102,241,0.22)' : 'none',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
               style={{ color: canSubmit ? '#ffffff' : '#c8b4a0' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
