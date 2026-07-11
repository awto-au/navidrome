// Generic grid/table view-mode toggle, keyed by resource - shared by any
// list that wants a grid alternative (Artists, Songs, ...) instead of a
// bespoke reducer/action pair per resource like the pre-existing
// album-specific albumView. New resources should use this rather than
// copy albumView's pattern.
export const VIEW_MODE_GRID = 'VIEW_MODE_GRID'
export const VIEW_MODE_TABLE = 'VIEW_MODE_TABLE'

export const viewModeGrid = (resource) => ({
  type: VIEW_MODE_GRID,
  resource,
})

export const viewModeTable = (resource) => ({
  type: VIEW_MODE_TABLE,
  resource,
})
