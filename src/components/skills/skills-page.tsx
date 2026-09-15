import { useMemo, useState } from 'react'
import { SKILLS } from '../../data/skills'
import { useEntityHistory } from '../../hooks/useEntityHistory'
import { useSavedSkills } from '../../hooks/useSavedSkills'
import { formatSkillMarkdown, parseSkillHighlights, skillPath } from '../../lib/formatContent'
import { href, navigate, updateParams, type Route } from '../../lib/router'
import { filterTagged } from '../../lib/search'
import type { EntityHistoryRecord } from '../../types/history'
import type { Skill, UserSkillInput } from '../../types/skill'
import { EntityHistoryDialog } from '../history/entity-history-dialog'
import { HistoryBadge } from '../history/history-badge'
import { BrowseLayout } from '../layout/browse-layout'
import { PageHeading } from '../layout/page-heading'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { ConfirmDeleteDialog } from '../ui/confirm-delete-dialog'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'
import { ClockIcon, PencilIcon, PlusIcon, TrashIcon } from '../ui/icons'
import { SkillFormDialog } from './skill-form-dialog'

export function SkillsPage({ route }: { route: Route }) {
  const { skills: userSkills, create, update, remove } = useSavedSkills()
  const { getHistory, saveEdit, revertToVersion, histories } = useEntityHistory()
  const [formSkill, setFormSkill] = useState<{ skill?: Skill } | null>(null)
  const [historyRecord, setHistoryRecord] = useState<EntityHistoryRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null)
  const [openSkillName, setOpenSkillName] = useState<string | null>(null)

  const allSkills = useMemo(() => {
    const skillHistories = new Map(
      histories.filter((h) => h.entityType === 'skill').map((h) => [h.entityId, h]),
    )
    return [...userSkills, ...SKILLS].map((s) => {
      const h = skillHistories.get(s.name)
      return h ? { ...s, ...(h.currentSnapshot as Partial<Skill>) } : s
    })
  }, [userSkills, histories])

  const tagSuggestions = useMemo(() => Array.from(new Set(allSkills.flatMap((s) => s.tags))), [allSkills])

  const query = route.params.get('q') ?? ''
  const tag = route.params.get('tag')
  const visible = filterTagged(allSkills, { query, tag }, (skill) => [
    skill.name,
    skill.title,
    skill.description,
    skill.body,
    skill.source,
  ])
  const openSkill = allSkills.find((s) => s.name === openSkillName)
  const clearFilters = () => navigate(href(route.path), { replace: true })

  function handleSubmit(input: UserSkillInput) {
    if (formSkill?.skill) {
      const target = formSkill.skill
      if (target.origin === 'user') {
        update(target.name, input)
      }
      saveEdit('skill', target.name, input.title, target, { ...target, ...input }, 'Saved skill modifications')
    } else {
      create(input)
    }
    setFormSkill(null)
  }

  function handleRevert(versionNumber: number) {
    if (!historyRecord) return
    const updated = revertToVersion<Skill>('skill', historyRecord.entityId, versionNumber)
    if (updated) {
      setHistoryRecord(updated)
      const snap = updated.currentSnapshot
      if (userSkills.some((s) => s.name === updated.entityId)) {
        update(updated.entityId, {
          name: snap.name,
          title: snap.title,
          description: snap.description,
          tags: snap.tags,
          source: snap.source,
          body: snap.body,
        })
      }
    }
  }

  return (
    <>
      <BrowseLayout
        heading={
          <PageHeading
            title="Skills"
            description={
              <>
                Agent skills from <code className="font-mono">.cursor/skills/</code>. Create your own custom skills,
                configure built-in specs, or copy complete <code className="font-mono">SKILL.md</code> files ready to paste into any AI coding assistant.
              </>
            }
            actions={
              <Button variant="primary" onClick={() => setFormSkill({})}>
                <PlusIcon className="size-4" />
                Create Skill
              </Button>
            }
          />
        }
        count={visible.length}
        noun={['skill', 'skills']}
        activeTag={tag}
        onClearTag={() => updateParams(route, { tag: null })}
        hasFilters={Boolean(query || tag)}
        onClearFilters={clearFilters}
      >
        {visible.length > 0 ? (
          <CardGrid
            items={visible}
            getKey={(skill) => skill.name}
            renderItem={(skill) => {
              const history = getHistory('skill', skill.name)
              const highlights = parseSkillHighlights(skill.body)

              return (
                <ContentCard
                  id={`skill-card-${skill.name}`}
                  title={skill.title}
                  description={skill.description}
                  eyebrow={
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                      <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-xs font-medium text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400">
                        {skillPath(skill)}
                      </span>
                      {skill.origin === 'user' && (
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                          Custom
                        </span>
                      )}
                      {history && history.currentVersionNumber > 0 && (
                        <HistoryBadge
                          versionNumber={history.currentVersionNumber}
                          totalRevisions={history.revisions.length}
                          onClick={() => setHistoryRecord(history)}
                        />
                      )}
                    </div>
                  }
                  onOpen={() => setOpenSkillName(skill.name)}
                  actions={<CopyButton text={formatSkillMarkdown(skill)} label="Copy SKILL.md" />}
                  footer={
                    <div className="flex items-center gap-1">
                      {history && history.currentVersionNumber > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setHistoryRecord(history)}
                          title="View revision history"
                          className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                        >
                          <ClockIcon className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormSkill({ skill })}
                        aria-label={`Edit ${skill.title}`}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      {skill.origin === 'user' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingDelete(skill)}
                          aria-label={`Delete ${skill.title}`}
                          className="hover:text-red-600 dark:hover:text-red-400"
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  }
                >
                  {highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {highlights.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                          <span className="size-1.5 shrink-0 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                          <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">{item}</span>
                        </li>
                      ))}
                      {highlights.length > 3 && (
                        <li className="pl-3.5 text-xs text-zinc-400 dark:text-zinc-500">
                          +{highlights.length - 3} more directives
                        </li>
                      )}
                    </ul>
                  )}
                </ContentCard>
              )
            }}
          />
        ) : (
          <EmptyState
            title="No skills match your search."
            action={<Button onClick={clearFilters}>Clear search</Button>}
          />
        )}

        {openSkill && (
          <DetailDialog
            open
            onClose={() => setOpenSkillName(null)}
            title={openSkill.title}
            description={openSkill.description}
            eyebrow={
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-xs font-medium text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400">
                  {skillPath(openSkill)}
                </span>
                {openSkill.origin === 'user' && (
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                    Custom
                  </span>
                )}
              </div>
            }
            body={openSkill.body}
            tags={openSkill.tags}
            activeTag={tag}
            onTagClick={(next) => {
              setOpenSkillName(null)
              updateParams(route, { tag: tag === next ? null : next })
            }}
            source={openSkill.source}
            actions={
              <div className="flex items-center gap-2">
                {(() => {
                  const history = getHistory('skill', openSkill.name)
                  return history && history.currentVersionNumber > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryRecord(history)}
                      className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                    >
                      <ClockIcon className="mr-1 size-3.5" />
                      History ({history.revisions.length})
                    </Button>
                  ) : null
                })()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpenSkillName(null)
                    setFormSkill({ skill: openSkill })
                  }}
                >
                  <PencilIcon className="mr-1 size-3.5" />
                  Edit
                </Button>
                <CopyButton text={formatSkillMarkdown(openSkill)} label="Copy skill" />
              </div>
            }
          />
        )}
      </BrowseLayout>

      {formSkill && (
        <SkillFormDialog
          skill={formSkill.skill}
          tagSuggestions={tagSuggestions}
          onSubmit={handleSubmit}
          onClose={() => setFormSkill(null)}
        />
      )}

      {historyRecord && (
        <EntityHistoryDialog
          record={historyRecord}
          onRevert={handleRevert}
          onClose={() => setHistoryRecord(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteDialog
          noun="skill"
          itemTitle={pendingDelete.title}
          onConfirm={() => {
            remove(pendingDelete.name)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
