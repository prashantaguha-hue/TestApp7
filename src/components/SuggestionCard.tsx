import type { CSSProperties, ReactElement } from 'react'
import type { CardSuggestion } from '../types/persona'

interface SuggestionCardProps {
  card: CardSuggestion
  disabled: boolean
  onClick: () => void
}

const TILE_BG: CSSProperties = {
  backgroundImage: 'radial-gradient(120% 130% at 26% 18%, #f5f8ff 0%, #e7edfb 55%, #d8e2f9 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), inset 0 -8px 16px -10px rgba(15,35,84,.18)',
}

const SURFACE = '#ffffff'
const ACCENT_DEEP = '#16305e'
const ACCENT_SOFT = '#a9c0f5'

// Shared gradient defs referenced by every illustration below (url(#gradAccent) etc).
// Rendered once so the ids resolve for all cards on the page.
export function IllustrationDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="gradAccent" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#5580f5" />
          <stop offset="100%" stopColor="#2650c9" />
        </linearGradient>
        <linearGradient id="gradDeep" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#254a8f" />
          <stop offset="100%" stopColor="#0e1e42" />
        </linearGradient>
        <linearGradient id="gradSoft" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#c3d6fc" />
          <stop offset="100%" stopColor="#8fadf3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const illustrationStyle = { filter: 'drop-shadow(0 5px 7px rgba(21,42,97,.22))' }

function DemoConnectionSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <rect x="18" y="30" width="72" height="50" rx="8" fill="url(#gradAccent)" />
      <rect x="40" y="80" width="28" height="8" rx="3" fill="url(#gradDeep)" />
      <circle cx="54" cy="55" r="14" fill={SURFACE} />
      <path d="M50 48l12 7-12 7Z" fill="url(#gradDeep)" />
      <circle cx="93" cy="30" r="13" fill="url(#gradDeep)" />
      <path d="M93 24v12M87 30h12" stroke={SURFACE} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function FirstConnectionSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <path d="M28 66 C 12 66 15 48 5 48" stroke="url(#gradDeep)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M90 66 C 106 66 103 84 113 84" stroke="url(#gradDeep)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <rect x="28" y="56" width="20" height="20" rx="6" fill="url(#gradAccent)" />
      <rect x="48" y="60" width="12" height="4" rx="2" fill="url(#gradAccent)" />
      <rect x="48" y="68" width="12" height="4" rx="2" fill="url(#gradAccent)" />
      <path d="M64 54 H80 a10 12 0 0 1 0 24 H64 Z" fill="url(#gradDeep)" />
      <rect x="69" y="60" width="3" height="4" rx="1" fill={SURFACE} />
      <rect x="69" y="68" width="3" height="4" rx="1" fill={SURFACE} />
      <circle cx="93" cy="30" r="13" fill="url(#gradDeep)" />
      <path d="M93 24v12M87 30h12" stroke={SURFACE} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function WebhookSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <rect x="14" y="30" width="92" height="60" rx="10" fill="url(#gradSoft)" />
      <rect x="14" y="30" width="92" height="16" rx="10" fill="url(#gradDeep)" />
      <rect x="24" y="58" width="46" height="14" rx="4" fill={SURFACE} />
      <rect x="78" y="58" width="20" height="14" rx="7" fill="url(#gradAccent)" />
      <circle cx="93" cy="65" r="5" fill={SURFACE} />
    </svg>
  )
}

function UsersAccessSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <rect x="34" y="20" width="40" height="60" rx="8" fill="url(#gradAccent)" />
      <rect x="48" y="14" width="12" height="10" rx="3" fill="url(#gradDeep)" />
      <circle cx="54" cy="42" r="9" fill={SURFACE} />
      <path d="M42 62c0-7 5-10 12-10s12 3 12 10" fill={SURFACE} />
      <circle cx="80" cy="70" r="12" fill="url(#gradDeep)" />
      <path d="M75 70l4 4 8-8" stroke={SURFACE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function CorporateSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <rect x="18" y="38" width="74" height="48" rx="9" fill="url(#gradSoft)" />
      <rect x="28" y="50" width="18" height="18" rx="3" fill="url(#gradDeep)" />
      <rect x="30" y="55" width="6" height="6" rx="1" fill={SURFACE} />
      <rect x="39" y="55" width="6" height="6" rx="1" fill={SURFACE} />
      <path d="M54 54h28M54 64h28M54 74h18" stroke={ACCENT_DEEP} strokeWidth="3" strokeLinecap="round" />
      <circle cx="93" cy="30" r="13" fill="url(#gradDeep)" />
      <path d="M93 24v12M87 30h12" stroke={SURFACE} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function DataModelsSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <path d="M26 26h44l14 14v54a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V30a4 4 0 0 1 4-4Z" fill="url(#gradSoft)" />
      <path d="M70 26v14h14" fill="url(#gradDeep)" />
      <path d="M32 54h40M32 64h40M32 74h24" stroke={ACCENT_DEEP} strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(90,88) rotate(-45)">
        <rect x="-6" y="-28" width="12" height="42" rx="3" fill="url(#gradDeep)" />
        <rect x="-6" y="-28" width="12" height="9" rx="3" fill={SURFACE} />
        <path d="M-6 14 L6 14 L0 26 Z" fill={SURFACE} />
        <path d="M-2.5 14 L2.5 14 L0 21 Z" fill="url(#gradDeep)" />
      </g>
    </svg>
  )
}

function TicketSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <path d="M18 36h68a6 6 0 0 1 6 6v40a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V42a6 6 0 0 1 6-6Z" fill="url(#gradAccent)" />
      <path d="M18 36 L52 62 L86 36 Z" fill="url(#gradDeep)" />
      <path
        d="M90 62 V90 a9 9 0 0 1-18 0 V58 a6 6 0 0 1 12 0 v26"
        stroke="url(#gradDeep)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="93" cy="30" r="13" fill="url(#gradAccent)" />
      <path d="M93 23.5v5M93 32.5h.01" stroke={SURFACE} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function DocumentationSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <path
        d="M60 36c-8-6-20-8-32-6v52c12-2 24 0 32 6c8-6 20-8 32-6V30c-12-2-24 0-32 6Z"
        fill="url(#gradSoft)"
      />
      <path d="M60 36v58" stroke={ACCENT_DEEP} strokeWidth="3" />
      <circle cx="60" cy="62" r="15" fill="url(#gradDeep)" />
      <path d="M55 54l14 8-14 8Z" fill={SURFACE} />
    </svg>
  )
}

function AnalyticsSummarySvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <rect x="12" y="24" width="96" height="72" rx="10" fill="url(#gradAccent)" />
      <rect x="12" y="24" width="96" height="14" rx="10" fill="url(#gradDeep)" />
      <path d="M28 82 A32 32 0 0 1 92 82" stroke={ACCENT_SOFT} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M28 82 A32 32 0 0 1 70 55" stroke={SURFACE} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M60 82 L74 60" stroke={SURFACE} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="60" cy="82" r="4" fill={SURFACE} />
    </svg>
  )
}

function AnalyticsLevelSvg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={illustrationStyle}>
      <rect x="16" y="30" width="88" height="16" rx="8" fill="none" stroke={ACCENT_SOFT} strokeWidth="3" />
      <rect x="16" y="52" width="88" height="20" rx="10" fill="url(#gradAccent)" />
      <path d="M28 62h20M52 62h18" stroke={SURFACE} strokeWidth="3" strokeLinecap="round" />
      <path d="M78 56l4 6-4 6" stroke={SURFACE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="16" y="78" width="88" height="16" rx="8" fill="none" stroke={ACCENT_SOFT} strokeWidth="3" />
    </svg>
  )
}

const ILLUSTRATIONS: Record<string, () => ReactElement> = {
  PlugZap: DemoConnectionSvg,
  Plug: FirstConnectionSvg,
  Webhook: WebhookSvg,
  Users: UsersAccessSvg,
  Building2: CorporateSvg,
  Database: DataModelsSvg,
  LifeBuoy: TicketSvg,
  BookOpen: DocumentationSvg,
  BarChart3: AnalyticsSummarySvg,
  LineChart: AnalyticsLevelSvg,
}

function CardIllustration({ card }: { card: CardSuggestion }) {
  const Illustration = ILLUSTRATIONS[card.icon] ?? DemoConnectionSvg
  return (
    <div className="size-[128px]">
      <Illustration />
    </div>
  )
}

export function SuggestionCard({ card, disabled, onClick }: SuggestionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-colors hover:border-blue-200 disabled:pointer-events-none disabled:opacity-60"
    >
      <div className="flex h-[156px] w-full items-center justify-center" style={TILE_BG}>
        <CardIllustration card={card} />
      </div>
      <div className="border-t border-slate-100 px-4 py-3.5 transition-colors group-hover:bg-blue-50/40">
        <span className="text-sm font-semibold leading-snug text-slate-700">{card.title}</span>
      </div>
    </button>
  )
}
