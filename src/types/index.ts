export type SubscriptionTier = 'free' | 'membership' | 'premium'

export type Gender =
  | 'Frau'
  | 'Mann'
  | 'Non-binär'
  | 'Trans Frau'
  | 'Trans Mann'
  | 'Genderfluid'
  | 'Andere'
  | 'Lieber nicht angeben'

export type Orientation =
  | 'Hetero'
  | 'Homo'
  | 'Bi'
  | 'Pan'
  | 'Asexuell'
  | 'Demisexuell'
  | 'Queer'
  | 'Lieber nicht angeben'

export type Bindungstyp =
  | 'Sicher'
  | 'Ängstlich-präoccupiert'
  | 'Vermeidend-distanziert'
  | 'Desorganisiert'

export type LoveLanguage =
  | 'Worte der Wertschätzung'
  | 'Quality Time'
  | 'Geschenke'
  | 'Hilfsbereitschaft'
  | 'Körperliche Berührung'

export type ConnectionStatus =
  | 'open'
  | 'requested'
  | 'active'
  | 'ended'

export interface Profile {
  id: string
  user_id: string
  name: string
  age: number | null
  location: string | null
  origin: string | null
  gender: Gender | null
  orientation: Orientation | null
  seeking: string[]
  languages: string[]
  has_children: string | null
  height_cm: number | null
  bio: string | null
  not_compatible_with: string | null
  occupation: string | null
  interests: string[]
  bindungstyp: Bindungstyp | null
  love_language: LoveLanguage | null
  werte: string[]
  introvert_extrovert: number
  spontan_strukturiert: number
  rational_emotional: number
  intention: string | null
  relationship_model: string | null
  intention_text: string | null
  sexual_interests: string[] | null
  hide_age: boolean
  hide_location: boolean
  profile_paused: boolean
  photos: Array<{ url: string; path: string }>
  profile_quote: string | null
  birth_date: string | null
  smoking: string | null
  alcohol: string | null
  prompts: Array<{ question: string; answer: string }>
  dealbreakers: string[]
  audio_prompt_url: string | null
  sun_sign: string | null
  ascendant: string | null
  chinese_zodiac: string | null
  is_complete: boolean
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  status: ConnectionStatus
  created_at: string
  other_profile?: Profile
  connection?: Connection
}

export interface Connection {
  id: string
  match_id: string
  requested_by: string
  status: ConnectionStatus
  started_at: string | null
  ended_at: string | null
  expires_at: string | null
}

export interface Message {
  id: string
  connection_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface Purchase {
  id: string
  user_id: string
  product_id: string
  purchased_at: string
}

export interface User {
  id: string
  email: string
  subscription_tier: SubscriptionTier
  stripe_customer_id: string | null
  created_at: string
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6
