// Forgiving keyword search for the MCP tools. Pure (no runtime imports) so tests can load it directly.
//
// Agents search with loose, natural wording ("write a pull request description for our repo"), so:
// filler words are ignored, common synonyms count as the same word, plural and "-ing" forms match
// their stem, and words of four letters or fewer only match whole words ("pr" isn't the "pr" in
// "prompt"). If nothing matches every remaining word, the closest matches (at least half the
// words) come back instead, flagged as not exact.

export interface Searchable {
  name: string
  title: string
  description: string
  text: string
  tags: string[]
  category?: string
  source?: string
}

export interface SearchResult<T> {
  items: T[]
  /** False when nothing matched every word and `items` are the closest matches instead. */
  exact: boolean
}

/** Filler an agent tends to wrap keywords in. */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'with', 'by', 'from', 'about',
  'my', 'our', 'your', 'their', 'this', 'that', 'these', 'those', 'it', 'its', 'me', 'we', 'us', 'i', 'you',
  'is', 'are', 'be', 'please', 'can', 'could', 'would', 'should', 'will', 'some', 'any',
  'write', 'use', 'using', 'create', 'make', 'generate', 'help', 'how', 'do', 'does', 'get', 'find',
  'need', 'want', 'give', 'show', 'new',
])

/** Each group counts as one word. Entries are already normalized (lowercase, spaces between words). */
const SYNONYMS: string[][] = [
  ['pr', 'pull request', 'merge request'],
  ['i18n', 'internationalization', 'internationalisation', 'translation', 'translations', 'translate', 'localization', 'localisation', 'l10n'],
  ['a11y', 'accessibility', 'accessible'],
  ['ds', 'design system'],
  ['env', 'environment'],
  ['deps', 'dependency', 'dependencies'],
  ['repo', 'repository'],
  ['debug', 'debugging', 'bug', 'bugs', 'troubleshoot', 'troubleshooting'],
  ['test', 'tests', 'testing'],
  ['release', 'releases', 'deploy', 'deployment'],
  ['analytics', 'tracking', 'telemetry'],
  ['scaffold', 'scaffolding', 'boilerplate'],
  ['onboarding', 'setup', 'getting started'],
  ['changelog', 'release notes'],
  ['docs', 'documentation'],
  ['ts', 'typescript'],
]

/** Field weights, best first: name + title, tags, description, category + source, body. */
const FIELD_WEIGHTS = [4, 3, 2, 1, 1]

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/** A word and its plural/"-ing"/"-ed" stem, e.g. "releases" also tries "releas". */
function withStem(word: string): string[] {
  const stem = word.replace(/(ing|ies|es|ed|s)$/, '')
  return stem.length >= 3 && stem !== word ? [word, stem] : [word]
}

/** The query as terms; each term is a list of alternatives, any one of which counts as a match. */
function parseQuery(query: string): string[][] {
  let rest = ` ${normalize(query)} `
  const terms = new Map<string, string[]>()
  const add = (alternatives: string[]) => terms.set(alternatives.join('|'), alternatives)

  // Phrases first ("pull request"), so their words aren't counted one by one.
  for (const group of SYNONYMS) {
    for (const phrase of group.filter((entry) => entry.includes(' '))) {
      if (rest.includes(` ${phrase} `)) {
        rest = rest.replaceAll(` ${phrase} `, ' ')
        add(group)
      }
    }
  }
  for (const word of rest.split(' ')) {
    if (!word || STOPWORDS.has(word)) continue
    const forms = withStem(word)
    add(SYNONYMS.find((group) => forms.some((form) => group.includes(form))) ?? forms)
  }
  return [...terms.values()]
}

function contains(field: string, needle: string): boolean {
  // Short words must stand alone: "pr" shouldn't match "prompt", nor "test" match "latest".
  if (needle.length <= 4) return ` ${field} `.includes(` ${needle} `)
  return field.includes(needle)
}

function fieldsOf(entry: Searchable): string[] {
  return [
    normalize(`${entry.name} ${entry.title}`),
    normalize(entry.tags.join(' ')),
    normalize(entry.description),
    normalize(`${entry.category ?? ''} ${entry.source ?? ''}`),
    normalize(entry.text),
  ]
}

/** Weight of the best field any alternative appears in, or 0 if none does. */
function termWeight(fields: string[], alternatives: string[]): number {
  const index = fields.findIndex((field) => alternatives.some((alternative) => contains(field, alternative)))
  return index === -1 ? 0 : FIELD_WEIGHTS[index]
}

/**
 * Entries matching every term, best first. If there are none, entries matching at least half
 * the terms, with `exact: false`. Ties keep the input order (your own items come first).
 */
export function searchLibrary<T extends Searchable>(entries: T[], query: string): SearchResult<T> {
  const terms = parseQuery(query)
  if (terms.length === 0) return { items: entries, exact: true }

  const scored = entries.map((entry) => {
    const fields = fieldsOf(entry)
    const weights = terms.map((alternatives) => termWeight(fields, alternatives))
    return { entry, matched: weights.filter((weight) => weight > 0).length, score: weights.reduce((sum, weight) => sum + weight, 0) }
  })

  const complete = scored.filter((s) => s.matched === terms.length)
  if (complete.length > 0) {
    return { items: complete.sort((a, b) => b.score - a.score).map((s) => s.entry), exact: true }
  }
  const needed = Math.ceil(terms.length / 2)
  const closest = scored
    .filter((s) => s.matched >= needed)
    .sort((a, b) => b.matched - a.matched || b.score - a.score)
  return { items: closest.map((s) => s.entry), exact: false }
}
