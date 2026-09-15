import { useState } from 'react'
import { History, Plus } from 'lucide-react'

const RECENT_CHATS = ['Tools For Ticketing', 'Corporate Addition in Sync', 'Connection Creation', 'About HyperSync']

interface ChatNavControlsProps {
  onNewChat: () => void
}

export function ChatNavControls({ onNewChat }: ChatNavControlsProps) {
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <div className="absolute left-6 top-6 z-10 flex flex-col items-center gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className={`flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 ${historyOpen ? 'border-blue-200 bg-blue-50 text-blue-600' : ''}`}
          title="Recent chats"
        >
          <History className="size-4" />
        </button>
        {historyOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setHistoryOpen(false)} />
            <div className="absolute left-0 top-11 z-20 flex h-[min(560px,75vh)] w-72 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setHistoryOpen(false)
                  onNewChat()
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="size-4" /> New Chat
              </button>
              <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-400">
                <History className="size-4" /> Recents
              </div>
              <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
                {RECENT_CHATS.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    className={`block w-full truncate rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${i === 0 ? 'bg-slate-50 text-slate-700' : 'text-slate-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onNewChat}
        className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
        title="New chat"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
