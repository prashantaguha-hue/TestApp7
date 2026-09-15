import { useEffect, useRef, useState } from 'react'
import type { PersonaId } from '../types/persona'
import { personaOrder, personas } from '../data/personas'
import { ChevronDown, Check } from 'lucide-react'

interface PersonaSwitcherProps {
  value: PersonaId
  onChange: (id: PersonaId) => void
}

export function PersonaSwitcher({ value, onChange }: PersonaSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = personas[value]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
      >
        <span className="size-1.5 rounded-full bg-emerald-500" />
        <span className="max-w-[200px] truncate">{current.label}</span>
        <ChevronDown className={`size-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Preview as persona
          </div>
          {personaOrder.map((id) => {
            const persona = personas[id]
            const active = id === value
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onChange(id)
                  setOpen(false)
                }}
                className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{persona.label}</div>
                  <div className="text-xs text-slate-400 truncate">{persona.description}</div>
                </div>
                {active && <Check className="size-4 shrink-0 mt-0.5" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
