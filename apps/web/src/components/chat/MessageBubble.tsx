import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { type ChatMessage } from '../../hooks/useChat';

type Props = {
  message: ChatMessage;
  isError?: boolean;
  onRetry?: () => void;
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function MessageBubble({ message, isError, onRetry }: Props) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className={`flex message-enter ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse self-end' : ''}`}>

          {/* AI avatar */}
          {!isUser && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center
                            flex-shrink-0 mb-0.5 shadow-sm"
              style={{ background: '#6366f1' }}>
              <span className="text-white text-[10px] font-bold">MV</span>
            </div>
          )}

          {/* Bubble + Copy button wrapper */}
          <div className="relative group">
            {/* Bubble */}
            <div
              className="rounded-2xl px-5 py-3 leading-relaxed text-sm"
              style={isUser
                ? {
                  background: '#6366f1',
                  color: '#ffffff',
                  borderRadius: '18px 18px 4px 18px',
                  boxShadow: '0 2px 12px rgba(99,102,241,0.22)',
                }
                : isError
                  ? {
                    background: 'rgba(220, 38, 38, 0.06)',
                    color: '#b91c1c',
                    borderRadius: '18px 18px 18px 4px',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    boxShadow: '0 1px 4px rgba(220, 38, 38, 0.03)',
                  }
                  : {
                    background: '#fefcf8',
                    color: '#3d3028',
                    borderRadius: '18px 18px 18px 4px',
                    border: '1px solid rgba(120,95,68,0.14)',
                    boxShadow: '0 1px 4px rgba(120,95,68,0.06)',
                  }
              }
            >
              {isUser || isError ? (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                <div className="prose-mindvault">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Copy button — appears on hover for AI messages */}
            {!isUser && !isError && (
              <button
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy message'}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-sm"
                style={{
                  background: copied ? '#16a34a' : '#fefcf8',
                  border: `1px solid ${copied ? 'rgba(22,163,74,0.3)' : 'rgba(120,95,68,0.18)'}`,
                }}
              >
                {copied ? (
                  <svg className="w-3 h-3" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="#a8927f" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Timestamp row */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'justify-end' : 'justify-start ml-9'}`}>
          <span className="text-[10px]" style={{ color: '#c8b4a0' }}>
            {message.timestamp ? formatTime(message.timestamp) : ''}
          </span>
          {!isUser && !isError && (
            <>
              {message.fallback ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-medium" style={{ color: '#d97706' }}>
                    Backup network (0G offline/busy)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(99,102,241,0.5)' }} />
                  <span className="text-[10px]" style={{ color: '#a8927f' }}>
                    via 0G Compute
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Retry button */}
        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs transition-colors ml-9 self-start font-medium"
            style={{ color: '#6366f1' }}
            onMouseEnter={e => e.currentTarget.style.color = '#4f52d4'}
            onMouseLeave={e => e.currentTarget.style.color = '#6366f1'}
          >
            ↻ Try again
          </button>
        )}
      </div>
    </div>
  );
}
