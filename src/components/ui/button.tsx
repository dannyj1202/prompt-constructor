import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-indigo-500 active:translate-y-px active:shadow-none disabled:bg-indigo-600/50 disabled:shadow-none',
  secondary:
    'border border-zinc-200 bg-white text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-zinc-100 active:translate-y-px active:shadow-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
  ghost: 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[32px] min-w-[32px] gap-1.5 rounded-md px-2.5 py-1 text-xs',
  md: 'gap-2 rounded-lg px-3 py-1.5 text-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'secondary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    />
  )
}
