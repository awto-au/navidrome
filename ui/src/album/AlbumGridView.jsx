import React from 'react'
import { Typography, GridListTileBar, useMediaQuery } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { linkToRecord, useListContext, Loading } from 'react-admin'
import { useDrag } from 'react-dnd'
import {
  AlbumContextMenu,
  PlayButton,
  ArtistLinkField,
  OverflowTooltip,
  LazyCoverArt,
  ZoomableGrid,
} from '../common'
import { DraggableTypes } from '../consts'
import clsx from 'clsx'
import { AlbumDatesField } from './AlbumDatesField.jsx'

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
    tileBarMobile: {
      textAlign: 'left',
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0) 100%)',
    },
    albumName: {
      fontSize: '14px',
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    missingAlbum: {
      opacity: 0.3,
    },
    albumVersion: {
      fontSize: '12px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    albumSubtitle: {
      fontSize: '12px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
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
    albumLink: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
    },
    albumContainer: {},
    albumPlayButton: { color: 'white' },
  }),
  { name: 'NDAlbumGridView' },
)

const AlbumCover = ({ record }) => {
  const [, dragAlbumRef] = useDrag(
    () => ({
      type: DraggableTypes.ALBUM,
      item: { albumIds: [record.id] },
      options: { dropEffect: 'copy' },
    }),
    [record],
  )
  return (
    <div ref={dragAlbumRef}>
      <LazyCoverArt record={record} />
    </div>
  )
}

const AlbumGridTile = ({ showArtist, record, basePath }) => {
  const classes = useStyles()
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), {
    noSsr: true,
  })
  if (!record) {
    return null
  }
  const computedClasses = clsx(
    classes.albumContainer,
    record.missing && classes.missingAlbum,
  )
  return (
    <div className={computedClasses}>
      <Link
        className={classes.link}
        to={linkToRecord(basePath, record.id, 'show')}
      >
        <AlbumCover record={record} />
        <GridListTileBar
          className={isDesktop ? classes.tileBar : classes.tileBarMobile}
          subtitle={
            !record.missing && (
              <PlayButton
                className={classes.albumPlayButton}
                record={record}
                size="small"
              />
            )
          }
          actionIcon={<AlbumContextMenu record={record} color={'white'} />}
        />
      </Link>
      <Link
        className={classes.albumLink}
        to={linkToRecord(basePath, record.id, 'show')}
      >
        <span>
          <OverflowTooltip title={record.name}>
            <Typography className={classes.albumName}>{record.name}</Typography>
          </OverflowTooltip>
          {record.tags && record.tags['albumversion'] && (
            <Typography className={classes.albumVersion}>
              {record.tags['albumversion']}
            </Typography>
          )}
        </span>
      </Link>
      {showArtist ? (
        <ArtistLinkField record={record} className={classes.albumSubtitle} />
      ) : (
        <AlbumDatesField record={record} className={classes.albumSubtitle} />
      )}
    </div>
  )
}

const LoadedAlbumGrid = ({ ids, data, basePath }) => {
  const { filterValues, page, total, loading, setPage } = useListContext()
  const isArtistView = !!(filterValues && filterValues.artist_id)
  return (
    <ZoomableGrid
      ids={ids}
      data={data}
      page={page}
      total={total}
      loading={loading}
      setPage={setPage}
      renderTile={(record, id) => (
        <AlbumGridTile
          record={record}
          basePath={basePath}
          showArtist={!isArtistView}
        />
      )}
    />
  )
}

const AlbumGridView = ({ albumListType, loaded, loading, ...props }) => {
  const hide =
    (loading && albumListType === 'random') || !props.data || !props.ids
  return hide ? <Loading /> : <LoadedAlbumGrid {...props} />
}

export default AlbumGridView
