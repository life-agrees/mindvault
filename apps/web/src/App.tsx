import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Chat from './pages/Chat'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">MindVault</h1>
          <nav className="flex items-center gap-4">
            <Link to="/chat" className="text-sm text-blue-600">Chat</Link>
            <div>
              {/* Login component */}
              <React.Suspense fallback={null}>
                {/* lazy import to avoid top-level auth dependencies */}
                <LoginLazy />
              </React.Suspense>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="/" element={<Chat />} />
        </Routes>
      </main>
    </div>
  )
}

const LoginLazy = React.lazy(() => import('./components/Login'))
