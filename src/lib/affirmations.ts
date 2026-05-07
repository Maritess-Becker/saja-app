// ─── Gedanke des Tages ────────────────────────────────────────────────────────

export const GEDANKE_POOL: string[] = [
  'Was machst du heute bewusst anders?',
  'Eine Verbindung die dich zuletzt wirklich berührt hat.',
  'Dein Tempo ist das richtige Tempo.',
  'Was bedeutet dir heute Nähe?',
  'Du musst dich nicht verbiegen um gesehen zu werden.',
  'Was nimmst du dir heute vor?',
  'Ehrlichkeit ist der Anfang von Nähe.',
  'Was bewegt dich gerade wirklich?',
  'Präsenz ist das größte Geschenk.',
  'Was lernst du gerade über dich?',
]

/** Returns today's Gedanke — rotates daily through the full pool */
export function getDailyGedanke(): string {
  const idx = Math.floor(Date.now() / 86_400_000) % GEDANKE_POOL.length
  return GEDANKE_POOL[idx]
}
