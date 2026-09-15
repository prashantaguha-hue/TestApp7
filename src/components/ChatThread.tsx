import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Plug, Sparkles, Webhook } from 'lucide-react'
import { iconMap } from './icon-map'
import type { AnswerCta, StatTile } from '../types/persona'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  stats?: StatTile[]
  cta?: AnswerCta
  time?: string
}

interface ChatThreadProps {
  messages: ChatMessage[]
  pendingAnswer: string | null
  typedAnswer: string
  showAnswer: boolean
  onCta: (action: AnswerCta['action']) => void
}

const CTA_META: Record<AnswerCta['action'], { subtitle: string; icon: typeof Plug }> = {
  connection: { subtitle: 'Bring in real data source', icon: Plug },
  webhook: { subtitle: 'Set up event notifications', icon: Webhook },
}

function StatGrid({ stats }: { stats: StatTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:max-w-[420px]">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon] ?? Sparkles
        return (
          <div key={stat.label} className="rounded-xl border border-slate-100 p-3.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Icon className="size-4" />
            </div>
            <div className="mt-2.5 text-xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        )
      })}
    </div>
  )
}

function AnswerBlocks({ text }: { text: string }) {
  const elements: ReactNode[] = []
  let paragraphLines: string[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushParagraph = (key: string) => {
    if (paragraphLines.length) {
      elements.push(
        <p key={key} className="text-slate-700">
          {paragraphLines.join(' ')}
        </p>,
      )
      paragraphLines = []
    }
  }
  const flushList = (key: string) => {
    if (listItems.length && listType) {
      const Tag = listType
      elements.push(
        <Tag
          key={key}
          className={`space-y-1 pl-5 text-slate-700 marker:text-slate-400 ${Tag === 'ul' ? 'list-disc' : 'list-decimal'}`}
        >
          {listItems.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </Tag>,
      )
      listItems = []
      listType = null
    }
  }

  text.split('\n').forEach((rawLine, idx) => {
    const line = rawLine.trim()
    const bulletMatch = line.match(/^-\s+(.*)/)
    const numberMatch = line.match(/^\d+\.\s+(.*)/)
    if (!line) {
      flushParagraph(`p-${idx}`)
      flushList(`l-${idx}`)
      return
    }
    if (bulletMatch) {
      flushParagraph(`p-${idx}`)
      if (listType !== 'ul') flushList(`l-${idx}`)
      listType = 'ul'
      listItems.push(bulletMatch[1])
      return
    }
    if (numberMatch) {
      flushParagraph(`p-${idx}`)
      if (listType !== 'ol') flushList(`l-${idx}`)
      listType = 'ol'
      listItems.push(numberMatch[1])
      return
    }
    flushList(`l-${idx}`)
    paragraphLines.push(line)
  })
  flushParagraph('p-end')
  flushList('l-end')

  return <div className="space-y-3">{elements}</div>
}

function CtaCard({ cta, onCta }: { cta: AnswerCta; onCta: (action: AnswerCta['action']) => void }) {
  const meta = CTA_META[cta.action]
  const Icon = meta.icon
  return (
    <button
      type="button"
      onClick={() => onCta(cta.action)}
      className="mt-1 flex w-full max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/40"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-800">{cta.label}</div>
        <div className="truncate text-xs text-slate-500">{meta.subtitle}</div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-blue-500" />
    </button>
  )
}

export function ChatThread({ messages, pendingAnswer, typedAnswer, showAnswer, onCta }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typedAnswer, pendingAnswer])

  const isThinking = pendingAnswer !== null && !showAnswer
  const isStreaming = pendingAnswer !== null && showAnswer && typedAnswer.length < pendingAnswer.length

  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4">
      <div className="mb-2 flex flex-col items-center gap-3 pt-2 text-center">
        <span className="text-xs text-slate-400">This is the beginning of your conversation</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">Today</span>
      </div>

      {messages.map((message, i) => (
        <div key={i} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
          {message.role === 'user' ? (
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-sm">
              {message.content}
            </div>
          ) : (
            <div className="flex w-full max-w-2xl flex-col gap-3 text-[14px] leading-relaxed">
              <AnswerBlocks text={message.content} />
              {message.stats && <StatGrid stats={message.stats} />}
              {message.cta && <CtaCard cta={message.cta} onCta={onCta} />}
            </div>
          )}
          {message.time && <div className="mt-1 text-[11px] text-slate-400">{message.time}</div>}
        </div>
      ))}

      {pendingAnswer !== null && (
        <div className="flex w-full max-w-2xl flex-col gap-3 text-[14px] leading-relaxed">
          {isThinking ? (
            <span className="flex items-center gap-1 py-1">
              <span className="size-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-slate-300" />
            </span>
          ) : (
            <div className="flex items-start">
              <AnswerBlocks text={typedAnswer} />
              {isStreaming && (
                <span className="ml-0.5 mt-1 inline-block h-3.5 w-[2px] shrink-0 animate-pulse bg-slate-400" />
              )}
            </div>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
