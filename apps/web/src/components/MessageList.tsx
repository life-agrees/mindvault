import React, { useEffect, useRef } from 'react'

export default function MessageList({ messages, memories, onLoadMemory, loading }: any) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // auto-scroll to bottom when messages change
    const el = containerRef.current
    if (!el) return
    // small delay to allow rendering
    setTimeout(() => {
      el.scrollTop = el.scrollHeight
    }, 50)
  }, [messages])

  function avatarFor(name: string, role: string) {
    if (role === 'assistant') return 'MV'
    if (!name) return 'U'
    return name.split(' ').map((s: string) => s[0]).slice(0,2).join('').toUpperCase()
  }

  return (
    <div ref={containerRef} className="h-[60vh] md:h-80 overflow-y-auto border rounded p-3 bg-gray-50">
      {memories && memories.length > 0 && (
        <div className="mb-3 text-sm text-gray-600">
          <strong>Memories:</strong>
          <ul className="list-none ml-0">
            {memories.map((m: any) => (
              <li key={m.id} className="flex items-center justify-between py-1">
                <div className="text-sm">{m.title} <span className="text-xs text-gray-400">— {new Date(m.created_at).toLocaleString()}</span></div>
                <div>
                  <button onClick={() => onLoadMemory?.(m.root_hash)} className="text-xs px-2 py-1 bg-gray-200 rounded">Load</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m: any, i: number) => (
          <div key={i} className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">{avatarFor('MindVault', 'assistant')}</div>
            )}
            <div className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block px-3 py-2 rounded max-w-[80vw] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                {m.content}
              </div>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">You</div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">MV</div>
            <div className="inline-block px-3 py-2 rounded bg-gray-200 text-gray-700">Typing...</div>
          </div>
        )}
      </div>
    </div>
  )
}
