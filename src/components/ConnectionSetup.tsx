import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Database,
  ListChecks,
  Loader2,
  Lock,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import {
  ATTENTION_FIELDS,
  CORPORATES,
  FIELD_CATEGORIES,
  FILTER_CONDITIONS,
  FILTER_FIELD_OPTIONS,
  FREQUENCIES,
  MODES,
  PLATFORMS,
  STEP_ASSISTANT,
  answerSetupQuestion,
  type FilterRule,
} from '../data/connectionSetup'
import { useSidebar } from '../context/SidebarContext'
import { useTypewriter } from '../hooks/useTypewriter'

interface ConnectionSetupProps {
  demo: boolean
  onClose: () => void
  onStartReal: () => void
}

type StepId = 'corporate' | 'mode' | 'platform' | 'host' | 'fields' | 'configure' | 'frequency' | 'review'

const STEP_ORDER: StepId[] = ['corporate', 'mode', 'platform', 'host', 'fields', 'configure', 'frequency', 'review']
const STEP_LABEL: Record<StepId, string> = {
  corporate: 'Corporate',
  mode: 'Data source',
  platform: 'HRMS platform',
  host: 'Credentials',
  fields: 'Data fields',
  configure: 'Mapping & filters',
  frequency: 'Sync schedule',
  review: 'Review',
}
const STEP_ICON: Record<StepId, typeof Building2> = {
  corporate: Building2,
  mode: Plug,
  platform: Database,
  host: Lock,
  fields: ListChecks,
  configure: Settings2,
  frequency: RefreshCw,
  review: CheckCircle2,
}

const ALL_OPTIONAL_FIELD_KEYS = FIELD_CATEGORIES.flatMap((c) => c.fields.filter((f) => !f.required).map((f) => f.key))
const REQUIRED_FIELD_COUNT = FIELD_CATEGORIES.flatMap((c) => c.fields).filter((f) => f.required).length

function employeeCountFor(corporateId: string | null) {
  const corp = CORPORATES.find((c) => c.id === corporateId)
  const match = corp?.sub.match(/([\d,]+) employees/)
  return match ? match[1] : '4,820'
}

export function ConnectionSetup({ demo, onClose, onStartReal }: ConnectionSetupProps) {
  const [step, setStep] = useState<StepId>('corporate')
  const [done, setDone] = useState(false)

  const [corporateId, setCorporateId] = useState<string | null>(demo ? 'acme' : null)
  const [addingCorporate, setAddingCorporate] = useState(false)
  const [newCorporateName, setNewCorporateName] = useState('')

  const [mode, setMode] = useState('hrms')

  const [platformId, setPlatformId] = useState<string | null>(demo ? 'darwinbox' : null)
  const [platformQuery, setPlatformQuery] = useState('')

  const [host, setHost] = useState(() =>
    demo
      ? { hostName: 'https://acme.darwinbox.com', username: 'svc.hypersync@acme.com', password: 'H9x!qP2r$Lm8vT' }
      : { hostName: '', username: '', password: '' },
  )
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(demo)

  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(ALL_OPTIONAL_FIELD_KEYS))

  const [attentionMap, setAttentionMap] = useState<Record<string, string>>(
    demo ? Object.fromEntries(ATTENTION_FIELDS.map((f) => [f.key, f.suggested])) : {},
  )

  const [filters, setFilters] = useState<FilterRule[]>(
    demo ? [{ field: 'Status', condition: 'Include', value: 'Active' }] : [],
  )

  const [frequency, setFrequency] = useState<string | null>(demo ? 'daily' : null)
  const [activating, setActivating] = useState(false)

  const { setCollapsed } = useSidebar()
  useEffect(() => {
    setCollapsed(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const corporateName = corporateId === 'new' ? newCorporateName : CORPORATES.find((c) => c.id === corporateId)?.name
  const platform = PLATFORMS.find((p) => p.id === platformId)
  const stepIndex = STEP_ORDER.indexOf(step)

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [chatQueue, setChatQueue] = useState<{ text: string; thinking: boolean }[]>([])
  const [chatPending, setChatPending] = useState<string | null>(null)
  const [chatPendingThinking, setChatPendingThinking] = useState(false)
  const [chatShowAnswer, setChatShowAnswer] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const chatTyped = useTypewriter(chatPending ?? '', chatShowAnswer, 10)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const chatSeenStepsRef = useRef<Set<StepId>>(new Set())

  // Introduce the assistant's guidance for each step the first time it's reached.
  // A ref (not state) guards this so React StrictMode's double-invoked mount
  // effect can't queue the same intro twice.
  useEffect(() => {
    if (chatSeenStepsRef.current.has(step)) return
    chatSeenStepsRef.current.add(step)
    setChatQueue((q) => [...q, { text: STEP_ASSISTANT[step].intro, thinking: false }])
  }, [step])

  // Pull the next queued assistant message once the previous one has settled.
  // This effect only touches the queue/pending state, never `chatShowAnswer` —
  // keeping the thinking-delay timer below in its own effect so this one
  // re-running (its own setChatPending triggers it) can't cancel that timer.
  useEffect(() => {
    if (chatPending !== null || chatQueue.length === 0) return
    const [next, ...rest] = chatQueue
    setChatQueue(rest)
    setChatPending(next.text)
    setChatPendingThinking(next.thinking)
  }, [chatQueue, chatPending])

  // Reveal the "thinking" dots for a beat before streaming the answer in.
  useEffect(() => {
    if (chatPending === null) return
    if (!chatPendingThinking) {
      setChatShowAnswer(true)
      return
    }
    setChatShowAnswer(false)
    const timer = window.setTimeout(() => setChatShowAnswer(true), 450)
    return () => window.clearTimeout(timer)
  }, [chatPending, chatPendingThinking])

  // Once the assistant message has fully streamed in, commit it to the thread.
  useEffect(() => {
    if (chatPending !== null && chatShowAnswer && chatTyped === chatPending) {
      const timer = window.setTimeout(() => {
        setChatMessages((m) => [...m, { role: 'assistant', content: chatPending }])
        setChatPending(null)
        setChatPendingThinking(false)
        setChatShowAnswer(false)
      }, 120)
      return () => window.clearTimeout(timer)
    }
  }, [chatTyped, chatPending, chatShowAnswer])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chatMessages, chatTyped, chatPending])

  function askAssistant(question: string) {
    const q = question.trim()
    if (!q) return
    setChatMessages((m) => [...m, { role: 'user', content: q }])
    setChatQueue((qu) => [...qu, { text: answerSetupQuestion(q), thinking: true }])
  }
  function handleChatSend() {
    askAssistant(chatInput)
    setChatInput('')
  }
  function handleChatKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleChatSend()
    }
  }

  function updateHost(key: keyof typeof host, value: string) {
    setHost((h) => ({ ...h, [key]: value }))
    setVerified(false)
  }

  function handleVerify() {
    setVerifying(true)
    window.setTimeout(() => {
      setVerifying(false)
      setVerified(true)
    }, 1100)
  }

  function toggleField(key: string) {
    setSelectedFields((s) => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function addFilterRule() {
    setFilters((f) => [...f, { field: 'Department', condition: 'Include', value: '' }])
  }
  function updateFilterRule(i: number, patch: Partial<FilterRule>) {
    setFilters((f) => f.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function removeFilterRule(i: number) {
    setFilters((f) => f.filter((_, idx) => idx !== i))
  }

  function canContinue(): boolean {
    switch (step) {
      case 'corporate':
        return corporateId === 'new' ? newCorporateName.trim().length > 0 : !!corporateId
      case 'mode':
        return !!mode
      case 'platform':
        return !!platformId
      case 'host':
        return verified
      case 'fields':
        return true
      case 'configure':
        return ATTENTION_FIELDS.every((f) => !!attentionMap[f.key])
      case 'frequency':
        return !!frequency
      case 'review':
        return true
    }
  }

  function handleActivate() {
    setActivating(true)
    window.setTimeout(() => {
      setActivating(false)
      setDone(true)
    }, 1200)
  }

  function handleContinue() {
    if (step === 'review') {
      handleActivate()
      return
    }
    const next = STEP_ORDER[stepIndex + 1]
    if (next) setStep(next)
  }
  function handleBack() {
    const prev = STEP_ORDER[stepIndex - 1]
    if (prev) setStep(prev)
  }

  if (done) {
    return (
      <SuccessScreen
        demo={demo}
        platformName={platform?.name ?? ''}
        fieldsSelected={REQUIRED_FIELD_COUNT + selectedFields.size}
        frequencyTitle={FREQUENCIES.find((f) => f.id === frequency)?.title ?? ''}
        onClose={onClose}
        onStartReal={onStartReal}
      />
    )
  }

  const suggestedQuestions = STEP_ASSISTANT[step].questions
  const chatThinking = chatPending !== null && !chatShowAnswer
  const chatStreaming = chatPending !== null && chatShowAnswer && chatTyped.length < chatPending.length

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 flex-none items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>New connection</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{STEP_LABEL[step]}</span>
        </div>
        {demo && (
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Demo mode
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex w-16 flex-none flex-col items-center gap-1 border-r border-slate-200 bg-slate-50 py-5">
          {STEP_ORDER.map((s, i) => {
            const Icon = STEP_ICON[s]
            const state = i < stepIndex ? 'done' : i === stepIndex ? 'now' : 'pending'
            return (
              <div key={s} className="flex flex-col items-center" title={STEP_LABEL[s]}>
                {i > 0 && <div className={`h-3 w-px ${state === 'pending' ? 'bg-slate-200' : 'bg-emerald-300'}`} />}
                <div
                  className={
                    'flex size-9 items-center justify-center rounded-full ' +
                    (state === 'done'
                      ? 'bg-emerald-500 text-white'
                      : state === 'now'
                        ? 'bg-violet-600 text-white ring-4 ring-violet-100'
                        : 'bg-slate-200 text-slate-400')
                  }
                >
                  {state === 'done' ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
              </div>
            )
          })}
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-2xl">
            {step === 'corporate' && (
              <CorporateStep
                corporateId={corporateId}
                setCorporateId={setCorporateId}
                addingCorporate={addingCorporate}
                setAddingCorporate={setAddingCorporate}
                newCorporateName={newCorporateName}
                setNewCorporateName={setNewCorporateName}
              />
            )}
            {step === 'mode' && <ModeStep mode={mode} setMode={setMode} />}
            {step === 'platform' && (
              <PlatformStep
                platformId={platformId}
                setPlatformId={setPlatformId}
                query={platformQuery}
                setQuery={setPlatformQuery}
              />
            )}
            {step === 'host' && platform && (
              <HostStep
                platformName={platform.name}
                host={host}
                updateHost={updateHost}
                verifying={verifying}
                verified={verified}
                onVerify={handleVerify}
              />
            )}
            {step === 'fields' && <FieldsStep selectedFields={selectedFields} toggleField={toggleField} />}
            {step === 'configure' && (
              <ConfigureStep
                attentionMap={attentionMap}
                setAttentionMap={setAttentionMap}
                filters={filters}
                addFilterRule={addFilterRule}
                updateFilterRule={updateFilterRule}
                removeFilterRule={removeFilterRule}
                employeeCount={employeeCountFor(corporateId)}
              />
            )}
            {step === 'frequency' && <FrequencyStep frequency={frequency} setFrequency={setFrequency} />}
            {step === 'review' && platform && (
              <ReviewStep
                corporateName={corporateName ?? ''}
                platformName={platform.name}
                hostName={host.hostName}
                fieldsSelected={REQUIRED_FIELD_COUNT + selectedFields.size}
                mappingResolved={ATTENTION_FIELDS.filter((f) => !!attentionMap[f.key]).length}
                filtersCount={filters.length}
                employeeCount={employeeCountFor(corporateId)}
                frequencyTitle={FREQUENCIES.find((f) => f.id === frequency)?.title ?? ''}
              />
            )}

            <div className="mt-8 flex items-center gap-3">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <ArrowLeft className="size-4" /> Back
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue() || activating}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                {activating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Activating…
                  </>
                ) : step === 'review' ? (
                  <>
                    <Check className="size-4" /> Activate connection
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex w-80 flex-none flex-col border-l border-slate-200 bg-slate-50">
          <div className="flex flex-none items-center gap-2 border-b border-slate-200 bg-white px-4 py-3.5">
            <span className="flex size-7 flex-none items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white">
              <Sparkles className="size-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800">Sync Assistant</div>
              <div className="text-[11px] text-slate-400">Context-aware help for this step</div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {chatMessages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start gap-2'}>
                {m.role === 'assistant' && (
                  <span className="mt-0.5 flex size-6 flex-none items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                    <Sparkles className="size-3" />
                  </span>
                )}
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-violet-600 px-3 py-2 text-[12.5px] leading-relaxed text-white'
                      : 'max-w-[85%] whitespace-pre-line rounded-xl rounded-tl-sm border border-slate-200 bg-white px-3 py-2 text-[12.5px] leading-relaxed text-slate-700'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {chatPending !== null && (
              <div className="flex justify-start gap-2">
                <span className="mt-0.5 flex size-6 flex-none items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                  <Sparkles className="size-3" />
                </span>
                <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-slate-200 bg-white px-3 py-2 text-[12.5px] leading-relaxed text-slate-700">
                  {chatThinking ? (
                    <span className="flex items-center gap-1 py-0.5">
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                    </span>
                  ) : (
                    <>
                      <span className="whitespace-pre-line">{chatTyped}</span>
                      {chatStreaming && (
                        <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 animate-pulse bg-slate-400" />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <div className="flex flex-none flex-wrap gap-1.5 border-t border-slate-100 bg-white px-4 pt-3">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => askAssistant(q)}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-slate-600 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex flex-none items-center gap-2 bg-white p-4">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Ask a question…"
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] text-slate-800 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            <button
              type="button"
              onClick={handleChatSend}
              disabled={!chatInput.trim()}
              className="flex size-8 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white transition-[filter] hover:brightness-110 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400"
              title="Send"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-5 text-xl font-semibold text-slate-900">{children}</h2>
}

function OptionCard({
  selected,
  disabled,
  onClick,
  icon: Icon,
  title,
  desc,
  badge,
}: {
  selected: boolean
  disabled?: boolean
  onClick?: () => void
  icon: typeof Building2
  title: string
  desc: string
  badge?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ' +
        (disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
          : selected
            ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100'
            : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/50')
      }
    >
      <span
        className={
          'flex size-10 flex-none items-center justify-center rounded-lg ' +
          (selected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500')
        }
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {title}
          {badge && (
            <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
              {badge}
            </span>
          )}
          {disabled && (
            <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Coming soon
            </span>
          )}
        </span>
        <span className="mt-1 block text-[13px] leading-snug text-slate-500">{desc}</span>
      </span>
      <span
        className={
          'mt-1 flex size-4 flex-none items-center justify-center rounded-full border-2 ' +
          (selected ? 'border-violet-600 bg-violet-600' : 'border-slate-300')
        }
      >
        {selected && <span className="size-1.5 rounded-full bg-white" />}
      </span>
    </button>
  )
}

interface CorporateStepProps {
  corporateId: string | null
  setCorporateId: (v: string | null) => void
  addingCorporate: boolean
  setAddingCorporate: (v: boolean) => void
  newCorporateName: string
  setNewCorporateName: (v: string) => void
}
function CorporateStep({
  corporateId,
  setCorporateId,
  addingCorporate,
  setAddingCorporate,
  newCorporateName,
  setNewCorporateName,
}: CorporateStepProps) {
  return (
    <div>
      <SectionTitle>Which organisation is this connection for?</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {CORPORATES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCorporateId(c.id)
              setAddingCorporate(false)
            }}
            className={
              'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ' +
              (corporateId === c.id
                ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100'
                : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/50')
            }
          >
            <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
              {c.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-800">{c.name}</span>
              <span className="block text-xs text-slate-500">{c.sub}</span>
            </span>
          </button>
        ))}

        {corporateId === 'new' && (
          <div className="flex items-center gap-3 rounded-xl border border-violet-400 bg-violet-50 p-3.5 ring-2 ring-violet-100">
            <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
              {(newCorporateName || 'NC').slice(0, 2).toUpperCase()}
            </span>
            <span className="block text-sm font-semibold text-slate-800">{newCorporateName || 'New corporate'}</span>
          </div>
        )}

        {addingCorporate ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
            <input
              autoFocus
              value={newCorporateName}
              onChange={(e) => setNewCorporateName(e.target.value)}
              placeholder="Corporate name"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            <button
              type="button"
              onClick={() => {
                if (newCorporateName.trim()) {
                  setCorporateId('new')
                  setAddingCorporate(false)
                }
              }}
              className="rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCorporate(true)}
            className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3.5 text-sm font-semibold text-slate-500 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
          >
            <Plus className="size-4" /> Add a new corporate
          </button>
        )}
      </div>
    </div>
  )
}

function ModeStep({ mode, setMode }: { mode: string; setMode: (v: string) => void }) {
  return (
    <div>
      <SectionTitle>How should employee data reach Hypersync?</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {MODES.map((m) => (
          <OptionCard
            key={m.id}
            selected={mode === m.id}
            disabled={!m.enabled}
            onClick={() => m.enabled && setMode(m.id)}
            icon={Plug}
            title={m.title}
            desc={m.desc}
            badge={m.recommended ? 'Recommended' : undefined}
          />
        ))}
      </div>
    </div>
  )
}

interface PlatformStepProps {
  platformId: string | null
  setPlatformId: (v: string) => void
  query: string
  setQuery: (v: string) => void
}
function PlatformStep({ platformId, setPlatformId, query, setQuery }: PlatformStepProps) {
  const filtered = PLATFORMS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <div>
      <SectionTitle>Which HRMS platform are you connecting?</SectionTitle>
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <Search className="size-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search HRMS platforms…"
          className="flex-1 border-none bg-transparent text-sm text-slate-800 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlatformId(p.id)}
            className={
              'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ' +
              (platformId === p.id
                ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100'
                : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/50')
            }
          >
            <span
              className="flex size-9 flex-none items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: p.color }}
            >
              {p.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">{p.name}</span>
              <span className="block text-xs text-slate-500">{p.cat}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

interface HostStepProps {
  platformName: string
  host: { hostName: string; username: string; password: string }
  updateHost: (key: 'hostName' | 'username' | 'password', value: string) => void
  verifying: boolean
  verified: boolean
  onVerify: () => void
}
function HostStep({ platformName, host, updateHost, verifying, verified, onVerify }: HostStepProps) {
  const onChange = (key: 'hostName' | 'username' | 'password') => (e: ChangeEvent<HTMLInputElement>) =>
    updateHost(key, e.target.value)
  const canVerify = host.hostName.trim() && host.username.trim() && host.password.trim()
  return (
    <div>
      <SectionTitle>Connect to {platformName}</SectionTitle>
      <div className="mb-5 flex gap-3 rounded-xl border border-sky-100 bg-sky-50 p-3.5 text-[13px] text-slate-600">
        <Lock className="mt-0.5 size-4 flex-none text-sky-600" />
        <p>
          Credentials are encrypted at rest and used only to read the fields you approve — Hypersync never writes back to
          your HRMS.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">HRMS Host Name</span>
          <input
            value={host.hostName}
            onChange={onChange('hostName')}
            placeholder="https://yourcompany.hrms.com"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-[13px] text-slate-800 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Username</span>
          <input
            value={host.username}
            onChange={onChange('username')}
            placeholder="integration@company.com"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-[13px] text-slate-800 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Password</span>
          <input
            type="password"
            value={host.password}
            onChange={onChange('password')}
            placeholder="Enter password"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-[13px] text-slate-800 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </label>
      </div>

      {verified ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Check className="size-4" />
          </span>
          <div>
            <div className="text-sm font-semibold text-emerald-800">Connection verified</div>
            <div className="text-xs text-emerald-700">Your {platformName} connection is working.</div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onVerify}
          disabled={!canVerify || verifying}
          className="mt-5 flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {verifying ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Verifying connection…
            </>
          ) : (
            <>
              <Lock className="size-4" /> Verify connection
            </>
          )}
        </button>
      )}
    </div>
  )
}

function FieldsStep({
  selectedFields,
  toggleField,
}: {
  selectedFields: Set<string>
  toggleField: (key: string) => void
}) {
  const total = FIELD_CATEGORIES.flatMap((c) => c.fields).length
  const count = REQUIRED_FIELD_COUNT + selectedFields.size
  return (
    <div>
      <SectionTitle>Which employee fields should sync?</SectionTitle>
      <div className="flex flex-col gap-4">
        {FIELD_CATEGORIES.map((cat) => (
          <div key={cat.name} className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {cat.name}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 p-3">
              {cat.fields.map((f) => {
                const on = f.required || selectedFields.has(f.key)
                return (
                  <label
                    key={f.key}
                    className={
                      'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm ' +
                      (f.required ? 'cursor-default text-slate-500' : 'cursor-pointer text-slate-700 hover:bg-slate-50')
                    }
                  >
                    <span
                      onClick={() => !f.required && toggleField(f.key)}
                      className={
                        'flex size-4 flex-none items-center justify-center rounded border-2 ' +
                        (on ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300')
                      }
                    >
                      {on && <Check className="size-3" />}
                    </span>
                    {f.label}
                    {f.required && <span className="text-xs text-slate-400">Required</span>}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-slate-500">
        <b className="font-mono text-slate-800">{count}</b> of {total} fields selected
      </p>
    </div>
  )
}

interface ConfigureStepProps {
  attentionMap: Record<string, string>
  setAttentionMap: (fn: (m: Record<string, string>) => Record<string, string>) => void
  filters: FilterRule[]
  addFilterRule: () => void
  updateFilterRule: (i: number, patch: Partial<FilterRule>) => void
  removeFilterRule: (i: number) => void
  employeeCount: string
}
function ConfigureStep({
  attentionMap,
  setAttentionMap,
  filters,
  addFilterRule,
  updateFilterRule,
  removeFilterRule,
  employeeCount,
}: ConfigureStepProps) {
  return (
    <div>
      <SectionTitle>Review mapping & filters</SectionTitle>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">Data mapping</div>
          <button
            type="button"
            onClick={() => setAttentionMap((m) => ({ ...m, ...Object.fromEntries(ATTENTION_FIELDS.map((f) => [f.key, f.suggested])) }))}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <Sparkles className="size-3.5" /> Accept suggested mappings
          </button>
        </div>
        <p className="mt-1 text-[13px] text-slate-500">38 fields mapped automatically. 2 need your review below.</p>
        <div className="mt-3 flex flex-col gap-2">
          {ATTENTION_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{f.label}</span>
              <ArrowRight className="size-3.5 flex-none text-slate-400" />
              <select
                value={attentionMap[f.key] ?? ''}
                onChange={(e) => setAttentionMap((m) => ({ ...m, [f.key]: e.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
              >
                <option value="">— Select field —</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o === f.suggested ? `${o} (suggested)` : o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-800">Filters</div>
        <p className="mt-1 text-[13px] text-slate-500">Choose which employee records should sync.</p>
        <div className="mt-3 flex flex-col gap-2">
          {filters.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-500">
              No filters yet — all {employeeCount} employees will sync.
            </div>
          )}
          {filters.map((r, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <select
                value={r.condition}
                onChange={(e) => updateFilterRule(i, { condition: e.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-violet-300 focus:outline-none"
              >
                {FILTER_CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={r.field}
                onChange={(e) => updateFilterRule(i, { field: e.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-violet-300 focus:outline-none"
              >
                {FILTER_FIELD_OPTIONS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <input
                value={r.value}
                onChange={(e) => updateFilterRule(i, { value: e.target.value })}
                placeholder="value"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 focus:border-violet-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeFilterRule(i)}
                className="flex size-7 flex-none items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                title="Remove"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFilterRule}
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          <Plus className="size-3.5" /> Add filter rule
        </button>
      </div>
    </div>
  )
}

function FrequencyStep({ frequency, setFrequency }: { frequency: string | null; setFrequency: (v: string) => void }) {
  return (
    <div>
      <SectionTitle>How often should Hypersync update employee data?</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {FREQUENCIES.map((f) => (
          <OptionCard
            key={f.id}
            selected={frequency === f.id}
            onClick={() => setFrequency(f.id)}
            icon={RefreshCw}
            title={f.title}
            desc={f.desc}
            badge={f.recommended ? 'Recommended' : undefined}
          />
        ))}
      </div>
    </div>
  )
}

interface ReviewStepProps {
  corporateName: string
  platformName: string
  hostName: string
  fieldsSelected: number
  mappingResolved: number
  filtersCount: number
  employeeCount: string
  frequencyTitle: string
}
function ReviewStep({
  corporateName,
  platformName,
  hostName,
  fieldsSelected,
  mappingResolved,
  filtersCount,
  employeeCount,
  frequencyTitle,
}: ReviewStepProps) {
  const kv = (label: string, value: string) => (
    <div className="py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  )
  return (
    <div>
      <SectionTitle>Review before you activate</SectionTitle>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-2 gap-x-6 divide-y divide-slate-100 px-5 [&>*:nth-child(odd)]:pr-6 [&>*:nth-child(even)]:pl-0">
          {kv('Corporate', corporateName || '—')}
          {kv('HRMS Platform', platformName)}
          {kv('HRMS Host', hostName || '—')}
          {kv('Fields selected', String(fieldsSelected))}
          {kv('Mapping', `${mappingResolved}/${ATTENTION_FIELDS.length} reviewed`)}
          {kv('Filters', filtersCount ? `${filtersCount} rule${filtersCount > 1 ? 's' : ''} · ~${employeeCount} employees` : `All ${employeeCount} employees`)}
          {kv('Sync frequency', frequencyTitle)}
          {kv('Status', 'Ready to activate')}
        </div>
      </div>
      <div className="mt-4 flex gap-3 rounded-xl border border-sky-100 bg-sky-50 p-3.5 text-[13px] text-slate-600">
        <Sparkles className="mt-0.5 size-4 flex-none text-sky-600" />
        <p>
          Activating opens a live, encrypted connection to {platformName}, applies your mapping and filters, and
          schedules the first sync. Nothing is ever written back to your HRMS.
        </p>
      </div>
    </div>
  )
}

interface SuccessScreenProps {
  demo: boolean
  platformName: string
  fieldsSelected: number
  frequencyTitle: string
  onClose: () => void
  onStartReal: () => void
}
function SuccessScreen({ demo, platformName, fieldsSelected, frequencyTitle, onClose, onStartReal }: SuccessScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <span
          className={
            'mb-5 flex size-16 items-center justify-center rounded-2xl text-white shadow-lg ' +
            (demo ? 'bg-gradient-to-br from-blue-600 to-violet-600' : 'bg-gradient-to-br from-emerald-500 to-teal-500')
          }
        >
          <Check className="size-8" />
        </span>
        <h2 className="text-2xl font-semibold text-slate-900">
          {demo ? 'Demo connection completed' : 'Connection active'}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          {demo
            ? "You've explored the full Hypersync setup with sample data. Nothing was connected or synced — ready to do it for real?"
            : `Your ${platformName} connection is live. The first sync is scheduled and we'll flag anything that needs attention.`}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {platformName}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {fieldsSelected} fields
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {frequencyTitle}
          </span>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {demo ? 'Exit demo' : 'Back to Home'}
          </button>
          {demo && (
            <button
              type="button"
              onClick={onStartReal}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110"
            >
              <Plus className="size-4" /> Create a real connection
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
