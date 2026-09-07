export type PersonaId =
  | 'new-admin'
  | 'new-non-admin'
  | 'old-admin'
  | 'old-non-admin'

export interface StatTile {
  icon: string
  value: string
  label: string
}

export interface AnswerCta {
  label: string
  action: 'connection' | 'webhook'
}

export interface CardSuggestion {
  title: string
  icon: string
  answer: string
  stats?: StatTile[]
  flow?: 'demo' | 'connection'
  cta?: AnswerCta
}

export interface BubbleSuggestion {
  prompt: string
  answer: string
  cta?: AnswerCta
}

export interface Persona {
  id: PersonaId
  label: string
  description: string
  bubbles: BubbleSuggestion[]
  cards: CardSuggestion[]
}
