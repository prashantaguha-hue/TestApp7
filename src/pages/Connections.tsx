import { useState } from 'react'
import {
  CheckCircle2,
  Copy,
  Download,
  Filter,
  Hourglass,
  MoreHorizontal,
  Pause,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Trash2,
  X,
} from 'lucide-react'
import { CONNECTIONS, CONNECTION_STATS } from '../data/connections'
import { ConnectionSetup } from '../components/ConnectionSetup'

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Terminated: 'bg-slate-100 text-slate-500',
}

export function Connections() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [setup, setSetup] = useState(false)
  const [setupKey, setSetupKey] = useState(0)

  const filtered = CONNECTIONS.filter((c) => {
    const q = query.toLowerCase()
    return c.corporate.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
  })

  function toggleRow(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelected((s) => (s.size === filtered.length ? new Set() : new Set(filtered.map((c) => c.id))))
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function copyId(id: string) {
    try {
      navigator.clipboard?.writeText(id)
    } catch {
      // ignore
    }
    showToast('Connection ID copied')
    setOpenMenuId(null)
  }

  function handleRowAction(action: string) {
    setOpenMenuId(null)
    const labels: Record<string, string> = {
      sync: 'Force sync started',
      pause: 'Sync paused',
      resend: 'Invitation resent',
      delete: 'Invitation deleted',
      edit: 'Opening data models…',
    }
    showToast(labels[action] ?? 'Done')
  }

  if (setup) {
    return (
      <div className="h-full">
        <ConnectionSetup
          key={setupKey}
          demo={false}
          onClose={() => setSetup(false)}
          onStartReal={() => {
            setSetup(true)
            setSetupKey((k) => k + 1)
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1300px] px-8 py-8">
      <div className="mb-1 text-2xl font-bold tracking-tight text-slate-900">Connections</div>
      <p className="text-sm text-slate-500">Hypersync enables effortless, real-time standardized client data retrieval.</p>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatCard label="Total Connections" value={CONNECTION_STATS.total} icon={CheckCircle2} tone="bg-violet-50 text-violet-600" />
        <StatCard label="Active Connections" value={CONNECTION_STATS.active} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pending Connections" value={CONNECTION_STATS.pending} icon={Hourglass} tone="bg-amber-50 text-amber-600" />
        <StatCard label="Terminated Connections" value={CONNECTION_STATS.terminated} icon={Trash2} tone="bg-slate-100 text-slate-500" />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 max-w-[360px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
          <Search className="size-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search connections…"
            className="flex-1 border-none bg-transparent text-sm text-slate-800 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => showToast('Filter options')}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        >
          <Filter className="size-4" /> Filter
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => showToast('Preparing export…')}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        >
          <Download className="size-4" /> Download
        </button>
        <button
          type="button"
          onClick={() => {
            setSetup(true)
            setSetupKey((k) => k + 1)
          }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110"
        >
          <Plus className="size-4" /> Add New Connection
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={selected.size > 0 && selected.size === filtered.length} onClick={toggleAll} />
                </th>
                <Th>Connection ID</Th>
                <Th>Corporate</Th>
                <Th>Category</Th>
                <Th>Integration</Th>
                <Th>Status</Th>
                <Th>Sync Frequency</Th>
                <Th>Last Synced</Th>
                <Th>CSM</Th>
                <Th>Date of Connection</Th>
                <Th>First Sync</Th>
                <th className="w-11" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Checkbox checked={selected.has(c.id)} onClick={() => toggleRow(c.id)} />
                  </td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700">
                      {c.id.slice(0, 13)}…
                      <button
                        type="button"
                        onClick={() => copyId(c.id)}
                        className="rounded p-1 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                        title="Copy"
                      >
                        <Copy className="size-3" />
                      </button>
                    </span>
                  </Td>
                  <Td className="max-w-[180px] whitespace-normal font-medium text-slate-700">{c.corporate}</Td>
                  <Td>
                    <span className="inline-flex h-[22px] items-center rounded-md bg-slate-100 px-2 text-[11px] font-semibold text-slate-500">
                      {c.category}
                    </span>
                  </Td>
                  <Td className={c.integration === '—' ? 'text-slate-300' : ''}>{c.integration}</Td>
                  <Td>
                    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </Td>
                  <Td>
                    <span className="inline-flex h-[22px] items-center rounded-md bg-slate-800 px-2 text-[10.5px] font-bold tracking-wide text-white">
                      {c.frequency}
                    </span>
                  </Td>
                  <Td className={c.lastSynced === '—' ? 'text-slate-300' : 'whitespace-nowrap'}>{c.lastSynced}</Td>
                  <Td>{c.csm}</Td>
                  <Td className="whitespace-nowrap">{c.dateOfConnection}</Td>
                  <Td className={c.firstSync === '—' ? 'text-slate-300' : 'whitespace-nowrap'}>{c.firstSync}</Td>
                  <td className="relative px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                      className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {openMenuId === c.id && (
                      <RowMenu status={c.status} onAction={handleRowAction} onClose={() => setOpenMenuId(null)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof CheckCircle2
  tone: string
}) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2.5 font-mono text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <span className={`absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="size-4" />
      </span>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-left text-[11.5px] font-semibold text-slate-500">{children}</th>
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-slate-700 ${className}`}>{children}</td>
}
function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex size-[17px] items-center justify-center rounded border-2 ${
        checked ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white'
      }`}
    >
      {checked && <CheckCircle2 className="size-3" strokeWidth={3} />}
    </button>
  )
}

function RowMenu({
  status,
  onAction,
  onClose,
}: {
  status: string
  onAction: (action: string) => void
  onClose: () => void
}) {
  const pending = status === 'Pending'
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-2 top-9 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
        {pending ? (
          <>
            <MenuItem icon={Send} label="Resend invitation" onClick={() => onAction('resend')} />
            <MenuItem icon={X} label="Delete invitation" danger onClick={() => onAction('delete')} />
          </>
        ) : (
          <>
            <MenuItem icon={RefreshCw} label="Force sync" onClick={() => onAction('sync')} />
            <MenuItem icon={Pause} label="Pause sync" onClick={() => onAction('pause')} />
          </>
        )}
        <div className="my-1 h-px bg-slate-100" />
        <MenuItem icon={Settings2} label="Edit data models" onClick={() => onAction('edit')} />
      </div>
    </>
  )
}
function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Send
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium ${
        danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
