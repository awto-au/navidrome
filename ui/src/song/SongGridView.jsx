import React from 'react'
import { Typography, GridListTileBar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useListContext } from 'react-admin'
import { useDispatch } from 'react-redux'
import {
  OverflowTooltip,
  LazyCoverArt,
  ZoomableGrid,
  SongContextMenu,
  PlayButton,
} from '../common'
import { setTrack } from '../actions'

// Gallery view for Songs, reusing the same shared grid infrastructure as
// Albums/Artists - "Songs view needs album style gallery, zoom and fast
// scroll" request. Clicking a tile plays the track (songs don't have a
// "show" detail page the way albums/artists do), matching the table
// view's row-click behavior.
const useStyles = makeStyles(
  (theme) => ({
    tileBar: {
      transition: 'all 150ms ease-out',
      opacity: 0,
      pointerEvents: 'none',
      textAlign: 'left',
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0) 100%)',
    },
    title: {
      fontSize: '14px',
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    subtitle: {
      fontSize: '12px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    missing: {
      opacity: 0.3,
    },
    clickable: {
      position: 'relative',
      display: 'block',
      cursor: 'pointer',
      '&:hover $tileBar, &:focus-within $tileBar': {
        opacity: 1,
        pointerEvents: 'auto',
      },
    },
  }),
  { name: 'NDSongGridView' },
)

const SongGridTile = ({ record }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  if (!record) return null
  return (
    <div className={record.missing ? classes.missing : undefined}>
      <div
        className={classes.clickable}
        onClick={() => dispatch(setTrack(record))}
        role="button"
        tabIndex={0}
      >
        <LazyCoverArt record={record} />
        <GridListTileBar
          className={classes.tileBar}
          subtitle={
            !record.missing && (
              <PlayButton record={record} size="small" />
            )
          }
          actionIcon={<SongContextMenu record={record} color={'white'} />}
        />
      </div>
      <OverflowTooltip title={record.title}>
        <Typography className={classes.title}>{record.title}</Typography>
      </OverflowTooltip>
      <OverflowTooltip title={record.artist}>
        <Typography className={classes.subtitle}>{record.artist}</Typography>
      </OverflowTooltip>
    </div>
  )
}

const SongGridView = ({ ids, data }) => {
  const { page, total, loading, setPage } = useListContext()
  return (
    <ZoomableGrid
      ids={ids}
      data={data}
      page={page}
      total={total}
      loading={loading}
      setPage={setPage}
      renderTile={(record) => <SongGridTile record={record} />}
    />
  )
}

export default SongGridView
