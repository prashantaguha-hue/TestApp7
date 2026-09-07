import { useEffect, useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { iconMap } from './icon-map'
import type { AnswerCta, StatTile } from '../types/persona'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  stats?: StatTile[]
  cta?: AnswerCta
}

interface ChatThreadProps {
  messages: ChatMessage[]
  pendingAnswer: string | null
  typedAnswer: string
  showAnswer: boolean
  onNewChat: () => void
  onCta: (action: AnswerCta['action']) => void
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

export function ChatThread({ messages, pendingAnswer, typedAnswer, showAnswer, onNewChat, onCta }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typedAnswer, pendingAnswer])

  const isThinking = pendingAnswer !== null && !showAnswer
  const isStreaming = pendingAnswer !== null && showAnswer && typedAnswer.length < pendingAnswer.length

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Hypersync Assistant</span>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          New chat
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4">
        {messages.map((message, i) => (
          <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start gap-2.5'}`}>
            {message.role === 'assistant' && (
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm">
                <Sparkles className="size-3.5" />
              </div>
            )}
            {message.role === 'user' ? (
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-violet-600 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-sm">
                {message.content}
              </div>
            ) : (
              <div className="flex max-w-[80%] flex-col gap-2">
                <div className="whitespace-pre-line rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-[14px] leading-relaxed text-slate-700">
                  {message.content}
                </div>
                {message.stats && <StatGrid stats={message.stats} />}
                {message.cta && (
                  <button
                    type="button"
                    onClick={() => onCta(message.cta!.action)}
                    className="flex w-fit items-center gap-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110"
                  >
                    {message.cta.label} <ArrowRight className="size-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {pendingAnswer !== null && (
          <div className="flex justify-start gap-2.5">
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm">
              <Sparkles className="size-3.5" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-[14px] leading-relaxed text-slate-700">
              {isThinking ? (
                <span className="flex items-center gap-1 py-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                </span>
              ) : (
                <>
                  <span className="whitespace-pre-line">{typedAnswer}</span>
                  {isStreaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-slate-400" />
                  )}
                </>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </>
  )
}
