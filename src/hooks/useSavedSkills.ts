import { useCallback, useSyncExternalStore } from 'react'
import { apiCreateSkill, apiDeleteSkill, apiUpdateSkill } from '../lib/api'
import { getSavedSkills, setSavedSkills, subscribeSavedSkills } from '../lib/savedSkillsStorage'
import type { Skill, UserSkillInput } from '../types/skill'

export function useSavedSkills() {
  const skills = useSyncExternalStore(subscribeSavedSkills, getSavedSkills)

  const create = useCallback((input: UserSkillInput): Skill => {
    const now = new Date().toISOString()
    const skill: Skill = {
      ...input,
      origin: 'user',
      createdAt: now,
      updatedAt: now,
    }
    setSavedSkills([skill, ...getSavedSkills()])
    apiCreateSkill(skill).catch((err) => console.warn('[API] Create skill failed, saved locally:', err))
    return skill
  }, [])

  const update = useCallback((name: string, input: UserSkillInput): Skill | undefined => {
    const current = getSavedSkills().find((skill) => skill.name === name)
    if (!current) return undefined
    // input.name may differ from `name`: that's a rename, which the API handles.
    const updated: Skill = { ...current, ...input, updatedAt: new Date().toISOString() }
    setSavedSkills(getSavedSkills().map((skill) => (skill.name === name ? updated : skill)))
    apiUpdateSkill(name, updated).catch((err) => console.warn('[API] Update skill failed, saved locally:', err))
    return updated
  }, [])

  const remove = useCallback((name: string) => {
    setSavedSkills(getSavedSkills().filter((skill) => skill.name !== name))
    apiDeleteSkill(name).catch((err) => console.warn('[API] Delete skill failed, removed locally:', err))
  }, [])

  return { skills, create, update, remove }
}
