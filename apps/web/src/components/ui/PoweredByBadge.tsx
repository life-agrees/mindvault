export function PoweredByBadge() {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <div className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
           style={{ background: '#6366f1' }}>
        <span className="text-white text-[8px] font-bold">0G</span>
      </div>
      <span className="text-xs font-medium" style={{ color: '#6b5a49' }}>
        Compute + Storage powered by 0G's decentralized network
      </span>
    </div>
  );
}
