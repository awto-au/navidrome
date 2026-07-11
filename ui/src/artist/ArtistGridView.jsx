import React from 'react'
import { Typography, GridListTileBar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { useListContext } from 'react-admin'
import { useDrag } from 'react-dnd'
import {
  ArtistContextMenu,
  OverflowTooltip,
  LazyCoverArt,
  ZoomableGrid,
} from '../common'
import { DraggableTypes } from '../consts'
import clsx from 'clsx'

// Same tile/grid pattern as AlbumGridView, reusing the shared
// ZoomableGrid/LazyCoverArt infrastructure rather than a bespoke
// implementation - "Artists is terrible, needs album style view" request.
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
    name: {
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
    link: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
      '&:hover $tileBar, &:focus-within $tileBar': {
        opacity: 1,
        pointerEvents: 'auto',
      },
    },
    nameLink: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
    },
  }),
  { name: 'NDArtistGridView' },
)

const ArtistCover = ({ record }) => {
  const [, dragRef] = useDrag(
    () => ({
      type: DraggableTypes.ARTIST,
      item: { artistIds: [record.id] },
      options: { dropEffect: 'copy' },
    }),
    [record],
  )
  return (
    <div ref={dragRef}>
      <LazyCoverArt record={record} />
    </div>
  )
}

const ArtistGridTile = ({ record, handleArtistLink }) => {
  const classes = useStyles()
  if (!record) return null
  const to = handleArtistLink(record.id)
  const computedClasses = clsx(record.missing && classes.missing)
  const albumCount = record.albumCount
  return (
    <div className={computedClasses}>
      <Link className={classes.link} to={to}>
        <ArtistCover record={record} />
        <GridListTileBar
          className={classes.tileBar}
          actionIcon={<ArtistContextMenu record={record} color={'white'} />}
        />
      </Link>
      <Link className={classes.nameLink} to={to}>
        <OverflowTooltip title={record.name}>
          <Typography className={classes.name}>{record.name}</Typography>
        </OverflowTooltip>
      </Link>
      {typeof albumCount === 'number' && (
        <Typography className={classes.subtitle}>
          {albumCount} album{albumCount === 1 ? '' : 's'}
        </Typography>
      )}
    </div>
  )
}

const ArtistGridView = ({ ids, data, handleArtistLink }) => {
  const { page, total, loading, setPage } = useListContext()
  return (
    <ZoomableGrid
      ids={ids}
      data={data}
      page={page}
      total={total}
      loading={loading}
      setPage={setPage}
      renderTile={(record) => (
        <ArtistGridTile record={record} handleArtistLink={handleArtistLink} />
      )}
    />
  )
}

export default ArtistGridView
