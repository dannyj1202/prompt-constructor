import { useState } from 'react'
import { fillTemplate, templateVariables } from '../../lib/formatContent'
import type { Prompt, UserPrompt } from '../../types/prompt'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'
import { StarButton } from '../ui/star-button'
import { INPUT_CLASS } from './prompt-form-dialog'
import { PromptControls } from './prompt-card'
import { PromptEyebrow } from './prompt-eyebrow'

interface PromptDetailDialogProps {
  prompt: Prompt
  activeTag: string | null
  onClose: () => void
  onTagClick: (tag: string) => void
  isStarred?: boolean
  onToggleStar?: () => void
  onEdit: (prompt: Prompt) => void
  onDelete?: (prompt: UserPrompt) => void
  onHistory?: (prompt: Prompt) => void
  versionNumber?: number
  totalRevisions?: number
}

/** Splits `body` on `{{VARIABLE}}` tokens, keeping the tokens so each segment can be styled. */
function splitOnVariables(body: string): { text: string; variable?: string }[] {
  return body.split(/(\{\{\s*[A-Za-z0-9_]+\s*\}\})/g).map((part) => {
    const match = part.match(/^\{\{\s*([A-Za-z0-9_]+)\s*\}\}$/)
    return match ? { text: part, variable: match[1] } : { text: part }
  })
}

/** Mount only while a prompt is open. */
export function PromptDetailDialog({
  prompt,
  activeTag,
  onClose,
  onTagClick,
  isStarred = false,
  onToggleStar,
  onEdit,
  onDelete,
  onHistory,
  versionNumber,
  totalRevisions,
}: PromptDetailDialogProps) {
  const variables = templateVariables(prompt.body)
  const [values, setValues] = useState<Record<string, string>>({})
  const filledBody = fillTemplate(prompt.body, values)

  return (
    <DetailDialog
      open
      onClose={onClose}
      title={prompt.title}
      description={prompt.description}
      eyebrow={<PromptEyebrow prompt={prompt} />}
      body={prompt.body}
      tags={prompt.tags}
      activeTag={activeTag}
      onTagClick={onTagClick}
      source={prompt.source}
      beforeBody={
        variables.length > 0 && (
          <div className="space-y-3 border-b border-zinc-200 bg-zinc-50/60 p-5 dark:border-white/8 dark:bg-white/[0.03]">
            <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Fill in the variables</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {variables.map((name) => (
                <label key={name} className="block space-y-1">
                  <span className="block font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {`{{${name}}}`}
                  </span>
                  <input
                    value={values[name] ?? ''}
                    onChange={(event) => setValues((prev) => ({ ...prev, [name]: event.target.value }))}
                    placeholder={`Enter ${name}…`}
                    className={INPUT_CLASS}
                  />
                </label>
              ))}
            </div>
          </div>
        )
      }
      bodyContent={
        <pre className="rounded-lg bg-zinc-50 p-4 font-mono text-sm whitespace-pre-wrap text-zinc-800 dark:bg-canvas-inset dark:text-zinc-200">
          {splitOnVariables(prompt.body).map((segment, index) => {
            if (!segment.variable) return segment.text
            const value = values[segment.variable]
            return (
              <span
                key={index}
                className={
                  value
                    ? 'rounded bg-indigo-100 px-1 py-0.5 font-semibold text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300'
                    : 'rounded bg-zinc-200/70 px-1 py-0.5 text-zinc-500 dark:bg-white/10 dark:text-zinc-400'
                }
              >
                {value || segment.text}
              </span>
            )
          })}
        </pre>
      }
      actions={
        <>
          {onToggleStar && (
            <StarButton
              isStarred={isStarred}
              onToggle={onToggleStar}
              label={isStarred ? 'Favorited' : 'Favorite'}
              className="px-2.5 py-1.5 text-xs"
            />
          )}
          <PromptControls
            prompt={prompt}
            onEdit={onEdit}
            onDelete={onDelete}
            onHistory={onHistory}
            versionNumber={versionNumber}
            totalRevisions={totalRevisions}
            labelled
          />
          <CopyButton text={filledBody} label="Copy prompt" className="px-3 py-1.5 text-sm" />
        </>
      }
    />
  )
}
