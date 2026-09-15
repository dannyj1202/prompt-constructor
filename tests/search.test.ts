import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { type Searchable, searchLibrary } from '../mcp/search.ts'

// The MCP tools' forgiving search (mcp/search.ts), tested as a pure function.

function entry(name: string, title: string, extra: Partial<Searchable> = {}): Searchable {
  return { name, title, description: '', text: '', tags: [], ...extra }
}

const library = [
  entry('prompt-guide', 'Writing good prompts', { text: 'How to prompt an agent' }),
  entry('pr-description', 'Write a production PR description', { description: 'Draft a pull request description', tags: ['pr'] }),
  entry('hotfix-notes', 'Hotfix notes', { text: 'Summarize the hotfix' }),
  entry('i18n-keys', 'Add string keys', { tags: ['i18n'] }),
  entry('body-only', 'Something else', { text: 'This mentions release in the body.' }),
  entry('release-checklist', 'Release checklist', { tags: ['release'] }),
]

const names = (query: string) => searchLibrary(library, query).items.map((item) => item.name)

describe('forgiving search', () => {
  test('filler words are ignored and a synonym phrase counts as one word', () => {
    const result = searchLibrary(library, 'write a pull request description for me')
    assert.equal(result.exact, true)
    assert.equal(result.items[0]?.name, 'pr-description')
  })

  test('short words match whole words only: "pr" is not the "pr" in "prompt"', () => {
    assert.ok(names('pr').includes('pr-description'))
    assert.ok(!names('pr').includes('prompt-guide'))
  })

  test('synonyms match each other', () => {
    assert.deepEqual(names('localization'), ['i18n-keys'])
    assert.deepEqual(names('deployment checklist'), ['release-checklist'])
  })

  test('plural and -ing forms match their stem', () => {
    assert.deepEqual(names('hotfixes'), ['hotfix-notes'])
    assert.ok(names('releasing').includes('release-checklist'))
  })

  test('title hits rank above body-only hits', () => {
    assert.deepEqual(names('release'), ['release-checklist', 'body-only'])
  })

  test('with no match on every word, the closest (at least half the words) come back, flagged', () => {
    const closest = searchLibrary(library, 'hotfix notes zzqqxx')
    assert.equal(closest.exact, false)
    assert.deepEqual(closest.items.map((item) => item.name), ['hotfix-notes'])
    assert.deepEqual(searchLibrary(library, 'hotfix zzqqxx yyww').items, [], 'one of three words is not close enough')
  })

  test('an empty query (or only filler) lists everything, in library order', () => {
    assert.deepEqual(names(''), library.map((item) => item.name))
    assert.deepEqual(names('please write it'), library.map((item) => item.name))
  })
})
