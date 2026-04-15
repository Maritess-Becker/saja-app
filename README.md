# Saja

Bewusstes Dating für die Holistic Tantra Community — DACH-Markt.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Custom Design System)
- **Supabase** (Auth + Datenbank + Realtime)
- **Stripe** (Zahlungen — vorbereitet)
- **Vercel** (Deployment)

## Setup

### 1. Repository klonen & Dependencies installieren

```bash
cd ht-connect
npm install
```

### 2. Umgebungsvariablen

```bash
cp .env.local.example .env.local
```

Fülle `.env.local` mit deinen Werten:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Neues Projekt auf [supabase.com](https://supabase.com) erstellen
2. In SQL Editor: Inhalt von `supabase/migrations/001_initial.sql` ausführen
3. In Storage: Bucket `profile-photos` erstellen (public)
4. Auth > URL Configuration: `http://localhost:3000` als Site URL

### 4. Dev-Server starten

```bash
npm run dev
```

App läuft auf [http://localhost:3000](http://localhost:3000)

---

## Deployment auf Vercel

1. GitHub Repo erstellen und Code pushen
2. Auf [vercel.com](https://vercel.com) importieren
3. Umgebungsvariablen in Vercel eintragen
4. `NEXT_PUBLIC_APP_URL` auf deine Vercel-URL setzen
5. In Supabase Auth > URL Configuration: Vercel-URL hinzufügen

---

## Projektstruktur

```
src/
├── app/
│   ├── page.tsx              # Landing Page
│   ├── (auth)/               # Login, Register
│   ├── onboarding/           # 6-Schritt Profil-Setup
│   ├── discover/             # Swipe-Ansicht
│   ├── matches/              # Matches-Übersicht
│   ├── connection/[matchId]/ # Begegnung + Chat
│   ├── profile/              # Eigenes Profil
│   ├── api/auth/callback/    # Supabase Auth Callback
│   ├── datenschutz/          # DSGVO (Platzhalter)
│   ├── impressum/            # Impressum (Platzhalter)
│   └── agb/                  # AGB (Platzhalter)
├── components/
│   └── layout/AppNav.tsx     # Navigation
├── lib/
│   ├── supabase/client.ts    # Browser Supabase Client
│   ├── supabase/server.ts    # Server Supabase Client
│   └── utils.ts
├── types/index.ts            # TypeScript Types
└── middleware.ts             # Auth Guards
supabase/
└── migrations/001_initial.sql
```

---

## Nächste Schritte (Phase 2)

- [ ] Inhalte-Bereich (Tests, Fragebögen)
- [ ] Stripe Integration (Membership, Premium)
- [ ] Foto-Upload zu Supabase Storage
- [ ] Kompatibilitäts-Score (Premium)
- [ ] 48h Auto-Expire für Begegnungn (Cron Job)
- [ ] Coach-Profile & Coaching-Buchung (Platzhalter)
- [ ] Cookie-Banner (DSGVO)
- [ ] E-Mail-Benachrichtigungen (Match, Nachricht)

---

## One Connection Rule

Die One Connection Rule ist das Herzstück von Saja:
- Nutzer können immer nur mit **einer Person gleichzeitig** in der Begegnung sein
- Flow: Swipen → Like → gegenseitiges Match → Begegnung anfragen → beide blockiert
- Jede/r kann die Phase eigenständig aufheben → beide sofort wieder frei
- 48h keine Antwort auf Anfrage → automatisch freigegeben (Cron Job TODO)
