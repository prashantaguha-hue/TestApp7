import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUp, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react'
import type { AnswerCta, PersonaId, StatTile } from '../types/persona'
import { personas } from '../data/personas'
import { iconMap } from '../components/icon-map'
import { ChatThread } from '../components/ChatThread'
import type { ChatMessage } from '../components/ChatThread'
import { useTypewriter } from '../hooks/useTypewriter'
import { ConnectionSetup } from '../components/ConnectionSetup'
import { ChatNavControls } from '../components/ChatNavControls'

interface HomeProps {
  persona: PersonaId
}

const FALLBACK_ANSWER =
  "That's a great question. This is a prototype, so I don't have a live answer wired up for freeform questions yet — try one of the suggested prompts for a full walkthrough, or create a support ticket and a teammate will help."

function bubbleLabel(text: string) {
  const match = text.match(/\(([^)]+)\)/)
  return match ? match[1] : text
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function Home({ persona }: HomeProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const data = personas[persona]
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [pageInfo, setPageInfo] = useState({ count: 1, index: 0 })
  const [isTyping, setIsTyping] = useState(false)
  const typingIntervalRef = useRef<number | null>(null)

  const [chatActive, setChatActive] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null)
  const [pendingStats, setPendingStats] = useState<StatTile[] | undefined>(undefined)
  const [pendingCta, setPendingCta] = useState<AnswerCta | undefined>(undefined)
  const [showAnswer, setShowAnswer] = useState(false)
  const typedAnswer = useTypewriter(pendingAnswer ?? '', showAnswer, 12)

  const [setup, setSetup] = useState<{ open: boolean; demo: boolean }>({ open: false, demo: false })
  const [setupKey, setSetupKey] = useState(0)

  function typeIntoQuery(text: string, onDone: () => void) {
    if (typingIntervalRef.current) window.clearInterval(typingIntervalRef.current)
    setIsTyping(true)
    setQuery('')
    let i = 0
    typingIntervalRef.current = window.setInterval(() => {
      i += 1
      setQuery(text.slice(0, i))
      if (i >= text.length) {
        window.clearInterval(typingIntervalRef.current!)
        typingIntervalRef.current = null
        setIsTyping(false)
        onDone()
      }
    }, 18)
  }

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) window.clearInterval(typingIntervalRef.current)
    }
  }, [])

  // Reveal the "thinking" dots for a beat before streaming the answer in.
  useEffect(() => {
    if (pendingAnswer === null) return
    setShowAnswer(false)
    const timer = window.setTimeout(() => setShowAnswer(true), 550)
    return () => window.clearTimeout(timer)
  }, [pendingAnswer])

  // Once the answer has fully streamed in, commit it to the message list.
  useEffect(() => {
    if (pendingAnswer !== null && showAnswer && typedAnswer === pendingAnswer) {
      const timer = window.setTimeout(() => {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: pendingAnswer, stats: pendingStats, cta: pendingCta, time: formatTime() },
        ])
        setPendingAnswer(null)
        setPendingStats(undefined)
        setPendingCta(undefined)
        setShowAnswer(false)
      }, 150)
      return () => window.clearTimeout(timer)
    }
  }, [typedAnswer, pendingAnswer, showAnswer, pendingStats, pendingCta])

  function handleSuggestionClick(promptText: string, answer: string, stats?: StatTile[], cta?: AnswerCta) {
    typeIntoQuery(promptText, () => {
      window.setTimeout(() => {
        setQuery('')
        setChatActive(true)
        setMessages([{ role: 'user', content: promptText, time: formatTime() }])
        setPendingAnswer(answer)
        setPendingStats(stats)
        setPendingCta(cta)
      }, 250)
    })
  }

  function handleCtaClick(action: AnswerCta['action']) {
    if (action === 'connection') {
      setSetup({ open: true, demo: false })
      setSetupKey((k) => k + 1)
    } else if (action === 'webhook') {
      navigate('/webhooks')
    }
  }

  function handleFlowClick(promptText: string, demo: boolean) {
    typeIntoQuery(promptText, () => {
      window.setTimeout(() => {
        setQuery('')
        setSetup({ open: true, demo })
        setSetupKey((k) => k + 1)
      }, 250)
    })
  }

  function handleNewChat() {
    setChatActive(false)
    setMessages([])
    setPendingAnswer(null)
    setPendingStats(undefined)
    setPendingCta(undefined)
    setShowAnswer(false)
    setQuery('')
  }

  function updateScrollState() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    const count = Math.max(1, Math.round(el.scrollWidth / el.clientWidth))
    const index = Math.min(count - 1, Math.round(el.scrollLeft / el.clientWidth))
    setPageInfo({ count, index })
  }

  useEffect(() => {
    updateScrollState()
  }, [persona])

  function scrollByCards(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * scrollRef.current.clientWidth * 0.8, behavior: 'smooth' })
  }

  function handleSubmit() {
    const text = query.trim()
    if (!text || pendingAnswer !== null) return
    setQuery('')
    const userMessage: ChatMessage = { role: 'user', content: text, time: formatTime() }
    setMessages((m) => (chatActive ? [...m, userMessage] : [userMessage]))
    setChatActive(true)
    setPendingAnswer(FALLBACK_ANSWER)
    setPendingStats(undefined)
    setPendingCta(undefined)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (setup.open) {
    return (
      <div className="h-full">
        <ConnectionSetup
          key={setupKey}
          demo={setup.demo}
          onClose={() => setSetup({ open: false, demo: false })}
          onStartReal={() => {
            setSetup({ open: true, demo: false })
            setSetupKey((k) => k + 1)
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {!chatActive && (
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(59,130,246,0.09), rgba(59,130,246,0) 70%), linear-gradient(to right, rgba(100,116,139,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.05) 1px, transparent 1px)',
            backgroundSize: 'auto, 48px 48px, 48px 48px',
            maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
          }}
        />
      )}
      <ChatNavControls onNewChat={handleNewChat} />
      <div className={`relative z-10 mx-auto flex h-full max-w-3xl flex-col px-6 ${chatActive ? 'py-8' : 'py-16'}`}>
        {!chatActive && (
          <div className="mb-8 text-center">
            <h1 className="text-[33px] font-bold leading-[1.15] tracking-tight text-slate-900">
              How can <span className="text-blue-600">HyperSync</span> help you today?
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              Ask Hyper Sync to help you connect, configure, and manage your data.
            </p>
          </div>
        )}

        {chatActive && (
          <ChatThread
            messages={messages}
            pendingAnswer={pendingAnswer}
            typedAnswer={typedAnswer}
            showAnswer={showAnswer}
            onCta={handleCtaClick}
          />
        )}

        {chatActive ? (
          <div className="relative mt-4 flex shrink-0 items-center rounded-full border border-slate-200 bg-white py-3 pl-5 pr-14 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your chat message here"
              className="w-full border-none bg-transparent text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || isTyping || pendingAnswer !== null}
              className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
              title="Send"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... e.g. what's connection?"
              rows={3}
              className="w-full resize-none border-none bg-transparent px-1 py-1 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="flex items-center justify-end px-1 pt-1">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!query.trim() || isTyping || pendingAnswer !== null}
                className="flex size-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                title="Send"
              >
                <ArrowUp className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {!chatActive && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {data.bubbles.map((bubble) => (
                <button
                  key={bubble.prompt}
                  type="button"
                  title={bubble.prompt}
                  disabled={isTyping}
                  onClick={() => handleSuggestionClick(bubble.prompt, bubble.answer, undefined, bubble.cta)}
                  className="flex max-w-[280px] items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-60"
                >
                  <span className="truncate">{bubbleLabel(bubble.prompt)}</span>
                </button>
              ))}
            </div>

            <div className="mt-12 w-full">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Suggested for you
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollByCards(-1)}
                    disabled={!canScrollLeft}
                    className="flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-white"
                    title="Scroll left"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByCards(1)}
                    disabled={!canScrollRight}
                    className="flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-white"
                    title="Scroll right"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
              <div
                ref={scrollRef}
                onScroll={updateScrollState}
                className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-3 [scrollbar-width:thin]"
              >
                {data.cards.map((card) => {
                  const Icon = iconMap[card.icon] ?? Sparkles
                  return (
                    <button
                      key={card.title}
                      type="button"
                      disabled={isTyping}
                      onClick={() =>
                        card.flow
                          ? handleFlowClick(card.title, card.flow === 'demo')
                          : handleSuggestionClick(card.title, card.answer, card.stats, card.cta)
                      }
                      className="group flex w-[200px] shrink-0 flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/40 disabled:pointer-events-none disabled:opacity-60"
                    >
                      <div className="relative flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Icon className="size-6" />
                        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                          <Plus className="size-3" strokeWidth={3} />
                        </span>
                      </div>
                      <span className="text-sm font-semibold leading-snug text-slate-700">
                        {card.title}
                      </span>
                    </button>
                  )
                })}
              </div>
              {pageInfo.count > 1 && (
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  {Array.from({ length: pageInfo.count }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${i === pageInfo.index ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-200'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
