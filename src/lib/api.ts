import type { EntityHistoryRecord, EntityType } from '../types/history'
import type { UserPrompt } from '../types/prompt'
import type { Skill } from '../types/skill'
import type { TasteEntry } from '../types/taste'
import type { Workflow } from '../types/workflow'

// Writes send the full record the client just saved, including its timestamps.
// The server stores it only if it's newer than its own copy (last write wins).

const API_BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '')
    throw new Error(`API error ${res.status} on ${path}: ${errorBody}`)
  }

  return res.json() as Promise<T>
}

// ----------------- Prompts -----------------
export async function apiGetPrompts(): Promise<UserPrompt[]> {
  return request<UserPrompt[]>('/prompts')
}

export async function apiCreatePrompt(prompt: UserPrompt): Promise<UserPrompt> {
  return request<UserPrompt>('/prompts', {
    method: 'POST',
    body: JSON.stringify(prompt),
  })
}

export async function apiUpdatePrompt(id: string, prompt: UserPrompt): Promise<UserPrompt> {
  return request<UserPrompt>(`/prompts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(prompt),
  })
}

export async function apiDeletePrompt(id: string): Promise<void> {
  await request<{ success: boolean }>(`/prompts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// ----------------- Workflows -----------------
export async function apiGetWorkflows(): Promise<Workflow[]> {
  return request<Workflow[]>('/workflows')
}

export async function apiCreateWorkflow(workflow: Workflow): Promise<Workflow> {
  return request<Workflow>('/workflows', {
    method: 'POST',
    body: JSON.stringify(workflow),
  })
}

export async function apiUpdateWorkflow(id: string, workflow: Workflow): Promise<Workflow> {
  return request<Workflow>(`/workflows/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(workflow),
  })
}

export async function apiDeleteWorkflow(id: string): Promise<void> {
  await request<{ success: boolean }>(`/workflows/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// ----------------- Skills -----------------
export async function apiGetSkills(): Promise<Skill[]> {
  return request<Skill[]>('/skills')
}

export async function apiCreateSkill(skill: Skill): Promise<Skill> {
  return request<Skill>('/skills', {
    method: 'POST',
    body: JSON.stringify(skill),
  })
}

/** `name` is the skill's current (pre-edit) name; if `skill.name` differs, the server renames it. */
export async function apiUpdateSkill(name: string, skill: Skill): Promise<Skill> {
  return request<Skill>(`/skills/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: JSON.stringify(skill),
  })
}

export async function apiDeleteSkill(name: string): Promise<void> {
  await request<{ success: boolean }>(`/skills/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  })
}

// ----------------- Taste -----------------
export async function apiGetTaste(): Promise<TasteEntry[]> {
  return request<TasteEntry[]>('/taste')
}

export async function apiCreateTaste(entry: TasteEntry): Promise<TasteEntry> {
  return request<TasteEntry>('/taste', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
}

export async function apiUpdateTaste(id: string, entry: TasteEntry): Promise<TasteEntry> {
  return request<TasteEntry>(`/taste/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  })
}

export async function apiDeleteTaste(id: string): Promise<void> {
  await request<{ success: boolean }>(`/taste/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// ----------------- Favorites -----------------
export async function apiGetFavorites(): Promise<string[]> {
  return request<string[]>('/favorites')
}

export async function apiStarPrompt(promptId: string): Promise<void> {
  await request<{ success: boolean }>(`/favorites/${encodeURIComponent(promptId)}`, {
    method: 'POST',
  })
}

export async function apiUnstarPrompt(promptId: string): Promise<void> {
  await request<{ success: boolean }>(`/favorites/${encodeURIComponent(promptId)}`, {
    method: 'DELETE',
  })
}

// ----------------- History -----------------
export async function apiGetHistories(): Promise<EntityHistoryRecord[]> {
  return request<EntityHistoryRecord[]>('/history')
}

/** Stores the full record after an edit or revert; revisions are built client-side. */
export async function apiSaveHistory<T>(record: EntityHistoryRecord<T>): Promise<EntityHistoryRecord<T>> {
  return request<EntityHistoryRecord<T>>(`/history/${record.entityType}/${encodeURIComponent(record.entityId)}`, {
    method: 'PUT',
    body: JSON.stringify(record),
  })
}

export async function apiDeleteHistory(type: EntityType, id: string): Promise<void> {
  await request<{ success: boolean }>(`/history/${type}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// ----------------- Bulk Sync -----------------
export interface SyncPayload {
  prompts?: UserPrompt[]
  workflows?: Workflow[]
  skills?: Skill[]
  taste?: TasteEntry[]
  favorites?: string[]
  history?: EntityHistoryRecord[]
}

export async function apiSyncLocalStorage(payload: SyncPayload): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
