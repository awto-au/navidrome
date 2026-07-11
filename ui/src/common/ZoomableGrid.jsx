import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useInfiniteScroll } from './useInfiniteScroll'
import { useZoomLevel } from './useZoomLevel'

const useStyles = makeStyles({
  root: {
    margin: '20px',
    display: 'grid',
    // auto-fill + minmax means the browser recomputes column count itself
    // as the tile size (zoom) or viewport width changes - no JS breakpoint
    // tracking needed, unlike the old per-page getColsForWidth approach.
    gridTemplateColumns: (props) =>
      `repeat(auto-fill, minmax(${props.tileSize}px, 1fr))`,
    gap: '20px',
  },
})

// Generic infinite-scrolling tile grid, shared by every grid view
// (Albums/Artists/Songs/...) so the scroll/pagination/zoom behavior is one
// implementation instead of copy-pasted per page. Callers only supply how
// to render one tile's content via renderTile.
export const ZoomableGrid = ({ ids, data, page, total, loading, setPage, renderTile }) => {
  const { tileSize } = useZoomLevel()
  const classes = useStyles({ tileSize })
  // `total` can be undefined for a render or two before the list
  // controller settles (seen on Artists, which doesn't force default query
  // params into the URL like Albums does) - `x < undefined` is always
  // false, which would keep the sentinel from ever rendering at all,
  // silently disabling infinite scroll from the start.
  const knownTotal = typeof total === 'number' ? total : Infinity
  const { accumulated, accumulatedData, sentinelRef } = useInfiniteScroll(
    ids,
    data,
    page,
    knownTotal,
    loading,
    setPage,
  )

  return (
    <div>
      <div className={classes.root}>
        {accumulated.map((id) => (
          <div key={id}>{renderTile(accumulatedData[id], id)}</div>
        ))}
      </div>
      {accumulated.length < knownTotal && (
        <div ref={sentinelRef} style={{ height: 1 }} />
      )}
    </div>
  )
}
