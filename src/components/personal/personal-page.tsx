import { useMemo, useState } from 'react'
import { useEntityHistory } from '../../hooks/useEntityHistory'
import { useSavedPrompts } from '../../hooks/useSavedPrompts'
import { useSavedSkills } from '../../hooks/useSavedSkills'
import { useSavedTaste } from '../../hooks/useSavedTaste'
import { useSavedWorkflows } from '../../hooks/useSavedWorkflows'
import { href, navigate, type Route } from '../../lib/router'
import type { EntityHistoryRecord, EntityType } from '../../types/history'
import type { Prompt } from '../../types/prompt'
import { EntityHistoryDialog } from '../history/entity-history-dialog'
import { HistoryBadge } from '../history/history-badge'
import { PageHeading } from '../layout/page-heading'
import type { PromptActions } from '../prompts/prompt-actions'
import { PromptCard } from '../prompts/prompt-card'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { ContentCard } from '../ui/content-card'
import {
  ArrowUturnLeftIcon,
  CheckIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
} from '../ui/icons'

type TabType = 'recently-edited' | 'prompts' | 'workflows' | 'skills' | 'taste' | 'all'

interface PersonalPageProps extends PromptActions {
  route: Route
  prompts: Prompt[]
  onCreatePrompt: () => void
  onEditWorkflow?: (id: string) => void
  onEditSkill?: (name: string) => void
  onEditTaste?: (id: string) => void
}

export function PersonalPage({
  route,
  prompts,
  onCreatePrompt,
  onOpen,
  onEdit,
  onDelete,
  onHistory,
  onEditWorkflow,
  onEditSkill,
  onEditTaste,
}: PersonalPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('recently-edited')
  const [historyRecord, setHistoryRecord] = useState<EntityHistoryRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { recentlyEdited, getHistory, revertToVersion } = useEntityHistory()
  const { prompts: userPrompts } = useSavedPrompts()
  const { workflows: userWorkflows } = useSavedWorkflows()
  const { skills: userSkills } = useSavedSkills()
  const { tasteEntries: userTaste } = useSavedTaste()

  const query = route.params.get('q')?.toLowerCase() ?? ''

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  function handleRevert(versionNumber: number) {
    if (!historyRecord) return
    const updated = revertToVersion(historyRecord.entityType, historyRecord.entityId, versionNumber)
    if (updated) {
      setHistoryRecord(updated)
      showToast(
        versionNumber === 0
          ? `Reverted "${historyRecord.title}" to Original baseline!`
          : `Reverted "${historyRecord.title}" to Version ${versionNumber}!`,
      )
    }
  }

  function handleQuickRevertOriginal(type: EntityType, id: string, title: string) {
    const updated = revertToVersion(type, id, 0)
    if (updated) {
      showToast(`Reverted "${title}" to Original baseline!`)
    }
  }

  // Filtered recently edited items
  const filteredRecentlyEdited = useMemo(() => {
    return recentlyEdited.filter((item) => {
      if (query && !item.title.toLowerCase().includes(query) && !item.description?.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  }, [recentlyEdited, query])

  // Count badges
  const editedCount = recentlyEdited.length
  const totalPersonalCount = userPrompts.length + userWorkflows.length + userSkills.length + userTaste.length + editedCount

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageHeading
        title="Personal Library & History"
        description="Your personal workspace: tracks every edited prompt, workflow, skill, and taste convention with multi-version snapshots and instant rollback."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={onCreatePrompt}>
              <PlusIcon className="size-4" />
              Create Prompt
            </Button>
          </div>
        }
      />

      {toastMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckIcon className="size-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* View Selector Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 border-b border-zinc-200 pb-3 dark:border-white/10">
        <TabButton
          active={activeTab === 'recently-edited'}
          onClick={() => setActiveTab('recently-edited')}
          count={editedCount}
          label="Recently Edited"
        />
        <TabButton
          active={activeTab === 'prompts'}
          onClick={() => setActiveTab('prompts')}
          count={userPrompts.length}
          label="Custom Prompts"
        />
        <TabButton
          active={activeTab === 'workflows'}
          onClick={() => setActiveTab('workflows')}
          count={userWorkflows.length}
          label="Custom Workflows"
        />
        <TabButton
          active={activeTab === 'skills'}
          onClick={() => setActiveTab('skills')}
          count={userSkills.length}
          label="Custom Skills"
        />
        <TabButton
          active={activeTab === 'taste'}
          onClick={() => setActiveTab('taste')}
          count={userTaste.length}
          label="Custom Taste"
        />
        <TabButton
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          count={totalPersonalCount}
          label="All Personal"
        />
      </div>

      {/* Tab: Recently Edited */}
      {activeTab === 'recently-edited' && (
        <div>
          {filteredRecentlyEdited.length === 0 ? (
            <EmptyState
              title="No edited items yet"
              description="When you edit any built-in or custom prompt, workflow, skill, or taste entry, each change is logged here with full revision history."
              action={
                <Button variant="secondary" onClick={() => navigate(href('/prompts'))}>
                  Browse Prompts to Edit
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecentlyEdited.map((item) => {
                const record = getHistory(item.entityType, item.entityId)
                return (
                  <ContentCard
                    key={`${item.entityType}-${item.entityId}`}
                    title={item.title}
                    description={item.description ?? ''}
                    eyebrow={
                      <div className="flex flex-wrap items-center gap-2">
                        <EntityTypeBadge type={item.entityType} />
                        <HistoryBadge
                          versionNumber={item.currentVersionNumber}
                          totalRevisions={item.totalRevisions}
                          onClick={() => {
                            if (record) setHistoryRecord(record)
                          }}
                        />
                      </div>
                    }
                    tags={item.tags}
                    onOpen={() => {
                      if (item.entityType === 'prompt') {
                        const p = prompts.find((pr) => pr.id === item.entityId)
                        if (p) onOpen(p)
                      } else if (item.entityType === 'workflow') {
                        navigate(href(`/workflows/${item.entityId}`))
                      } else if (item.entityType === 'skill') {
                        navigate(href('/skills'))
                      } else if (item.entityType === 'taste') {
                        navigate(href('/taste'))
                      }
                    }}
                    footer={
                      <div className="flex flex-wrap items-center justify-between gap-2 w-full pt-1">
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <ClockIcon className="size-3" />
                          <span>
                            {new Date(item.lastEditedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (record) setHistoryRecord(record)
                            }}
                            title="View revision history & revert"
                            className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                          >
                            <ClockIcon className="size-3.5" />
                            History ({item.totalRevisions})
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleQuickRevertOriginal(item.entityType, item.entityId, item.title)
                            }
                            title="Revert to original baseline"
                          >
                            <ArrowUturnLeftIcon className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (item.entityType === 'prompt') {
                                const p = prompts.find((pr) => pr.id === item.entityId)
                                if (p) onEdit(p)
                              } else if (item.entityType === 'workflow') {
                                onEditWorkflow?.(item.entityId)
                              } else if (item.entityType === 'skill') {
                                onEditSkill?.(item.entityId)
                              } else if (item.entityType === 'taste') {
                                onEditTaste?.(item.entityId)
                              }
                            }}
                            title="Edit"
                          >
                            <PencilIcon className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    }
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Custom Prompts */}
      {activeTab === 'prompts' && (
        <div>
          {userPrompts.length === 0 ? (
            <EmptyState
              title="No custom prompts saved yet"
              description="Create reusable prompts with custom variables, descriptions, and labels."
              action={
                <Button variant="primary" onClick={onCreatePrompt}>
                  <PlusIcon className="size-4" />
                  Create Prompt
                </Button>
              }
            />
          ) : (
            <CardGrid
              items={userPrompts}
              getKey={(p) => p.id}
              renderItem={(prompt) => {
                const history = getHistory('prompt', prompt.id)
                return (
                  <PromptCard
                    prompt={prompt}
                    activeTag={null}
                    onTagClick={() => {}}
                    onOpen={onOpen}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onHistory={onHistory}
                    versionNumber={history?.currentVersionNumber}
                    totalRevisions={history?.revisions.length}
                  />
                )
              }}
            />
          )}
        </div>
      )}

      {/* Tab: Custom Workflows */}
      {activeTab === 'workflows' && (
        <div>
          {userWorkflows.length === 0 ? (
            <EmptyState
              title="No custom workflows yet"
              description="Build multi-step prompt chains for testing, deployment, or scaffolding tasks."
              action={
                <Button variant="secondary" onClick={() => navigate(href('/workflows'))}>
                  Go to Workflows
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userWorkflows.map((workflow) => {
                const history = getHistory('workflow', workflow.id)
                return (
                  <ContentCard
                    key={workflow.id}
                    title={workflow.title}
                    description={workflow.description}
                    eyebrow={
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-400 font-medium">
                          {workflow.steps.length} steps
                        </span>
                        {history && history.currentVersionNumber > 0 && (
                          <HistoryBadge
                            versionNumber={history.currentVersionNumber}
                            totalRevisions={history.revisions.length}
                            onClick={() => setHistoryRecord(history)}
                          />
                        )}
                      </div>
                    }
                    onOpen={() => navigate(href(`/workflows/${workflow.id}`))}
                    footer={
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditWorkflow?.(workflow.id)}
                        >
                          <PencilIcon className="size-3.5" />
                          Edit
                        </Button>
                      </div>
                    }
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Custom Skills */}
      {activeTab === 'skills' && (
        <div>
          {userSkills.length === 0 ? (
            <EmptyState
              title="No custom skills yet"
              description="Define custom agent instructions and markdown standards for your AI assistants."
              action={
                <Button variant="secondary" onClick={() => navigate(href('/skills'))}>
                  Go to Skills
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userSkills.map((skill) => {
                const history = getHistory('skill', skill.name)
                return (
                  <ContentCard
                    key={skill.name}
                    title={skill.title}
                    description={skill.description}
                    eyebrow={
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-emerald-400">{skill.name}</code>
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
                    onOpen={() => navigate(href('/skills'))}
                    footer={
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditSkill?.(skill.name)}
                        >
                          <PencilIcon className="size-3.5" />
                          Edit
                        </Button>
                      </div>
                    }
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Custom Taste */}
      {activeTab === 'taste' && (
        <div>
          {userTaste.length === 0 ? (
            <EmptyState
              title="No custom taste entries yet"
              description="Save your coding standards, architectural rules, and taste preferences."
              action={
                <Button variant="secondary" onClick={() => navigate(href('/taste'))}>
                  Go to Taste
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userTaste.map((taste) => {
                const history = getHistory('taste', taste.id)
                return (
                  <ContentCard
                    key={taste.id}
                    title={taste.title}
                    description={taste.description}
                    eyebrow={
                      history && history.currentVersionNumber > 0 ? (
                        <HistoryBadge
                          versionNumber={history.currentVersionNumber}
                          totalRevisions={history.revisions.length}
                          onClick={() => setHistoryRecord(history)}
                        />
                      ) : undefined
                    }
                    preview={taste.body}
                    tags={taste.tags}
                    onOpen={() => navigate(href('/taste'))}
                    footer={
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTaste?.(taste.id)}
                        >
                          <PencilIcon className="size-3.5" />
                          Edit
                        </Button>
                      </div>
                    }
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: All Personal */}
      {activeTab === 'all' && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
              Recently Edited ({filteredRecentlyEdited.length})
            </h2>
            {filteredRecentlyEdited.length === 0 ? (
              <p className="text-xs text-zinc-500">No edited items yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecentlyEdited.slice(0, 6).map((item) => {
                  const record = getHistory(item.entityType, item.entityId)
                  return (
                    <ContentCard
                      key={`all-${item.entityType}-${item.entityId}`}
                      title={item.title}
                      description={item.description ?? ''}
                      eyebrow={
                        <div className="flex items-center gap-2">
                          <EntityTypeBadge type={item.entityType} />
                          <HistoryBadge
                            versionNumber={item.currentVersionNumber}
                            totalRevisions={item.totalRevisions}
                            onClick={() => {
                              if (record) setHistoryRecord(record)
                            }}
                          />
                        </div>
                      }
                      tags={item.tags}
                      footer={
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (record) setHistoryRecord(record)
                          }}
                          className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                        >
                          <ClockIcon className="size-3.5" />
                          History ({item.totalRevisions})
                        </Button>
                      }
                    />
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
              User Created Prompts ({userPrompts.length})
            </h2>
            {userPrompts.length === 0 ? (
              <p className="text-xs text-zinc-500">No user created prompts yet.</p>
            ) : (
              <CardGrid
                items={userPrompts}
                getKey={(p) => p.id}
                renderItem={(prompt) => (
                  <PromptCard
                    prompt={prompt}
                    activeTag={null}
                    onTagClick={() => {}}
                    onOpen={onOpen}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onHistory={onHistory}
                  />
                )}
              />
            )}
          </div>
        </div>
      )}

      {/* History Dialog */}
      {historyRecord && (
        <EntityHistoryDialog
          record={historyRecord}
          onRevert={handleRevert}
          onClose={() => setHistoryRecord(null)}
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  count,
  label,
}: {
  active: boolean
  onClick: () => void
  count?: number
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-semibold ${
            active
              ? 'bg-white/20 text-white dark:bg-zinc-800 dark:text-zinc-200'
              : 'bg-zinc-200/60 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function EntityTypeBadge({ type }: { type: EntityType }) {
  const styles: Record<EntityType, { label: string; className: string }> = {
    prompt: {
      label: 'Prompt',
      className:
        'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500/25',
    },
    workflow: {
      label: 'Workflow',
      className:
        'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400 dark:border-violet-500/25',
    },
    skill: {
      label: 'Skill',
      className:
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/25',
    },
    taste: {
      label: 'Taste',
      className:
        'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:border-amber-500/25',
    },
  }

  const badge = styles[type] ?? { label: type, className: '' }

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.className}`}
    >
      {badge.label}
    </span>
  )
}
