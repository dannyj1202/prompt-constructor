/** A coding style / convention entry, sourced from AGENTS.md or constitution.md. */
export interface TasteEntry {
  /** kebab-case, unique */
  id: string
  title: string
  description: string
  tags: string[]
  /** e.g. `AGENTS.md § Code Style` */
  source: string
  /** A single markdown block, copied as-is. */
  body: string
}
