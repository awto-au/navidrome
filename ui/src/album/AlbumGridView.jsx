import React, { useEffect, useRef, useState } from 'react'
import {
  GridList,
  GridListTile,
  Typography,
  GridListTileBar,
  useMediaQuery,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'
import { Link } from 'react-router-dom'
import { linkToRecord, useListContext, Loading } from 'react-admin'
import { withContentRect } from 'react-measure'
import { useDrag } from 'react-dnd'
import subsonic from '../subsonic'
import {
  AlbumContextMenu,
  PlayButton,
  ArtistLinkField,
  OverflowTooltip,
  useImageUrl,
} from '../common'
import config from '../config'
import { DraggableTypes } from '../consts'
import clsx from 'clsx'
import { AlbumDatesField } from './AlbumDatesField.jsx'

const useStyles = makeStyles(
  (theme) => ({
    root: {
      margin: '20px',
      display: 'grid',
    },
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
    albumArtistName: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'left',
      fontSize: '1em',
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

const useCoverStyles = makeStyles({
  coverContainer: {
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
  },
  cover: {
    display: 'inline-block',
    width: '100%',
    objectFit: 'contain',
    height: (props) => props.height,
    transition: 'opacity 0.3s ease-in-out',
  },
  coverLoading: {
    opacity: 0,
  },
})

const getColsForWidth = (width) => {
  if (width === 'xs') return 2
  if (width === 'sm') return 3
  if (width === 'md') return 4
  if (width === 'lg') return 6
  return 9
}

const Cover = withContentRect('bounds')(({
  record,
  measureRef,
  contentRect,
}) => {
  // Force height to be the same as the width determined by the GridList
  // noinspection JSSuspiciousNameCombination
  const classes = useCoverStyles({ height: contentRect.bounds.width })
  const [, dragAlbumRef] = useDrag(
    () => ({
      type: DraggableTypes.ALBUM,
      item: { albumIds: [record.id] },
      options: { dropEffect: 'copy' },
    }),
    [record],
  )

  // Only fetch cover art once the tile scrolls into (or near) the viewport,
  // so a large page size doesn't eagerly fetch every album's art at once.
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
  const setRefs = (node) => {
    elRef.current = node
    measureRef(node)
  }

  const url = subsonic.getCoverArtUrl(record, config.uiCoverArtSize, true)
  const { imgUrl, loading: imageLoading } = useImageUrl(isVisible ? url : null)

  return (
    <div ref={setRefs} className={classes.coverContainer}>
      <div ref={dragAlbumRef}>
        <img
          src={imgUrl || undefined}
          alt={record.name}
          className={`${classes.cover} ${imageLoading || !isVisible ? classes.coverLoading : ''}`}
        />
      </div>
    </div>
  )
})

const AlbumGridTile = ({ showArtist, record, basePath, ...props }) => {
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
        <Cover record={record} />
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

// Accumulates every fetched page's ids into one continuously growing list
// (instead of react-admin's default of replacing the visible set each page),
// and advances the page automatically as the user nears the bottom, so the
// grid scrolls through the whole library with no "Next page" boundary.
const useInfiniteScroll = (ids, page, total, loading, setPage) => {
  const [accumulated, setAccumulated] = useState(ids)
  const sentinelRef = useRef(null)
  const triggeredForPage = useRef(0)

  useEffect(() => {
    if (loading) return
    if (page === 1) {
      setAccumulated(ids)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev)
        const fresh = ids.filter((id) => !seen.has(id))
        return fresh.length ? [...prev, ...fresh] : prev
      })
    }
  }, [ids, page, loading])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !loading &&
          accumulated.length < total &&
          triggeredForPage.current < page
        ) {
          triggeredForPage.current = page
          setPage(page + 1)
        }
      },
      { rootMargin: '1000px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading, accumulated.length, total, page, setPage])

  return { accumulated, sentinelRef }
}

const LoadedAlbumGrid = ({ ids, data, basePath, width }) => {
  const classes = useStyles()
  const { filterValues, page, total, loading, setPage } = useListContext()
  const isArtistView = !!(filterValues && filterValues.artist_id)
  const { accumulated, sentinelRef } = useInfiniteScroll(
    ids,
    page,
    total,
    loading,
    setPage,
  )
  return (
    <div className={classes.root}>
      <GridList
        component={'div'}
        cellHeight={'auto'}
        cols={getColsForWidth(width)}
        spacing={20}
      >
        {accumulated.map((id) => (
          <GridListTile className={classes.gridListTile} key={id}>
            <AlbumGridTile
              record={data[id]}
              basePath={basePath}
              showArtist={!isArtistView}
            />
          </GridListTile>
        ))}
      </GridList>
      {accumulated.length < total && (
        <div ref={sentinelRef} style={{ height: 1 }} />
      )}
    </div>
  )
}

const AlbumGridView = ({ albumListType, loaded, loading, ...props }) => {
  const hide =
    (loading && albumListType === 'random') || !props.data || !props.ids
  return hide ? <Loading /> : <LoadedAlbumGrid {...props} />
}

const AlbumGridViewWithWidth = withWidth()(AlbumGridView)

export default AlbumGridViewWithWidth
