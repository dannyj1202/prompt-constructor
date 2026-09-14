import { useEffect, useMemo, useState } from 'react'
import { Header } from './components/layout/header'
import { PageHeading } from './components/layout/page-heading'
import { McpConfigDialog } from './components/mcp/mcp-config-dialog'
import { DeletePromptDialog } from './components/prompts/delete-prompt-dialog'
import type { PromptActions } from './components/prompts/prompt-actions'
import { PromptDetailDialog } from './components/prompts/prompt-detail-dialog'
import { PromptFormDialog } from './components/prompts/prompt-form-dialog'
import { PromptsPage } from './components/prompts/prompts-page'
import { SavedPromptsPage } from './components/prompts/saved-prompts-page'
import { SkillsPage } from './components/skills/skills-page'
import { TagsPage } from './components/tags/tags-page'
import { TastePage } from './components/taste/taste-page'
import { WorkflowDetailPage } from './components/workflows/workflow-detail-page'
import { WorkflowsPage } from './components/workflows/workflows-page'
import { BUILT_IN_PROMPTS } from './data/prompts'
import { useSavedPrompts } from './hooks/useSavedPrompts'
import { syncSavedPromptsToMcp } from './lib/mcpSync'
import { href, navigate, updateParams, useHashRoute } from './lib/router'
import { getSavedPrompts } from './lib/savedPromptsStorage'
import { countByTag } from './lib/search'
import type { Prompt, UserPrompt, UserPromptInput } from './types/prompt'

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  '/saved': 'Search saved prompts…',
  '/workflows': 'Search workflows…',
  '/skills': 'Search skills…',
  '/taste': 'Search taste…',
  '/tags': 'Filter tags…',
}

export default function App() {
  const route = useHashRoute()
  const { prompts: savedPrompts, create, update, remove } = useSavedPrompts()

  // Saved prompts first so your own work sits at the top of the library.
  const allPrompts = useMemo<Prompt[]>(() => [...savedPrompts, ...BUILT_IN_PROMPTS], [savedPrompts])
  const promptsById = useMemo(() => new Map(allPrompts.map((p) => [p.id, p])), [allPrompts])
  const tagSuggestions = useMemo(() => countByTag(allPrompts).map(([tag]) => tag), [allPrompts])

  const [openPromptId, setOpenPromptId] = useState<string | null>(null)
  const [form, setForm] = useState<{ prompt?: UserPrompt } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserPrompt | null>(null)
  const [mcpOpen, setMcpOpen] = useState(false)

  // Derived from the live list so edits show immediately and deletes close it.
  const openPrompt = openPromptId ? promptsById.get(openPromptId) : undefined
  const isWorkflowDetail = route.path.startsWith('/workflows/')

  // Seed the MCP server's copy of saved prompts on startup (dev only).
  useEffect(() => {
    syncSavedPromptsToMcp(getSavedPrompts())
  }, [])
  // Braces matter: newer browsers return a Promise from scrollTo, and an
  // effect must return nothing or a cleanup function.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.path])

  const promptActions: PromptActions = {
    onOpen: (prompt) => setOpenPromptId(prompt.id),
    onEdit: (prompt) => setForm({ prompt }),
    onDelete: setPendingDelete,
  }

  function handleQueryChange(q: string) {
    // Searching from a workflow's detail page searches the workflow list.
    if (isWorkflowDetail) navigate(href('/workflows', { q }), { replace: true })
    else updateParams(route, { q })
  }

  function handleSubmit(input: UserPromptInput) {
    if (form?.prompt) {
      update(form.prompt.id, input)
    } else {
      create(input)
      navigate(href('/saved'))
    }
    setForm(null)
  }

  function renderPage() {
    const { path } = route
    if (path === '/' || path === '/prompts') {
      return <PromptsPage route={route} prompts={allPrompts} {...promptActions} />
    }
    if (path === '/saved') {
      return (
        <SavedPromptsPage route={route} prompts={savedPrompts} onCreate={() => setForm({})} {...promptActions} />
      )
    }
    if (path === '/workflows') return <WorkflowsPage route={route} promptsById={promptsById} />
    if (isWorkflowDetail) {
      const workflowId = decodeURIComponent(path.slice('/workflows/'.length))
      return <WorkflowDetailPage workflowId={workflowId} promptsById={promptsById} />
    }
    if (path === '/skills') return <SkillsPage route={route} />
    if (path === '/taste') return <TastePage route={route} />
    if (path === '/tags') return <TagsPage route={route} prompts={allPrompts} />
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <PageHeading
          title="Page not found"
          description={
            <a href={href('/prompts')} className="text-indigo-600 hover:underline dark:text-indigo-400">
              Back to prompts
            </a>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        currentPath={route.path}
        query={isWorkflowDetail ? '' : (route.params.get('q') ?? '')}
        onQueryChange={handleQueryChange}
        searchPlaceholder={SEARCH_PLACEHOLDERS[route.path] ?? 'Search prompts, tags, sources…'}
        savedCount={savedPrompts.length}
        onCreatePrompt={() => setForm({})}
        onOpenMcp={() => setMcpOpen(true)}
      />

      {renderPage()}

      {openPrompt && (
        <PromptDetailDialog
          prompt={openPrompt}
          activeTag={route.params.get('tag')}
          onClose={() => setOpenPromptId(null)}
          onTagClick={(tag) => {
            setOpenPromptId(null)
            navigate(href(route.path === '/saved' ? '/saved' : '/prompts', { tag }))
          }}
          onEdit={promptActions.onEdit}
          onDelete={promptActions.onDelete}
        />
      )}
      {form && (
        <PromptFormDialog
          prompt={form.prompt}
          tagSuggestions={tagSuggestions}
          onSubmit={handleSubmit}
          onClose={() => setForm(null)}
        />
      )}
      {pendingDelete && (
        <DeletePromptDialog
          prompt={pendingDelete}
          onConfirm={() => {
            remove(pendingDelete.id)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      {mcpOpen && <McpConfigDialog onClose={() => setMcpOpen(false)} />}
    </div>
  )
}
