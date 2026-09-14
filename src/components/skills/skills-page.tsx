import { useMemo, useState } from 'react'
import { SKILLS } from '../../data/skills'
import { useSavedSkills } from '../../hooks/useSavedSkills'
import { formatSkillMarkdown, skillPath } from '../../lib/formatContent'
import type { Route } from '../../lib/router'
import type { Skill, UserSkillInput } from '../../types/skill'
import { TaggedCollectionPage } from '../layout/tagged-collection-page'
import { Button } from '../ui/button'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'
import { PencilIcon, PlusIcon, TrashIcon } from '../ui/icons'
import { SkillFormDialog } from './skill-form-dialog'

function SkillPath({ path }: { path: string }) {
  return <code className="truncate font-mono font-normal text-indigo-600 dark:text-indigo-400">{path}</code>
}

export function SkillsPage({ route }: { route: Route }) {
  const { skills: userSkills, create, update, remove } = useSavedSkills()
  const [formSkill, setFormSkill] = useState<{ skill?: Skill } | null>(null)

  const allSkills = useMemo(() => [...userSkills, ...SKILLS], [userSkills])
  const tagSuggestions = useMemo(() => Array.from(new Set(allSkills.flatMap((s) => s.tags))), [allSkills])

  function handleSubmit(input: UserSkillInput) {
    if (formSkill?.skill) {
      update(formSkill.skill.name, input)
    } else {
      create(input)
    }
    setFormSkill(null)
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
            Agent skills from <code className="font-mono">.cursor/skills/</code>. Create your own custom skills or copy
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
        renderCard={(skill, { activeTag, onTagClick, onOpen }) => (
          <ContentCard
            title={skill.title}
            description={skill.description}
            eyebrow={
              <div className="flex items-center gap-1.5">
                <SkillPath path={skillPath(skill)} />
                {skill.origin === 'user' && (
                  <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                    Custom
                  </span>
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
              skill.origin === 'user' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormSkill({ skill })}
                    aria-label={`Edit ${skill.title}`}
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(skill.name)}
                    aria-label={`Delete ${skill.title}`}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                </div>
              )
            }
          />
        )}
        renderDetail={(skill, { activeTag, onTagClick, onClose }) => (
          <DetailDialog
            open
            onClose={onClose}
            title={skill.title}
            description={skill.description}
            eyebrow={
              <div className="flex items-center gap-1.5">
                <SkillPath path={skillPath(skill)} />
                {skill.origin === 'user' && (
                  <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                    Custom
                  </span>
                )}
              </div>
            }
            body={formatSkillMarkdown(skill)}
            tags={skill.tags}
            activeTag={activeTag}
            onTagClick={onTagClick}
            source={skill.source}
            actions={
              <>
                {skill.origin === 'user' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClose()
                        setFormSkill({ skill })
                      }}
                    >
                      <PencilIcon className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        remove(skill.name)
                        onClose()
                      }}
                      className="hover:text-red-600 dark:hover:text-red-400"
                    >
                      <TrashIcon className="size-3.5" />
                      Delete
                    </Button>
                  </>
                )}
                <CopyButton
                  text={formatSkillMarkdown(skill)}
                  label="Copy to codebase"
                  className="px-3 py-1.5 text-sm"
                />
              </>
            }
          />
        )}
      />

      {formSkill && (
        <SkillFormDialog
          skill={formSkill.skill}
          tagSuggestions={tagSuggestions}
          onSubmit={handleSubmit}
          onClose={() => setFormSkill(null)}
        />
      )}
    </>
  )
}
