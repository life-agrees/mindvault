import { type ChatMessage } from '../../hooks/useChat';

type Props = {
  message: ChatMessage;
  isError?: boolean;
  onRetry?: () => void;
};

export function MessageBubble({ message, isError, onRetry }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex message-enter ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col gap-1.5 max-w-[85%]">
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse self-end' : ''}`}>

          {/* AI avatar */}
          {!isUser && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center
                            flex-shrink-0 mb-0.5 shadow-sm"
                 style={{ background: '#6366f1' }}>
              <span className="text-white text-[10px] font-bold">MV</span>
            </div>
          )}

          {/* Bubble */}
          <div
            className="rounded-2xl px-4 py-2.5 leading-relaxed text-sm"
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
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>

        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs transition-colors ml-9 self-start mt-0.5 font-medium"
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
