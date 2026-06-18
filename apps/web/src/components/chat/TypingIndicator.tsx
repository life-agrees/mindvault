export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 shadow-sm"
             style={{ background: '#6366f1' }}>
          <span className="text-white text-[10px] font-bold">MV</span>
        </div>
        <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
             style={{
               background: '#fefcf8',
               border: '1px solid rgba(120,95,68,0.14)',
               borderRadius: '18px 18px 18px 4px',
             }}>
          {[0, 1, 2].map((i) => (
            <div key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ background: '#c8b4a0', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
