import { useState } from 'react'
import { History, Plus } from 'lucide-react'

const RECENT_CHATS = ['Tools For Ticketing', 'Corporate Addition in Sync', 'Connection Creation', 'About HyperSync']

interface ChatNavControlsProps {
  onNewChat: () => void
}

export function ChatNavControls({ onNewChat }: ChatNavControlsProps) {
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <div className="absolute left-6 top-6 z-10 flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
          title="Recent chats"
        >
          <History className="size-4" />
        </button>
        {historyOpen && (
          <div className="absolute left-0 top-11 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setHistoryOpen(false)
                onNewChat()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              <Plus className="size-4" /> New Chat
            </button>
            <div className="mt-1 border-t border-slate-100 pt-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">Recents</div>
              {RECENT_CHATS.map((t) => (
                <div key={t} className="rounded-lg px-3 py-2 text-sm text-slate-600">
                  {t}
                </div>
              ))}
            </div>
          </div>
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
