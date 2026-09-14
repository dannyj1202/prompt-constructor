import { fileURLToPath } from 'node:url'

/** Saved prompts mirrored from the browser's localStorage by the dev server (gitignored). */
export const SAVED_PROMPTS_FILE = fileURLToPath(new URL('./.data/saved-prompts.json', import.meta.url))
