import type { Skill } from '../types/skill'

// Pure helpers shared by the app and the local MCP server (mcp/server.ts).
// Keep this file free of runtime imports so Node can load it directly.

/** Leave simple strings bare; quote anything YAML might misread. */
function yamlString(value: string): string {
  return /^[\w\s.,()'/-]+$/.test(value) ? value : JSON.stringify(value)
}

/** Where the skill goes in a codebase. */
export function skillPath(skill: Skill): string {
  return `.cursor/skills/${skill.name}/SKILL.md`
}

/** The full SKILL.md file: frontmatter plus body. */
export function formatSkillMarkdown(skill: Skill): string {
  return `---\nname: ${skill.name}\ndescription: ${yamlString(skill.description)}\n---\n\n${skill.body.trim()}\n`
}

const TEMPLATE_VARIABLE = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g

/** Unique `{{VARIABLE}}` names in order of first appearance. */
export function templateVariables(body: string): string[] {
  return [...new Set([...body.matchAll(TEMPLATE_VARIABLE)].map((match) => match[1]))]
}

/** Replace `{{VARIABLE}}`s that have a value; leave the rest in place. */
export function fillTemplate(body: string, values: Record<string, string | undefined>): string {
  return body.replace(TEMPLATE_VARIABLE, (placeholder, name: string) => values[name] || placeholder)
}
