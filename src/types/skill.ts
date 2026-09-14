/** An agent skill, copied into a codebase as `.cursor/skills/<name>/SKILL.md`. */
export interface Skill {
  /** SKILL.md frontmatter `name`; also the folder name. kebab-case, unique. */
  name: string
  title: string
  /** SKILL.md frontmatter `description`: tells the agent when to use the skill. */
  description: string
  tags: string[]
  /** Where the skill lives in the source repo, e.g. `.cursor/skills/testid-standards/SKILL.md` */
  source: string
  /** Markdown body of SKILL.md (everything after the frontmatter). */
  body: string
}
