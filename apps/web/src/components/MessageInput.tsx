import React, { useState } from 'react'

export default function MessageInput({ onSend, disabled }: any) {
  const [text, setText] = useState('')

  function submit() {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        className="flex-1 border rounded px-3 py-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        placeholder="Send a message..."
        disabled={disabled}
      />
      <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={disabled}>Send</button>
    </div>
  )
}
