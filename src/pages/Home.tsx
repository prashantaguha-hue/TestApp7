import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUp, ChevronLeft, ChevronRight, Paperclip, Sparkles } from 'lucide-react'
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

export function Home({ persona }: HomeProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const data = personas[persona]
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
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
        setMessages((m) => [...m, { role: 'assistant', content: pendingAnswer, stats: pendingStats, cta: pendingCta }])
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
        setMessages([{ role: 'user', content: promptText }])
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
    setMessages((m) => (chatActive ? [...m, { role: 'user', content: text }] : [{ role: 'user', content: text }]))
    setChatActive(true)
    setPendingAnswer(FALLBACK_ANSWER)
    setPendingStats(undefined)
    setPendingCta(undefined)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
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
      <ChatNavControls onNewChat={handleNewChat} />
      <div className={`mx-auto flex h-full max-w-3xl flex-col px-6 ${chatActive ? 'py-8' : 'py-16'}`}>
        {!chatActive && (
          <div className="mb-8 text-center">
            <h1 className="text-[33px] font-bold leading-[1.15] tracking-tight text-slate-900">
              How can{' '}
              <span className="bg-gradient-to-br from-blue-600 to-violet-600 bg-clip-text italic text-transparent">
                Hypersync
              </span>{' '}
              help you today?
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              Ask Hypersync to help you connect, configure, and manage your data.
            </p>
          </div>
        )}

        {chatActive && (
          <ChatThread
            messages={messages}
            pendingAnswer={pendingAnswer}
            typedAnswer={typedAnswer}
            showAnswer={showAnswer}
            onNewChat={handleNewChat}
            onCta={handleCtaClick}
          />
        )}

        <div
          className={`w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-100 ${chatActive ? 'mt-4 shrink-0' : ''}`}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Hypersync anything, or describe what you want to do..."
            rows={2}
            className="w-full resize-none border-none bg-transparent px-1 py-1 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="flex items-center justify-between px-1 pt-1">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Attach a file"
            >
              <Paperclip className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || isTyping || pendingAnswer !== null}
              className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm transition-[filter] hover:brightness-110 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              title="Send"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

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
                  className="flex max-w-[280px] items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:pointer-events-none disabled:opacity-60"
                >
                  <Sparkles className="size-3.5 shrink-0 text-violet-400" />
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
                      className="group flex w-[180px] shrink-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-violet-200 hover:bg-violet-50/60 disabled:pointer-events-none disabled:opacity-60"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                        <Icon className="size-[18px]" />
                      </div>
                      <span className="text-sm font-medium leading-snug text-slate-700">
                        {card.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
