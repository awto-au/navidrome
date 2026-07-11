import React from 'react'
import { IconButton, Slider, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import { useTranslate } from 'react-admin'
import { useZoomLevel } from './useZoomLevel'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '160px',
  },
  slider: {
    margin: '0 4px',
  },
})

// Shared tile-size control for every grid view (Albums/Artists/Songs/...).
// Deliberately one implementation, not copy-pasted per page - the tile
// size it sets (useZoomLevel) is global, so this can be dropped into any
// page's toolbar and they all stay in sync.
export const ZoomControl = () => {
  const classes = useStyles()
  const translate = useTranslate()
  const { tileSize, setZoom, zoomIn, zoomOut, minSize, maxSize, step } =
    useZoomLevel()

  return (
    <div className={classes.root}>
      <Tooltip title={translate('ra.action.zoom_out', { _: 'Zoom out' })}>
        <IconButton size="small" onClick={zoomOut} disabled={tileSize <= minSize}>
          <ZoomOutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Slider
        className={classes.slider}
        value={tileSize}
        min={minSize}
        max={maxSize}
        step={step}
        onChange={(_, value) => setZoom(value)}
        aria-label={translate('ra.action.zoom', { _: 'Zoom' })}
      />
      <Tooltip title={translate('ra.action.zoom_in', { _: 'Zoom in' })}>
        <IconButton size="small" onClick={zoomIn} disabled={tileSize >= maxSize}>
          <ZoomInIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  )
}
