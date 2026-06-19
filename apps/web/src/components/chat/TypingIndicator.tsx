import { useEffect, useState } from 'react';

const MESSAGES = [
  'Thinking…',
  'Searching your memories…',
  'Connecting the dots…',
  'Almost there…',
  'Composing a response…',
];

export function TypingIndicator() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Cycle through messages every 2.5s
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 250);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 shadow-sm"
             style={{ background: '#6366f1' }}>
          <span className="text-white text-[10px] font-bold">MV</span>
        </div>

        {/* Bubble */}
        <div className="rounded-2xl px-4 py-2.5 flex items-center gap-3"
             style={{
               background: '#fefcf8',
               border: '1px solid rgba(120,95,68,0.14)',
               borderRadius: '18px 18px 18px 4px',
               minWidth: '140px',
             }}>
          {/* Animated dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: '#c8b4a0', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>

          {/* Rotating text */}
          <span
            className="text-xs transition-opacity duration-200"
            style={{
              color: '#a8927f',
              opacity: visible ? 1 : 0,
              fontStyle: 'italic',
            }}
          >
            {MESSAGES[idx]}
          </span>
        </div>
      </div>
    </div>
  );
}
