import { useMemo, useState } from 'react'
import { SKILLS } from '../../data/skills'
import { useEntityHistory } from '../../hooks/useEntityHistory'
import { useSavedSkills } from '../../hooks/useSavedSkills'
import { formatSkillMarkdown, skillPath } from '../../lib/formatContent'
import type { Route } from '../../lib/router'
import type { EntityHistoryRecord } from '../../types/history'
import type { Skill, UserSkillInput } from '../../types/skill'
import { EntityHistoryDialog } from '../history/entity-history-dialog'
import { HistoryBadge } from '../history/history-badge'
import { TaggedCollectionPage } from '../layout/tagged-collection-page'
import { Button } from '../ui/button'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'
import { ClockIcon, PencilIcon, PlusIcon, TrashIcon } from '../ui/icons'
import { SkillFormDialog } from './skill-form-dialog'

function SkillPath({ path }: { path: string }) {
  return <code className="truncate font-mono font-normal text-indigo-600 dark:text-indigo-400">{path}</code>
}

export function SkillsPage({ route }: { route: Route }) {
  const { skills: userSkills, create, update, remove } = useSavedSkills()
  const { getHistory, saveEdit, revertToVersion, histories } = useEntityHistory()
  const [formSkill, setFormSkill] = useState<{ skill?: Skill } | null>(null)
  const [historyRecord, setHistoryRecord] = useState<EntityHistoryRecord | null>(null)

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
      <TaggedCollectionPage
        route={route}
        items={allSkills}
        getKey={(skill) => skill.name}
        searchFields={(skill) => [skill.name, skill.title, skill.description, skill.body, skill.source]}
        title="Skills"
        description={
          <>
            Agent skills from <code className="font-mono">.cursor/skills/</code>. Create your own custom skills, customize built-in specs, or copy
            complete SKILL.md files ready to paste into any AI coding assistant.
          </>
        }
        actions={
          <Button variant="primary" onClick={() => setFormSkill({})}>
            <PlusIcon className="size-4" />
            Create Skill
          </Button>
        }
        noun={['skill', 'skills']}
        renderCard={(skill, { activeTag, onTagClick, onOpen }) => {
          const history = getHistory('skill', skill.name)
          return (
            <ContentCard
              title={skill.title}
              description={skill.description}
              eyebrow={
                <div className="flex flex-wrap items-center gap-1.5">
                  <SkillPath path={skillPath(skill)} />
                  {skill.origin === 'user' && (
                    <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
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
              preview={skill.body}
              tags={skill.tags}
              activeTag={activeTag}
              onTagClick={onTagClick}
              source={skill.source}
              onOpen={onOpen}
              actions={<CopyButton text={formatSkillMarkdown(skill)} label="Copy to codebase" />}
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
                      onClick={() => remove(skill.name)}
                      aria-label={`Delete ${skill.title}`}
                      className="hover:text-red-600 dark:hover:text-red-400"
                    >
                      <TrashIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
              }
            />
          )
        }}
        renderDetail={(skill, { activeTag, onTagClick, onClose }) => {
          const history = getHistory('skill', skill.name)
          return (
            <DetailDialog
              open
              onClose={onClose}
              title={skill.title}
              description={skill.description}
              eyebrow={
                <div className="flex flex-wrap items-center gap-1.5">
                  <SkillPath path={skillPath(skill)} />
                  {skill.origin === 'user' && (
                    <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
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
              body={skill.body}
              tags={skill.tags}
              activeTag={activeTag}
              onTagClick={onTagClick}
              source={skill.source}
              actions={
                <div className="flex items-center gap-2">
                  {history && history.currentVersionNumber > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryRecord(history)}
                      className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                    >
                      <ClockIcon className="size-3.5 mr-1" />
                      History ({history.revisions.length})
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose()
                      setFormSkill({ skill })
                    }}
                  >
                    <PencilIcon className="size-3.5 mr-1" />
                    Edit
                  </Button>
                  <CopyButton text={formatSkillMarkdown(skill)} label="Copy skill" />
                </div>
              }
            />
          )
        }}
      />

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
    </>
  )
}
