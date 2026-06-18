export function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
         style={{ background: '#f5f0e8' }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse shadow-md"
           style={{ background: '#6366f1' }}>
        <span className="text-white text-lg font-bold">MV</span>
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              background: '#6366f1',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
