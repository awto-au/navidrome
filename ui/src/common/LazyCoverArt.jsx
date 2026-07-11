import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import subsonic from '../subsonic'
import { useImageUrl } from './useImageUrl'
import { useZoomLevel } from './useZoomLevel'

const useStyles = makeStyles({
  container: {
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
  },
  img: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out',
  },
  loading: {
    opacity: 0,
  },
})

// Cover art for any record type getCoverArtUrl supports (album, artist,
// song/media-file, playlist, radio) that only fetches once the tile
// scrolls into (or near) the viewport - shared by every grid view so a
// large page/collection doesn't eagerly fetch every image at once.
// Extracted from what was AlbumGridView's Cover component so
// Artists/Songs grids get the same behavior instead of a reimplementation.
export const LazyCoverArt = ({ record, alt, size, className }) => {
  const classes = useStyles()
  const [isVisible, setIsVisible] = useState(false)
  const elRef = useRef(null)

  useEffect(() => {
    if (!elRef.current || isVisible) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '800px' },
    )
    observer.observe(elRef.current)
    return () => observer.disconnect()
  }, [isVisible])

  // Request a size matching how big the tile is actually rendered, instead
  // of always asking for a fixed size regardless of zoom level - at the
  // smallest zoom this cuts payload size substantially. Deliberately not
  // multiplied by devicePixelRatio (thumbnail browsing doesn't need
  // retina-sharp art, and it roughly doubled every request on high-DPI
  // screens) and rounded DOWN to the nearest 50px rather than up, so the
  // request is never bigger than what's actually needed.
  const { tileSize } = useZoomLevel()
  const requestSize = size || Math.max(50, Math.floor(tileSize / 50) * 50)
  const url = subsonic.getCoverArtUrl(record, requestSize, true)
  const { imgUrl, loading } = useImageUrl(isVisible ? url : null)

  return (
    <div ref={elRef} className={`${classes.container} ${className || ''}`}>
      <img
        src={imgUrl || undefined}
        alt={alt || record.name}
        className={`${classes.img} ${loading || !isVisible ? classes.loading : ''}`}
      />
    </div>
  )
}
