import { SKILLS } from '../../data/skills'
import { formatSkillMarkdown, skillPath } from '../../lib/formatContent'
import type { Route } from '../../lib/router'
import { TaggedCollectionPage } from '../layout/tagged-collection-page'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'

function SkillPath({ path }: { path: string }) {
  return <code className="truncate font-mono font-normal text-indigo-600 dark:text-indigo-400">{path}</code>
}

export function SkillsPage({ route }: { route: Route }) {
  return (
    <TaggedCollectionPage
      route={route}
      items={SKILLS}
      getKey={(skill) => skill.name}
      searchFields={(skill) => [skill.name, skill.title, skill.description, skill.body, skill.source]}
      title="Skills"
      description={
        <>
          Agent skills from <code className="font-mono">.cursor/skills/</code>. “Copy to codebase” copies the
          full SKILL.md, frontmatter included, ready to paste at the path shown.
        </>
      }
      noun={['skill', 'skills']}
      renderCard={(skill, { activeTag, onTagClick, onOpen }) => (
        <ContentCard
          title={skill.title}
          description={skill.description}
          eyebrow={<SkillPath path={skillPath(skill)} />}
          preview={skill.body}
          tags={skill.tags}
          activeTag={activeTag}
          onTagClick={onTagClick}
          source={skill.source}
          onOpen={onOpen}
          actions={<CopyButton text={formatSkillMarkdown(skill)} label="Copy to codebase" />}
        />
      )}
      renderDetail={(skill, { activeTag, onTagClick, onClose }) => (
        <DetailDialog
          open
          onClose={onClose}
          title={skill.title}
          description={skill.description}
          eyebrow={<SkillPath path={skillPath(skill)} />}
          body={formatSkillMarkdown(skill)}
          tags={skill.tags}
          activeTag={activeTag}
          onTagClick={onTagClick}
          source={skill.source}
          actions={
            <CopyButton
              text={formatSkillMarkdown(skill)}
              label="Copy to codebase"
              className="px-3 py-1.5 text-sm"
            />
          }
        />
      )}
    />
  )
}
