import React from 'react'
import { motion } from 'framer-motion'

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }: any) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-white rounded-lg shadow-lg z-70 max-w-md w-full p-4"
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-blue-600 text-white rounded">Confirm</button>
        </div>
      </motion.div>
    </div>
  )
}
