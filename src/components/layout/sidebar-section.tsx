import type { ReactNode } from 'react'

interface SidebarSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  return (
    <section className={className}>
      <h2 className="mb-2 px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</h2>
      {children}
    </section>
  )
}
