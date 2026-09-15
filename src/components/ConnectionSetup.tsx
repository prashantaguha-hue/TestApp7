import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Eye,
  EyeOff,
  FileUp,
  Info,
  Loader2,
  Plus,
  Search,
  Send,
  Server,
  Share2,
  X,
} from 'lucide-react'
import {
  CONNECTION_CATEGORIES,
  CORPORATES,
  CORPORATE_METHODS,
  DATA_MODEL_CATEGORIES,
  PLATFORMS,
  REQUIRED_FIELDS,
  SETUP_METHODS,
  TRANSFER_METHODS,
  answerSetupQuestion,
  type DataModelCategory,
} from '../data/connectionSetup'
import { useTypewriter } from '../hooks/useTypewriter'
import { ChatNavControls } from './ChatNavControls'

interface ConnectionSetupProps {
  demo: boolean
  onClose: () => void
  onStartReal: () => void
}

type StepId =
  | 'setup-method'
  | 'corporate-method'
  | 'connection-details'
  | 'transfer-method'
  | 'hrms-platform'
  | 'hrms-credentials'
  | 'data-models'
  | 'field-mapping'

const STEP_ORDER: StepId[] = [
  'setup-method',
  'corporate-method',
  'connection-details',
  'transfer-method',
  'hrms-platform',
  'hrms-credentials',
  'data-models',
  'field-mapping',
]

const PHASES = ['Connection Details', 'Data Transfer Method', 'HRMS Credential', 'Data Configuration'] as const

const PHASE_OF: Record<StepId, number> = {
  'setup-method': 0,
  'corporate-method': 0,
  'connection-details': 0,
  'transfer-method': 1,
  'hrms-platform': 2,
  'hrms-credentials': 2,
  'data-models': 3,
  'field-mapping': 3,
}

const TRANSFER_ICONS = {
  hrms: Share2,
  sftp: Server,
  csv: FileUp,
  api: Code2,
} as const

const INPUT_CLS =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
const PRIMARY_BTN =
  'rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'

export function ConnectionSetup({ demo, onClose, onStartReal }: ConnectionSetupProps) {
  const [step, setStep] = useState<StepId>('setup-method')
  const [revealedStep, setRevealedStep] = useState<StepId>('setup-method')
  const [done, setDone] = useState(false)

  const [setupMethod, setSetupMethod] = useState<string | null>(null)
  const [corporateMethod, setCorporateMethod] = useState<string | null>(null)

  const [corporateId, setCorporateId] = useState<string | null>(demo ? 'acme' : null)
  const [newCorporateName, setNewCorporateName] = useState('')
  const [referenceId, setReferenceId] = useState(demo ? 'REF-20481' : '')
  const [fullName, setFullName] = useState(demo ? 'Keya Paul' : '')
  const [email, setEmail] = useState(demo ? 'keyapaul@tartanhq.com' : '')
  const [category, setCategory] = useState(demo ? CONNECTION_CATEGORIES[0] : '')
  const [initialSyncDate, setInitialSyncDate] = useState('')

  const [transferMethod, setTransferMethod] = useState<string | null>(null)

  const [platformId, setPlatformId] = useState<string | null>(null)
  const [platformQuery, setPlatformQuery] = useState('')

  const [companyDomain, setCompanyDomain] = useState(demo ? 'acme.bamboohr.com' : '')
  const [apiSecretKey, setApiSecretKey] = useState(demo ? 'sk_live_9x82hd0021kd' : '')
  const [showSecret, setShowSecret] = useState(false)
  const [permissionConfirmed, setPermissionConfirmed] = useState(demo)
  const [connecting, setConnecting] = useState(false)
  const [showCredentialHelp, setShowCredentialHelp] = useState(false)

  const [dataModelMode, setDataModelMode] = useState<'recommended' | 'manual' | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['employee-details']))
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<Set<string>>(
    new Set(DATA_MODEL_CATEGORIES.flatMap((c) => c.fields).map((f) => f.key)),
  )

  const [mappingValues, setMappingValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      DATA_MODEL_CATEGORIES.flatMap((c) => c.fields)
        .filter((f) => f.needsMapping)
        .map((f) => [f.key, f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')]),
    ),
  )
  const [mappingEditing, setMappingEditing] = useState(false)
  const [activating, setActivating] = useState(false)

  const [chatInput, setChatInput] = useState('')
  const [extraMessages, setExtraMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const typedAnswer = useTypewriter(pendingAnswer ?? '', showAnswer, 10)
  const chatThinking = pendingAnswer !== null && !showAnswer
  const bottomRef = useRef<HTMLDivElement>(null)

  // Reveal each new step after a short "thinking" beat instead of popping in instantly.
  useEffect(() => {
    const t = window.setTimeout(() => setRevealedStep(step), 450)
    return () => window.clearTimeout(t)
  }, [step])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [step, revealedStep, extraMessages, typedAnswer])

  useEffect(() => {
    if (pendingAnswer === null) return
    setShowAnswer(false)
    const t = window.setTimeout(() => setShowAnswer(true), 450)
    return () => window.clearTimeout(t)
  }, [pendingAnswer])

  useEffect(() => {
    if (pendingAnswer !== null && showAnswer && typedAnswer === pendingAnswer) {
      const t = window.setTimeout(() => {
        setExtraMessages((m) => [...m, { role: 'assistant', content: pendingAnswer }])
        setPendingAnswer(null)
        setShowAnswer(false)
      }, 150)
      return () => window.clearTimeout(t)
    }
  }, [typedAnswer, pendingAnswer, showAnswer])

  function handleSetupMethodChoice(id: string) {
    const opt = SETUP_METHODS.find((m) => m.id === id)
    if (!opt?.enabled) return
    setSetupMethod(id)
    setStep('corporate-method')
  }

  function handleCorporateMethodChoice(id: string) {
    setCorporateMethod(id)
    setStep('connection-details')
  }

  function canSaveDetails() {
    const corpOk = corporateMethod === 'new' ? newCorporateName.trim().length > 0 : !!corporateId
    return !!(corpOk && referenceId.trim() && fullName.trim() && email.trim() && category)
  }

  function handleSaveDetails() {
    if (!canSaveDetails()) return
    setStep('transfer-method')
  }

  function handleTransferMethodChoice(id: string) {
    const m = TRANSFER_METHODS.find((t) => t.id === id)
    if (!m?.enabled) return
    setTransferMethod(id)
    setStep('hrms-platform')
  }

  function handlePlatformChoice(id: string) {
    setPlatformId(id)
    setStep('hrms-credentials')
  }

  function canConnect() {
    return !!(companyDomain.trim() && apiSecretKey.trim() && permissionConfirmed)
  }

  function handleConnect() {
    if (!canConnect() || connecting) return
    setConnecting(true)
    window.setTimeout(() => {
      setConnecting(false)
      setStep('data-models')
    }, 900)
  }

  function toggleExpanded(id: string) {
    setExpandedCategories((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleFieldKey(key: string) {
    setSelectedFieldKeys((s) => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function chooseRecommended() {
    setDataModelMode('recommended')
    setStep('field-mapping')
  }

  function chooseManual() {
    setDataModelMode('manual')
    setSelectedFieldKeys(new Set(REQUIRED_FIELDS.map((f) => f.key)))
    setExpandedCategories(new Set(DATA_MODEL_CATEGORIES.map((c) => c.id)))
  }

  function confirmManualSelection() {
    setStep('field-mapping')
  }

  function mappingRows() {
    return DATA_MODEL_CATEGORIES.flatMap((c) => c.fields).filter((f) => f.needsMapping && selectedFieldKeys.has(f.key))
  }

  function handleMappingContinue() {
    setActivating(true)
    window.setTimeout(() => {
      setActivating(false)
      setDone(true)
    }, 900)
  }

  function handleChatSend() {
    const q = chatInput.trim()
    if (!q) return
    setExtraMessages((m) => [...m, { role: 'user', content: q }])
    setPendingAnswer(answerSetupQuestion(q))
    setChatInput('')
  }

  function ackText(s: StepId): string | null {
    switch (s) {
      case 'corporate-method':
        return `Perfect. This connection will be set up with ${corporateMethod === 'new' ? 'a new' : 'an existing'} corporate. Let's add a few details before we continue.`
      case 'connection-details':
        return "Thanks! The connection details are saved. Next, we'll set up the transfer method for this connection."
      case 'transfer-method': {
        const m = TRANSFER_METHODS.find((t) => t.id === transferMethod)
        return `You've selected ${m?.title ?? 'that method'}. Let's configure it and move on to the next step.`
      }
      case 'hrms-platform': {
        const p = PLATFORMS.find((pl) => pl.id === platformId)
        return `Great! ${p?.name ?? 'Your HRMS'} is selected. Let's configure it to continue.`
      }
      case 'hrms-credentials': {
        const p = PLATFORMS.find((pl) => pl.id === platformId)
        return `You're all set! ${p?.name ?? 'Your HRMS'} is now connected to HyperSync. Let's continue with the setup.`
      }
      case 'data-models':
        return dataModelMode === 'manual'
          ? "Great! We'll continue with your selected data models for this connection."
          : "Great! We'll continue with the mandatory and recommended data models for your connection."
      default:
        return null
    }
  }

  function answerLabel(s: StepId): string {
    switch (s) {
      case 'setup-method':
        return SETUP_METHODS.find((m) => m.id === setupMethod)?.title ?? ''
      case 'corporate-method':
        return CORPORATE_METHODS.find((m) => m.id === corporateMethod)?.title ?? ''
      case 'connection-details':
        return 'Details Saved'
      case 'transfer-method':
        return TRANSFER_METHODS.find((m) => m.id === transferMethod)?.title ?? ''
      case 'hrms-platform':
        return PLATFORMS.find((p) => p.id === platformId)?.name ?? ''
      case 'hrms-credentials':
        return PLATFORMS.find((p) => p.id === platformId)?.name ?? ''
      case 'data-models':
        return dataModelMode === 'manual' ? 'Continue with selection' : 'Continue with recommendation'
      case 'field-mapping':
        return 'Continue with mappings'
    }
  }

  function renderStep(s: StepId, interactive: boolean) {
    switch (s) {
      case 'setup-method':
        return renderSetupMethod(interactive)
      case 'corporate-method':
        return renderCorporateMethod(interactive)
      case 'connection-details':
        return renderConnectionDetails(interactive)
      case 'transfer-method':
        return renderTransferMethod(interactive)
      case 'hrms-platform':
        return renderHrmsPlatform(interactive)
      case 'hrms-credentials':
        return renderHrmsCredentials(interactive)
      case 'data-models':
        return renderDataModels(interactive)
      case 'field-mapping':
        return renderFieldMapping(interactive)
    }
  }

  function renderSetupMethod(interactive: boolean) {
    return (
      <ThreadCard
        title="How would you like to set up this connection?"
        desc="We can either invite the corporate to complete the setup, or you can set it up yourself. Choose an option to continue."
      >
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {SETUP_METHODS.map((m) => (
            <ChoiceButton
              key={m.id}
              label={m.title}
              selected={setupMethod === m.id}
              disabled={!m.enabled}
              interactive={interactive}
              onClick={() => handleSetupMethodChoice(m.id)}
            />
          ))}
        </div>
      </ThreadCard>
    )
  }

  function renderCorporateMethod(interactive: boolean) {
    return (
      <ThreadCard
        title="How would you like to add the corporate?"
        desc="You can use a corporate that's already set up, or add a new one to continue."
      >
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {CORPORATE_METHODS.map((m) => (
            <ChoiceButton
              key={m.id}
              label={m.title}
              selected={corporateMethod === m.id}
              disabled={!m.enabled}
              interactive={interactive}
              onClick={() => handleCorporateMethodChoice(m.id)}
            />
          ))}
        </div>
      </ThreadCard>
    )
  }

  function renderConnectionDetails(interactive: boolean) {
    const disabled = !interactive
    return (
      <ThreadCard
        title="Add connection details"
        desc="Please provide the details below to create this connection. You can review everything before we finish."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Corporate Name" required>
            {corporateMethod === 'new' ? (
              <input
                value={newCorporateName}
                onChange={(e) => setNewCorporateName(e.target.value)}
                disabled={disabled}
                placeholder="Enter Corporate Name"
                className={INPUT_CLS}
              />
            ) : (
              <select
                value={corporateId ?? ''}
                onChange={(e) => setCorporateId(e.target.value)}
                disabled={disabled}
                className={INPUT_CLS}
              >
                <option value="" disabled>
                  Select Corporate
                </option>
                {CORPORATES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Reference ID" required info="A unique identifier used to track this connection in your system.">
            <input
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              disabled={disabled}
              placeholder="Enter Reference ID"
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Full Name" required>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={disabled}
              placeholder="Enter Full Name"
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled}
              placeholder="Enter Email"
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Category" required>
            <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={disabled} className={INPUT_CLS}>
              <option value="" disabled>
                Select Category
              </option>
              {CONNECTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Initial Sync Date">
            <input
              type="date"
              value={initialSyncDate}
              onChange={(e) => setInitialSyncDate(e.target.value)}
              disabled={disabled}
              className={INPUT_CLS}
            />
          </Field>
        </div>
        {interactive && (
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={handleSaveDetails} disabled={!canSaveDetails()} className={PRIMARY_BTN}>
              Save
            </button>
          </div>
        )}
      </ThreadCard>
    )
  }

  function renderTransferMethod(interactive: boolean) {
    return (
      <ThreadCard title="How would you like to transfer your data?" desc="Choose the method you'd like to use for this connection.">
        <div className="flex flex-col gap-2.5">
          {TRANSFER_METHODS.map((m) => {
            const Icon = TRANSFER_ICONS[m.iconKey]
            const selected = transferMethod === m.id
            return (
              <button
                key={m.id}
                type="button"
                disabled={!interactive || !m.enabled}
                onClick={() => handleTransferMethodChoice(m.id)}
                className={
                  'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ' +
                  (selected
                    ? 'border-blue-500 bg-blue-50/60'
                    : !m.enabled
                      ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
                      : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40')
                }
              >
                <span
                  className={
                    'flex size-10 flex-none items-center justify-center rounded-lg ' +
                    (selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500')
                  }
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    {m.title}
                    {!m.enabled && <span className="ml-2 text-xs font-normal text-slate-400">Coming soon</span>}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-slate-500">{m.desc}</span>
                </span>
              </button>
            )
          })}
        </div>
      </ThreadCard>
    )
  }

  function renderHrmsPlatform(interactive: boolean) {
    const filtered = PLATFORMS.filter((p) => p.name.toLowerCase().includes(platformQuery.toLowerCase()))
    return (
      <ThreadCard title="Which HRMS would you like to connect?" desc="Now, choose the HRMS you want to connect with HyperSync.">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <Search className="size-4 text-slate-400" />
            <input
              value={platformQuery}
              onChange={(e) => setPlatformQuery(e.target.value)}
              disabled={!interactive}
              placeholder="Search Categories"
              className="flex-1 border-none bg-transparent text-sm text-slate-800 focus:outline-none"
            />
          </div>
          <button type="button" className="whitespace-nowrap text-sm font-semibold text-blue-600 hover:underline">
            Can&apos;t find your HRMS?
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={!interactive}
              onClick={() => handlePlatformChoice(p.id)}
              className={
                'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ' +
                (platformId === p.id
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40')
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
      </ThreadCard>
    )
  }

  function renderHrmsCredentials(interactive: boolean) {
    const platform = PLATFORMS.find((p) => p.id === platformId)
    const disabled = !interactive
    return (
      <ThreadCard
        title="Connect your HRMS"
        desc={`Enter the credentials below to securely connect ${platform?.name ?? 'your HRMS'} with HyperSync.`}
      >
        <button
          type="button"
          onClick={() => setShowCredentialHelp((v) => !v)}
          className="mb-4 flex w-full items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3.5 py-2.5 text-left text-[13px] font-medium text-sky-700"
        >
          <Info className="size-4 flex-none" />
          <span className="flex-1">Not sure where to find these?</span>
          <ChevronRight className={`size-4 flex-none transition-transform ${showCredentialHelp ? 'rotate-90' : ''}`} />
        </button>
        {showCredentialHelp && (
          <p className="mb-4 -mt-2 rounded-lg bg-slate-50 px-3.5 py-2.5 text-[13px] text-slate-600">
            Both values live in your {platform?.name ?? 'HRMS'} admin console, usually under Settings → API Access. Copy
            them exactly — they&apos;re encrypted the moment you connect.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company Domain" required>
            <input
              value={companyDomain}
              onChange={(e) => setCompanyDomain(e.target.value)}
              disabled={disabled}
              placeholder="Enter Company Domain"
              className={INPUT_CLS}
            />
          </Field>
          <Field label="API Secret Key" required>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={apiSecretKey}
                onChange={(e) => setApiSecretKey(e.target.value)}
                disabled={disabled}
                placeholder="Enter API Secret Key"
                className={INPUT_CLS + ' pr-9'}
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                disabled={disabled}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
              >
                {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
        </div>
        <label className="mt-4 flex items-start gap-2.5 text-[13px] text-slate-600">
          <input
            type="checkbox"
            checked={permissionConfirmed}
            onChange={(e) => setPermissionConfirmed(e.target.checked)}
            disabled={disabled}
            className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
          />
          I confirm that I have the necessary permissions to connect this HRMS account and share the requested employee
          data.
        </label>
        {interactive && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleConnect}
              disabled={!canConnect() || connecting}
              className={PRIMARY_BTN + ' flex items-center gap-2'}
            >
              {connecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Connecting…
                </>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        )}
      </ThreadCard>
    )
  }

  function renderDataModels(interactive: boolean) {
    const manualActive = dataModelMode === 'manual'
    return (
      <ThreadCard
        title="Choose your data models"
        desc="Based on your setup, we've the required data models and recommended a few more for a complete sync."
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2.5 text-[13px] font-semibold text-slate-700">
            Required Fields<span className="text-red-500">*</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {REQUIRED_FIELDS.map((f) => (
              <FieldCheckbox key={f.key} label={f.label} checked disabled interactive={false} />
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {DATA_MODEL_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              expanded={expandedCategories.has(cat.id)}
              interactive={interactive && manualActive}
              selectedKeys={selectedFieldKeys}
              onToggleExpand={() => toggleExpanded(cat.id)}
              onToggleField={toggleFieldKey}
            />
          ))}
        </div>

        {!manualActive && (
          <>
            <p className="mt-4 text-sm text-slate-600">
              Would you like to continue with these recommendations or select your data models manually?
            </p>
            <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
              <ChoiceButton label="Continue with recommended" selected interactive={interactive} onClick={chooseRecommended} />
              <ChoiceButton label="Select Manually" selected={false} interactive={interactive} onClick={chooseManual} />
            </div>
          </>
        )}
        {manualActive && interactive && (
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={confirmManualSelection} className={PRIMARY_BTN}>
              Continue with selection
            </button>
          </div>
        )}
      </ThreadCard>
    )
  }

  function renderFieldMapping(interactive: boolean) {
    const rows = mappingRows()
    return (
      <ThreadCard
        title="Review your field mappings"
        desc="I've mapped the fields based on the selected data models. Would you like to continue with these mappings or make some changes?"
      >
        {rows.length > 0 && (
          <div className="mb-2 grid grid-cols-[1fr_14rem] gap-4 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span>Field</span>
            <span>Mappings</span>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {rows.map((f) => (
            <MappingRow
              key={f.key}
              label={f.label}
              value={mappingValues[f.key] ?? ''}
              editing={mappingEditing}
              interactive={interactive}
              onChange={(v) => setMappingValues((m) => ({ ...m, [f.key]: v }))}
            />
          ))}
          {rows.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-500">
              No additional fields need manual mapping — everything matched automatically.
            </p>
          )}
        </div>
        {interactive && (
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleMappingContinue}
              disabled={activating}
              className={PRIMARY_BTN + ' flex items-center justify-center gap-2 sm:flex-1'}
            >
              {activating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Activating…
                </>
              ) : (
                'Continue with mappings'
              )}
            </button>
            <button
              type="button"
              onClick={() => setMappingEditing((v) => !v)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50/40"
            >
              {mappingEditing ? 'Done editing' : 'Edit mappings'}
            </button>
          </div>
        )}
      </ThreadCard>
    )
  }

  if (done) {
    const platformName = PLATFORMS.find((p) => p.id === platformId)?.name ?? ''
    return (
      <SuccessScreen
        demo={demo}
        platformName={platformName}
        fieldCount={selectedFieldKeys.size}
        onClose={onClose}
        onStartReal={onStartReal}
      />
    )
  }

  const currentIndex = STEP_ORDER.indexOf(step)
  const currentPhase = PHASE_OF[step]
  const openingLabel = demo ? 'Add a demo connection' : 'I want to add a new connection.'

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 flex-none items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>New connection</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{PHASES[currentPhase]}</span>
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
        <div className="relative min-w-0 flex-1 overflow-y-auto bg-white">
          <ChatNavControls onNewChat={onClose} />

          <div className="mx-auto flex max-w-3xl flex-col gap-1 px-6 pb-10 pt-20">
          <div className="mb-5 flex flex-col items-center gap-2 text-xs text-slate-400">
            <span>This is the beginning of your conversation</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-500">Today</span>
          </div>

          <div className="mb-1 flex justify-end">
            <UserPill label={openingLabel} />
          </div>

          {STEP_ORDER.slice(0, currentIndex + 1).map((s, idx) => {
            const isPast = idx < currentIndex
            const ready = isPast || revealedStep === step
            return (
              <div key={s} className="mb-1">
                {ready ? (
                  <>
                    {renderStep(s, !isPast)}
                    {isPast && <UserPill label={answerLabel(s)} />}
                    {isPast && ackText(s) && <AssistantNote text={ackText(s)!} />}
                  </>
                ) : (
                  <ThinkingBubble />
                )}
              </div>
            )
          })}

          {extraMessages.map((m, i) =>
            m.role === 'user' ? <UserPill key={i} label={m.content} /> : <AssistantNote key={i} text={m.content} />,
          )}
          {pendingAnswer !== null &&
            (chatThinking ? (
              <ThinkingBubble />
            ) : (
              <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm leading-relaxed text-slate-700">
                <span className="whitespace-pre-line">{typedAnswer}</span>
                {typedAnswer.length < pendingAnswer.length && (
                  <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-slate-400" />
                )}
              </div>
            ))}
          <div ref={bottomRef} />
        </div>
        </div>

        <div className="hidden w-80 flex-none overflow-y-auto border-l border-slate-200 bg-white p-6 xl:block">
          <div className="sticky top-0">
            <PhaseTracker phases={PHASES} currentPhase={currentPhase} />
          </div>
        </div>
      </div>

      <div className="flex flex-none items-center gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleChatSend()
            }
          }}
          placeholder="Type your chat message here"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={handleChatSend}
          disabled={!chatInput.trim()}
          className="flex size-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white transition-[filter] hover:brightness-110 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400"
          title="Send"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  )
}

function PhaseTracker({ phases, currentPhase }: { phases: readonly string[]; currentPhase: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {phases.map((label, i) => {
        const state = i < currentPhase ? 'done' : i === currentPhase ? 'current' : 'pending'
        return (
          <div key={label}>
            {i > 0 && (
              <div className={'ml-[13px] h-4 border-l-2 border-dashed ' + (state === 'pending' ? 'border-slate-200' : 'border-blue-300')} />
            )}
            <div className="flex items-center gap-3 py-0.5">
              <span
                className={
                  'flex size-7 flex-none items-center justify-center rounded-full ' +
                  (state === 'done' ? 'bg-blue-600 text-white' : state === 'current' ? 'bg-white ring-2 ring-blue-500' : 'bg-slate-100')
                }
              >
                {state === 'done' ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className={'size-2 rounded-full ' + (state === 'current' ? 'bg-blue-600' : 'bg-slate-300')} />
                )}
              </span>
              <span className={'text-sm font-semibold ' + (state === 'pending' ? 'text-slate-400' : 'text-slate-800')}>{label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ThreadCard({ title, desc, children }: { title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-5">
      <div className="text-[15px] font-semibold text-slate-900">{title}</div>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

function UserPill({ label }: { label: string }) {
  return (
    <div className="mt-3 flex justify-end">
      <span className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
        {label}
      </span>
    </div>
  )
}

function AssistantNote({ text }: { text: string }) {
  return (
    <div className="mt-3 max-w-2xl rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm leading-relaxed text-slate-700">{text}</div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
    </div>
  )
}

function ChoiceButton({
  label,
  selected,
  disabled,
  interactive,
  onClick,
}: {
  label: string
  selected: boolean
  disabled?: boolean
  interactive: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={!interactive || disabled}
      onClick={onClick}
      className={
        'flex-1 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors ' +
        (selected
          ? 'border-blue-500 bg-blue-50/60 text-slate-900'
          : disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
            : interactive
              ? 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/40'
              : 'border-slate-200 bg-white text-slate-500')
      }
    >
      {label}
      {disabled && <span className="ml-2 text-xs font-normal text-slate-400">(Coming soon)</span>}
    </button>
  )
}

function Field({
  label,
  required,
  info,
  children,
}: {
  label: string
  required?: boolean
  info?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {info && (
          <span title={info}>
            <Info className="size-3.5 text-slate-400" />
          </span>
        )}
      </span>
      {children}
    </label>
  )
}

function FieldCheckbox({
  label,
  checked,
  disabled,
  interactive,
  onToggle,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  interactive: boolean
  onToggle?: () => void
}) {
  return (
    <label
      className={'flex items-center gap-2.5 text-sm ' + (disabled || !interactive ? 'text-slate-500' : 'cursor-pointer text-slate-700')}
    >
      <span
        onClick={() => interactive && !disabled && onToggle?.()}
        className={
          'flex size-4 flex-none items-center justify-center rounded border-2 ' +
          (checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300')
        }
      >
        {checked && <Check className="size-3" />}
      </span>
      {label}
    </label>
  )
}

function CategoryCard({
  category,
  expanded,
  interactive,
  selectedKeys,
  onToggleExpand,
  onToggleField,
}: {
  category: DataModelCategory
  expanded: boolean
  interactive: boolean
  selectedKeys: Set<string>
  onToggleExpand: () => void
  onToggleField: (key: string) => void
}) {
  const required = category.fields.filter((f) => f.required).length
  const recommended = category.fields.length - required
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button type="button" onClick={onToggleExpand} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
          {category.label.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-800">{category.label}</span>
          <span className="block text-xs text-slate-500">
            {required} Required · {recommended} Recommended
          </span>
        </span>
        {expanded ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronRight className="size-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-slate-100 px-4 py-3 sm:grid-cols-3">
          {category.fields.map((f) => (
            <FieldCheckbox
              key={f.key}
              label={f.label}
              checked={!!f.required || selectedKeys.has(f.key)}
              disabled={!!f.required}
              interactive={interactive}
              onToggle={() => onToggleField(f.key)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MappingRow({
  label,
  value,
  editing,
  interactive,
  onChange,
}: {
  label: string
  value: string
  editing: boolean
  interactive: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3">
      <span className="min-w-0 flex-1 text-sm text-slate-700">{label}</span>
      {editing && interactive ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <span className="w-56 truncate rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">{value}</span>
      )}
    </div>
  )
}

interface SuccessScreenProps {
  demo: boolean
  platformName: string
  fieldCount: number
  onClose: () => void
  onStartReal: () => void
}
function SuccessScreen({ demo, platformName, fieldCount, onClose, onStartReal }: SuccessScreenProps) {
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
        <h2 className="text-2xl font-semibold text-slate-900">{demo ? 'Demo connection completed' : 'Connection active'}</h2>
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
            {fieldCount} fields
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
