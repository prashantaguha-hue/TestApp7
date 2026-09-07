import type { PersonaId } from '../types/persona'
import { PersonaSwitcher } from './PersonaSwitcher'
import { Bell } from 'lucide-react'

interface TopNavProps {
  persona: PersonaId
  onPersonaChange: (id: PersonaId) => void
}

export function TopNav({ persona, onPersonaChange }: TopNavProps) {
  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center justify-end px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Notifications"
        >
          <Bell className="size-[18px]" />
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <PersonaSwitcher value={persona} onChange={onPersonaChange} />
        <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
          PG
        </div>
      </div>
    </header>
  )
}
