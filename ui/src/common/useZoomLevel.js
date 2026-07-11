import { useCallback, useEffect, useState } from 'react'

// Shared across every grid view (Albums, Artists, Songs, ...) so setting the
// tile size once applies everywhere, per the "generic, not per-page" design
// this was asked to follow. Persisted so it survives a reload.
const STORAGE_KEY = 'nd-grid-zoom'
const MIN_SIZE = 100
const MAX_SIZE = 340
const DEFAULT_SIZE = 200
const STEP = 20

const clamp = (n) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, n))

const readStored = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? parseInt(raw, 10) : NaN
  return Number.isFinite(parsed) ? clamp(parsed) : DEFAULT_SIZE
}

// One module-level listener set so every ZoomControl/ZoomableGrid instance
// on screen stays in sync when the value changes from any of them.
const listeners = new Set()
let current = null

export const useZoomLevel = () => {
  const [size, setSize] = useState(() => {
    if (current === null) current = readStored()
    return current
  })

  useEffect(() => {
    listeners.add(setSize)
    return () => listeners.delete(setSize)
  }, [])

  const setZoom = useCallback((next) => {
    const clamped = clamp(next)
    current = clamped
    localStorage.setItem(STORAGE_KEY, String(clamped))
    listeners.forEach((fn) => fn(clamped))
  }, [])

  return {
    tileSize: size,
    setZoom,
    zoomIn: () => setZoom(size + STEP),
    zoomOut: () => setZoom(size - STEP),
    minSize: MIN_SIZE,
    maxSize: MAX_SIZE,
    step: STEP,
  }
}
