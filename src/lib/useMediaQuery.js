import { useSyncExternalStore } from 'react'

function subscribeMaxWidth(px) {
  return (cb) => {
    const mq = window.matchMedia(`(max-width: ${px}px)`)
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  }
}

function snapshotMaxWidth(px) {
  return () => window.matchMedia(`(max-width: ${px}px)`).matches
}

/**
 * @param {number} maxWidth - CSS px breakpoint (default 639 = below `sm`)
 */
export function useMaxWidth(maxWidth = 639) {
  return useSyncExternalStore(
    subscribeMaxWidth(maxWidth),
    snapshotMaxWidth(maxWidth),
    () => false,
  )
}
