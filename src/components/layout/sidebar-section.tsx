import type { ReactNode } from 'react'

interface SidebarSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  return (
    <section className={className}>
      <h2 className="mb-2 px-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">{title}</h2>
      {children}
    </section>
  )
}
