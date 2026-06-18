import React, { useEffect, useState, useRef } from 'react'
import { listMemoriesApi, getMemoryApi } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import { Search, X, ExternalLink, Download, Merge, Lock } from 'lucide-react'

interface Props {
  onClose: () => void
  onLoad: (hash: string, mode: 'replace' | 'append') => void
}

export default function MemoryBrowser({ onClose, onLoad }: Props) {
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any | null>(null)
  const [previewHash, setPreviewHash] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [query, setQuery] = useState('')
  const memRef = useRef<any[]>([])

  useEffect(() => {
    setLoading(true)
    listMemoriesApi()
      .then(res => {
        const rows = res?.memories ?? []
        memRef.current = rows
        setMemories(rows)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function viewMemory(hash: string) {
    setPreviewLoading(true)
    setPreviewHash(hash)
    try {
      const res = await getMemoryApi(hash)
      setPreview(res?.memory ?? null)
    } catch {
      setPreview(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const filteredList = query
    ? new Fuse(memRef.current, {
        keys: ['title', 'session_id'],
        threshold: 0.4,
      }).search(query).map((r: any) => r.item)
    : memRef.current

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-card memory-modal"
        style={{ maxWidth: 700 }}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 className="modal-title" style={{ marginBottom: 2 }}>🗂 Memory Browser</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {memories.length} memories stored on 0G Storage
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 10px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ marginBottom: 16 }}>
          <Search size={13} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search memories..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* Memory list */}
          <div style={{ overflowY: 'auto' }}>
            {loading && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>Loading memories…</div>
            )}
            {!loading && filteredList.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                {query ? 'No results found.' : 'No memories saved yet.'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredList.map((m: any) => {
                const isEncryptedTitle = m.title && m.title.includes(':') && m.title.length > 60
                const displayTitle = isEncryptedTitle ? '🔐 Encrypted memory' : (m.title || 'Untitled')
                const isActive = previewHash === m.root_hash

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`memory-item${isActive ? ' active' : ''}`}
                    onClick={() => viewMemory(m.root_hash)}
                  >
                    <div className="memory-item-title">{displayTitle}</div>
                    <div className="memory-item-meta">
                      <span>{new Date(m.created_at).toLocaleDateString()}</span>
                      <span className="memory-item-hash">{m.root_hash.slice(0, 12)}…</span>
                      {isEncryptedTitle && (
                        <span className="memory-encrypted-badge"><Lock size={8} /> E2EE</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                        onClick={e => { e.stopPropagation(); onLoad(m.root_hash, 'replace') }}
                      >
                        <Download size={11} /> Load
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                        onClick={e => { e.stopPropagation(); onLoad(m.root_hash, 'append') }}
                      >
                        <Merge size={11} /> Merge
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Preview pane */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 16,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {!previewHash && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, margin: 'auto' }}>
                Select a memory to preview
              </div>
            )}
            {previewLoading && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, margin: 'auto' }}>
                Fetching from 0G Storage…
              </div>
            )}
            {!previewLoading && preview && (
              <>
                {preview.isEncrypted ? (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔐</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Encrypted Memory
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      This memory is AES-256-GCM encrypted. Connect your wallet to decrypt and view it.
                    </div>
                  </div>
                ) : (
                  <>
                    {preview.summary && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Summary:</strong> {preview.summary}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(preview.messages || []).map((msg: any, i: number) => (
                        <div key={i} className={`memory-preview-msg ${msg.role}`}>
                          <div className="memory-preview-role">{msg.role}</div>
                          <div style={{ fontSize: 13 }}>{msg.content}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {previewHash && (
                  <div className="hash-proof" style={{ marginTop: 'auto', paddingTop: 12 }}>
                    <ExternalLink size={10} />
                    <span title={previewHash}>{previewHash.slice(0, 20)}…</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
