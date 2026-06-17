import React, { useEffect, useState, useRef } from 'react'
import { listMemoriesApi, getMemoryApi } from '../lib/api'
import { motion } from 'framer-motion'
import Fuse from 'fuse.js'

export default function MemoryBrowser({ onClose, onLoad }: any) {
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any | null>(null)
  const [query, setQuery] = useState('')
  const memRef = useRef<any[]>([])

  useEffect(() => {
    setLoading(true)
    listMemoriesApi().then((res) => {
      const rows = res?.memories ?? []
      memRef.current = rows
      setMemories(rows)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Fuse is imported statically; no dynamic loader needed.

  async function viewMemory(hash: string) {
    setLoading(true)
    try {
      const res = await getMemoryApi(hash)
      setPreview(res?.memory ?? null)
    } catch (e) {
      setPreview(null)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:w-3/4 max-h-[80vh] overflow-auto rounded-t-lg md:rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Memory Browser</h3>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1 text-sm">Close</button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="space-y-2">
              <div className="mb-2">
                <input className="w-full border rounded px-2 py-1" placeholder="Search memories" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              {loading && <div className="text-sm text-gray-500">Loading...</div>}
              {!loading && memories.length === 0 && <div className="text-sm text-gray-500">No memories found</div>}
              {(() => {
                const list = query
                  ? new Fuse(memRef.current, { keys: ['title', 'summary'], threshold: 0.4 }).search(query).map((r: any) => r.item)
                  : memRef.current

                return list.map((m: any) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-2 border rounded flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{m.title}</div>
                      <div className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => viewMemory(m.root_hash)} className="text-xs px-2 py-1 bg-gray-100 rounded">View</button>
                      <div className="flex gap-1">
                        <button onClick={() => onLoad?.(m.root_hash, 'replace')} className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Load</button>
                        <button onClick={() => onLoad?.(m.root_hash, 'append')} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Merge</button>
                      </div>
                    </div>
                  </motion.div>
                ))
              })()}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="p-3 border rounded h-full bg-gray-50">
              {!preview && <div className="text-sm text-gray-500">Select a memory to preview</div>}
              {preview && (
                <div>
                  <h4 className="font-semibold">Summary</h4>
                  <div className="mb-3 text-sm text-gray-700">{preview.summary}</div>
                  <h4 className="font-semibold">Messages</h4>
                  <div className="space-y-2 mt-2">
                    {preview.messages.map((msg: any, i: number) => (
                      <div key={i} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-50 text-right' : 'bg-gray-100 text-left'}`}>
                        <div className="text-xs text-gray-600">{msg.role}</div>
                        <div>{msg.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
