'use client'

import { useState } from 'react'
import { Users, Lock, MessageCircle, ChevronRight, ArrowLeft, Heart, Sparkles, Flame, Leaf, Star, Moon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Tier = 'free' | 'membership' | 'premium'

interface Props {
  tier: Tier
}

const GROUPS = [
  {
    id: 'bindungstypen',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-rose-50 text-rose-500',
    name: 'Bindungstypen',
    description: 'Austausch rund um ängstliche, vermeidende und sichere Bindungsmuster. Wie prägen sie unsere Beziehungen?',
    members: 142,
    posts: 38,
    latestPost: '„Wie erkenne ich anxious attachment bei mir selbst?"',
    tags: ['Ängstlich', 'Vermeidend', 'Sicher', 'Heilung'],
  },
  {
    id: 'bewusste-sexualitaet',
    icon: <Flame className="w-5 h-5" />,
    color: 'bg-orange-50 text-orange-500',
    name: 'Bewusste Sexualität',
    description: 'Ein sicherer Raum für Gespräche über gelebte Sexualität, sexuelle Heilung und Verkörperung.',
    members: 89,
    posts: 24,
    latestPost: '„Was bedeutet verkörperte Sexualität für dich?"',
    tags: ['Sexualität', 'Heilung', 'Embodiment', 'Sicherheit'],
  },
  {
    id: 'tantric-dating',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-violet-50 text-violet-500',
    name: 'Tantric Dating',
    description: 'Wie bringst du Tantra-Prinzipien in deinen Alltag und dein Dating? Erfahrungen & Impulse.',
    members: 203,
    posts: 61,
    latestPost: '„Mein erstes bewusstes Date — was ich gelernt habe"',
    tags: ['Tantra', 'Präsenz', 'Dating', 'Rituale'],
  },
  {
    id: 'beziehungsmodelle',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-blue-50 text-blue-500',
    name: 'Beziehungsmodelle',
    description: 'Monogamie, Polyamorie, Solo-Poly, offene Beziehungen — Erfahrungen, Fragen, ehrliche Reflexion.',
    members: 117,
    posts: 45,
    latestPost: '„Was Monogamie für mich bedeutet — nach einem Jahr Poly"',
    tags: ['Monogamie', 'Polyamorie', 'Offenheit', 'Modelle'],
  },
  {
    id: 'selbstliebe-heilung',
    icon: <Leaf className="w-5 h-5" />,
    color: 'bg-green-50 text-green-500',
    name: 'Selbstliebe & Heilung',
    description: 'Wachstum beginnt bei dir. Trauma, Heilung, inneres Kind — und was das mit Beziehungen zu tun hat.',
    members: 178,
    posts: 52,
    latestPost: '„Wie innere Kindarbeit mein Dating verändert hat"',
    tags: ['Trauma', 'Inneres Kind', 'Wachstum', 'Selbstfürsorge'],
  },
  {
    id: 'spiritualitaet-partnerschaft',
    icon: <Moon className="w-5 h-5" />,
    color: 'bg-indigo-50 text-indigo-500',
    name: 'Spiritualität & Partnerschaft',
    description: 'Bewusstsein, Energie und spirituelle Praktiken in Beziehungen. Wie unterstützt Spiritualität echte Verbindung?',
    members: 95,
    posts: 29,
    latestPost: '„Gemeinsame Rituale in der Beziehung"',
    tags: ['Spiritualität', 'Energie', 'Rituale', 'Bewusstsein'],
  },
]

const DEMO_POSTS: Record<string, Array<{ author: string; time: string; text: string; replies: number; likes: number }>> = {
  bindungstypen: [
    { author: 'Sophia M.', time: 'vor 2 Std.', text: '„Wie erkenne ich anxious attachment bei mir selbst?" — Ich merke es daran, dass ich nach jedem Date sofort mein Handy checke und jede Verzögerung beim Antworten interpretiere.', replies: 12, likes: 34 },
    { author: 'Thomas R.', time: 'vor 5 Std.', text: 'Mein vermeidender Bindungstyp hat mich jahrelang davon abgehalten, wirklich nah zu sein. Was hat euch geholfen, das zu überwinden?', replies: 8, likes: 21 },
    { author: 'Lena K.', time: 'gestern', text: 'Interessant — ich dachte immer, ich bin sicher gebunden. Aber in stressigen Situationen zeigt sich bei mir doch ein ängstliches Muster.', replies: 5, likes: 18 },
  ],
  'tantric-dating': [
    { author: 'Elena F.', time: 'vor 1 Std.', text: 'Mein erstes bewusstes Date war so anders. Kein Smalltalk — wir haben direkt über Werte gesprochen. Anfangs ungewohnt, dann unglaublich befreiend.', replies: 15, likes: 47 },
    { author: 'Marco B.', time: 'vor 3 Std.', text: 'Ich nutze eine kurze Atemübung vor jedem Date. Das hilft mir, wirklich anzukommen statt im Kopf zu sein.', replies: 9, likes: 31 },
  ],
  'bewusste-sexualitaet': [
    { author: 'Julia W.', time: 'vor 4 Std.', text: 'Was bedeutet verkörperte Sexualität für euch? Für mich ist es der Unterschied zwischen Performen und wirklich Spüren.', replies: 18, likes: 52 },
    { author: 'Lena K.', time: 'gestern', text: 'Sexuelle Heilung war für mich ein langer Prozess. Hat jemand Empfehlungen für Körperarbeit-Praktizierende?', replies: 7, likes: 29 },
  ],
}

export function CommunityClient({ tier }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const isPremium = tier === 'premium'

  const group = GROUPS.find((g) => g.id === selectedGroup)
  const posts = selectedGroup ? (DEMO_POSTS[selectedGroup] ?? DEMO_POSTS['bindungstypen'].slice(0, 2)) : []

  if (!isPremium) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
        <h1 className="font-heading text-3xl text-dark mb-1">Community</h1>
        <p className="text-text/50 text-sm mb-10">Gruppen zu Bindungstypen, Sexualität, Beziehungsmodellen und mehr.</p>

        {/* Teaser groups (blurred) */}
        <div className="relative">
          <div className="space-y-3 blur-sm pointer-events-none select-none">
            {GROUPS.slice(0, 3).map((g) => (
              <div key={g.id} className="card flex gap-4 items-start">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', g.color)}>
                  {g.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg text-dark">{g.name}</h3>
                  <p className="text-text/60 text-sm truncate">{g.description}</p>
                  <p className="text-text/30 text-xs mt-1">{g.members} Mitglieder · {g.posts} Beiträge</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-white rounded-3xl shadow-xl px-8 py-8 text-center max-w-xs mx-4">
              <div className="w-14 h-14 bg-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-light" />
              </div>
              <h2 className="font-heading text-2xl text-dark mb-2">Nur für Premium</h2>
              <p className="text-text/60 text-sm leading-relaxed mb-6">
                Die Community ist exklusiv für Premium-Mitglieder — ein geschützter Raum für tiefe Gespräche.
              </p>
              <Link href="/profile" className="btn-primary text-sm py-3 px-6 block text-center">
                Auf Premium upgraden
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Group detail view
  if (selectedGroup && group) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
        <button
          onClick={() => setSelectedGroup(null)}
          className="flex items-center gap-2 text-text/50 hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Alle Gruppen
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', group.color)}>
            {group.icon}
          </div>
          <div>
            <h1 className="font-heading text-2xl text-dark">{group.name}</h1>
            <p className="text-text/50 text-sm">{group.members} Mitglieder · {group.posts} Beiträge</p>
          </div>
        </div>

        <p className="text-text/60 text-sm leading-relaxed mb-4">{group.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {group.tags.map((tag) => (
            <span key={tag} className="text-xs bg-sand text-text/60 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>

        <div className="space-y-4 mb-8">
          {posts.map((post, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-light flex items-center justify-center">
                    <span className="font-heading text-sm text-primary">{post.author[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark">{post.author}</p>
                    <p className="text-xs text-text/40">{post.time}</p>
                  </div>
                </div>
              </div>
              <p className="text-text/70 text-sm leading-relaxed mb-3">{post.text}</p>
              <div className="flex gap-4 text-xs text-text/40">
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.replies} Antworten</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-2 border-dashed border-sand text-center py-6">
          <Star className="w-6 h-6 text-text/20 mx-auto mb-2" />
          <p className="text-text/40 text-sm">Eigene Beiträge kommen in Phase 2.</p>
        </div>
      </div>
    )
  }

  // Groups overview
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8">
      <h1 className="font-heading text-3xl text-dark mb-1">Community</h1>
      <p className="text-text/50 text-sm mb-8">Dein geschützter Raum für tiefe Gespräche.</p>

      <div className="space-y-3">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className="card w-full text-left flex gap-4 items-start hover:shadow-md transition-all"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', g.color)}>
              {g.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-lg text-dark">{g.name}</h3>
              <p className="text-text/60 text-sm leading-snug mb-1.5">{g.description}</p>
              <div className="flex items-center gap-3 text-xs text-text/30">
                <span>{g.members} Mitglieder</span>
                <span>·</span>
                <span className="italic truncate">{g.latestPost}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text/30 flex-shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  )
}
