// ─── Tägliche Affirmationen ───────────────────────────────────────────────────

export interface Affirmation {
  content: string
  category: 'selbstliebe' | 'praesenz' | 'verbindung' | 'mut'
}

export const AFFIRMATION_POOL: Affirmation[] = [
  { content: 'Du bist genau richtig so wie du bist — auch im Dating.', category: 'selbstliebe' },
  { content: 'Du musst dich nicht verbiegen um gesehen zu werden.', category: 'selbstliebe' },
  { content: 'Deine Einzigartigkeit ist keine Schwäche — sie ist dein Geschenk.', category: 'selbstliebe' },
  { content: 'Du verdienst eine Liebe die sich leicht anfühlt.', category: 'selbstliebe' },
  { content: 'Dein Tempo ist das richtige Tempo.', category: 'selbstliebe' },
  { content: 'Echte Verbindung beginnt mit dir selbst.', category: 'praesenz' },
  { content: 'Der heutige Moment ist der einzige in dem echte Begegnung möglich ist.', category: 'praesenz' },
  { content: 'Du musst nicht alles wissen — du musst nur da sein.', category: 'praesenz' },
  { content: 'Präsenz ist das größte Geschenk das du geben kannst.', category: 'praesenz' },
  { content: 'Was wäre wenn du heute einfach du selbst wärst?', category: 'praesenz' },
  { content: 'Echte Verbindung braucht Zeit — und das ist gut so.', category: 'verbindung' },
  { content: 'Jede Begegnung trägt etwas in sich auch wenn sie kurz ist.', category: 'verbindung' },
  { content: 'Du musst nicht jeden Menschen für dich gewinnen.', category: 'verbindung' },
  { content: 'Die richtige Verbindung fühlt sich an wie nach Hause kommen.', category: 'verbindung' },
  { content: 'Bewusstes Dating ist kein Sprint — es ist ein Weg.', category: 'verbindung' },
  { content: 'Es ist mutig sich wirklich zu zeigen.', category: 'mut' },
  { content: 'Verletzlichkeit ist keine Schwäche — sie ist der Anfang von Nähe.', category: 'mut' },
  { content: 'Du darfst wollen was du wirklich willst.', category: 'mut' },
  { content: 'Jede neue Begegnung ist ein neuer Anfang — unabhängig vom letzten.', category: 'mut' },
  { content: 'Es braucht Mut präsent zu sein. Du hast diesen Mut.', category: 'mut' },
]

/** Returns today's affirmation — rotates daily through the full pool */
export function getDailyAffirmation(): Affirmation {
  const idx = Math.floor(Date.now() / 86_400_000) % AFFIRMATION_POOL.length
  return AFFIRMATION_POOL[idx]
}

export const CATEGORY_LABELS: Record<Affirmation['category'], string> = {
  selbstliebe: 'Selbstliebe',
  praesenz:    'Präsenz',
  verbindung:  'Verbindung',
  mut:         'Mut',
}
