import React, { useState, useEffect, useRef } from 'react'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import { sendMessageApi, saveSessionApi, listMemoriesApi, getMemoryApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from '../components/ConfirmModal'

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [memories, setMemories] = useState<any[]>([])
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    // load memories on mount
    listMemoriesApi().then((res) => {
      if (!mounted.current) return
      setMemories(res?.memories ?? [])
    }).catch(() => {})
    return () => { mounted.current = false }
  }, [])

  const { token } = useAuth()

  async function handleSend(text: string) {
    if (!token) {
      alert('Please login to chat')
      return
    }

    const userMsg: Msg = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    try {
      const res = await sendMessageApi(text, messages)
      const ai = res?.response ?? 'No response'

      // Streaming simulation: append assistant message gradually
      setMessages((m) => [...m, { role: 'assistant', content: '' }])
      let idx = 0
      const interval = setInterval(() => {
        idx++
        setMessages((cur) => {
          const copy = [...cur]
          const last = copy[copy.length - 1]
          if (last && last.role === 'assistant') {
            last.content = ai.slice(0, Math.min(ai.length, last.content.length + 6))
          }
          return copy
        })
        if (idx * 6 >= ai.length) {
          clearInterval(interval)
        }
      }, 60)

    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Error contacting server' }])
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      const summaryRes = await saveSessionApi(messages)
      alert('Saved: ' + (summaryRes?.rootHash ?? 'unknown'))
      // refresh memories
      const list = await listMemoriesApi()
      setMemories(list?.memories ?? [])
    } catch (e) {
      alert('Save failed')
    }
  }

  const [browserOpen, setBrowserOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<null | { title: string; message: string; hash: string; mode: 'replace' | 'append' }>(null)

  function openBrowser() {
    setBrowserOpen(true)
  }

  function closeBrowser() {
    setBrowserOpen(false)
  }

  async function loadMemory(hash: string, mode: 'replace' | 'append' = 'replace') {
    setLoading(true)
    try {
      const res = await getMemoryApi(hash)
      const mem = res?.memory
      if (mem && mem.messages) {
        if (mode === 'append') {
          // deduplicate messages when merging: avoid exact role+content duplicates
          setMessages((prev) => {
            const sig = new Set(prev.map((m) => `${m.role}::${m.content}`))
            const filtered = mem.messages.filter((m: Msg) => !sig.has(`${m.role}::${m.content}`))
            return [...prev, ...filtered]
          })
        } else {
          setMessages(mem.messages)
        }
      }
    } catch (e) {
      alert('Failed to load memory')
    } finally { setLoading(false) }
  }

  function requestConfirm(hash: string, mode: 'replace' | 'append') {
    const title = mode === 'replace' ? 'Replace conversation' : 'Merge conversation'
    const message = mode === 'replace'
      ? 'Replace the current conversation with this memory? This cannot be undone.'
      : 'Merge this memory into the current conversation? Duplicate messages will be skipped.'
    setConfirmState({ title, message, hash, mode })
  }

  function onConfirmResult(ok: boolean) {
    if (!confirmState) return
    const { hash, mode } = confirmState
    setConfirmState(null)
    if (!ok) return
    loadMemory(hash, mode)
  }

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col min-h-[60vh] md:min-h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-medium">Conversation</h2>
        <div>
          <button onClick={openBrowser} className="mr-2 px-3 py-1 bg-gray-200 rounded">Browse</button>
          <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>

      <MessageList messages={messages} memories={memories} onLoadMemory={loadMemory} />

      <div className="mt-4 mt-auto">
        <MessageInput onSend={handleSend} disabled={loading} />
      </div>
      {browserOpen && (
        // lazy-load memory browser
        <React.Suspense fallback={null}>
          <MemoryBrowser
            onClose={closeBrowser}
            onLoad={(hash: string, mode: 'replace' | 'append' = 'replace') => {
              closeBrowser()
              requestConfirm(hash, mode)
            }}
          />
        </React.Suspense>
      )}
      <ConfirmModal
        open={!!confirmState}
        title={confirmState?.title}
        message={confirmState?.message}
        onConfirm={() => onConfirmResult(true)}
        onCancel={() => onConfirmResult(false)}
      />
    </div>
  )
}

const MemoryBrowser = React.lazy(() => import('../components/MemoryBrowser'))
