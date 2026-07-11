import { VIEW_MODE_GRID, VIEW_MODE_TABLE } from '../actions'

// { artist: { grid: true }, song: { grid: false }, ... } - defaults a
// resource to grid the first time it's toggled, since that's the
// requested default look.
export const viewModeReducer = (previousState = {}, payload) => {
  const { type, resource } = payload
  switch (type) {
    case VIEW_MODE_GRID:
    case VIEW_MODE_TABLE:
      return {
        ...previousState,
        [resource]: { grid: type === VIEW_MODE_GRID },
      }
    default:
      return previousState
  }
}
