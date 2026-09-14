import { useCallback, useSyncExternalStore } from 'react'
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
    return skill
  }, [])

  const update = useCallback((name: string, input: UserSkillInput): Skill | undefined => {
    let updated: Skill | undefined
    setSavedSkills(
      getSavedSkills().map((skill) => {
        if (skill.name !== name) return skill
        updated = { ...skill, ...input, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const remove = useCallback((name: string) => {
    setSavedSkills(getSavedSkills().filter((skill) => skill.name !== name))
  }, [])

  return { skills, create, update, remove }
}
