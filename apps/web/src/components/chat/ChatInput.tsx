import { useState, useRef, type KeyboardEvent } from 'react';

type Props = { onSend: (text: string) => void; disabled: boolean };

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (not shift+enter)
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
    // Cmd/Ctrl+Enter also sends
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

  const canSend = !!value.trim() && !disabled;
  const charCount = value.length;
  const showCount = charCount > 200;

  return (
    <div>
      <div className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-all duration-200"
           style={{
             background: '#fefcf8',
             border: '1px solid rgba(120,95,68,0.18)',
             boxShadow: '0 1px 6px rgba(120,95,68,0.06)',
           }}>
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
          <span className="text-[10px] self-end pb-2 flex-shrink-0"
                style={{ color: charCount > 800 ? '#dc2626' : '#c8b4a0' }}>
            {charCount}
          </span>
        )}

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                     transition-all duration-150 active:scale-95"
          style={{
            background: canSend ? '#6366f1' : 'rgba(120,95,68,0.08)',
            cursor: canSend ? 'pointer' : 'not-allowed',
            boxShadow: canSend ? '0 2px 12px rgba(99,102,241,0.22)' : 'none',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
               style={{ color: canSend ? '#ffffff' : '#c8b4a0' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
