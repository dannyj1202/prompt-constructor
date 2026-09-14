import { useMemo } from 'react'
import { SKILLS } from '../../data/skills'
import { TASTE_ENTRIES } from '../../data/taste'
import { href, type Route } from '../../lib/router'
import { countByTag } from '../../lib/search'
import type { Prompt } from '../../types/prompt'
import { PageHeading } from '../layout/page-heading'
import { EmptyState } from '../ui/card-grid'

interface TagsPageProps {
  route: Route
  /** Built-in and saved prompts together. */
  prompts: Prompt[]
}

export function TagsPage({ route, prompts }: TagsPageProps) {
  const query = route.params.get('q')?.trim().toLowerCase() ?? ''

  // Each section links back to the page that owns that content type.
  const sections = useMemo(
    () => [
      { title: 'Prompts', path: '/prompts', tags: countByTag(prompts) },
      { title: 'Skills', path: '/skills', tags: countByTag(SKILLS) },
      { title: 'Taste', path: '/taste', tags: countByTag(TASTE_ENTRIES) },
    ],
    [prompts],
  )
  const uniqueTags = new Set(sections.flatMap((section) => section.tags.map(([tag]) => tag)))
  const filtered = sections
    .map((section) => ({ ...section, tags: section.tags.filter(([tag]) => tag.includes(query)) }))
    .filter((section) => section.tags.length > 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageHeading
        title="Tags"
        description={`${uniqueTags.size} tags in use across prompts, skills, and taste. Pick one to see what's tagged with it.`}
      />

      {filtered.length === 0 ? (
        <EmptyState title={query ? `No tags match "${query}".` : 'No tags yet.'} />
      ) : (
        <div className="space-y-8">
          {filtered.map((section) => (
            <section key={section.path} aria-labelledby={`tags-${section.path}`}>
              <h2 id={`tags-${section.path}`} className="mb-3 text-sm font-semibold">
                {section.title}{' '}
                <span className="font-normal text-zinc-500 tabular-nums">{section.tags.length}</span>
              </h2>
              <ul className="flex flex-wrap gap-2">
                {section.tags.map(([tag, count]) => (
                  <li key={tag}>
                    <a
                      href={href(section.path, { tag })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                    >
                      #{tag}
                      <span className="text-xs text-zinc-400 tabular-nums">{count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
