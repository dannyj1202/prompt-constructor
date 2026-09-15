import { BEND_DEFAULTS, MetalFx, useMetalBend } from 'metal-fx'
import { useRef } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { TerminalIcon } from '../ui/icons'

/**
 * The header's icon badge, wrapped in a liquid-metal ring that bends toward
 * the cursor on hover. MetalFx handles resize and off-screen pausing itself
 * (ResizeObserver + IntersectionObserver internally); unsupported browsers
 * just render the plain badge.
 */
export function HeaderLogo() {
  const badgeRef = useRef<HTMLSpanElement>(null)
  // Own getCfg so this doesn't touch the library's shared bend singleton.
  useMetalBend(badgeRef, () => ({ ...BEND_DEFAULTS, enabled: true }))
  // MetalFx's own 'auto' follows the OS, which is right for System but not when the toggle pins a theme.
  const { preference } = useTheme()

  return (
    <MetalFx
      variant="circle"
      preset="chromatic"
      theme={preference === 'system' ? 'auto' : preference}
      normalizeHostStyles={false}
    >
      <span ref={badgeRef} className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
        <TerminalIcon className="size-5" strokeWidth={2.5} />
      </span>
    </MetalFx>
  )
}
