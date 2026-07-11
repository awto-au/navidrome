import React, { cloneElement } from 'react'
import { sanitizeListRestProps, TopToolbar } from 'react-admin'
import { useMediaQuery } from '@material-ui/core'
import { useSelector } from 'react-redux'
import {
  ShuffleAllButton,
  ToggleFieldsMenu,
  ViewModeToggler,
  ZoomControl,
} from '../common'

export const SongListActions = ({
  currentSort,
  className,
  resource,
  filters,
  displayedFilters,
  filterValues,
  permanentFilter,
  exporter,
  basePath,
  selectedIds,
  onUnselectItems,
  showFilter,
  maxResults,
  total,
  ids,
  ...rest
}) => {
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))
  const isGrid = useSelector((state) => state.viewMode?.song?.grid ?? false)
  return (
    <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
      <ShuffleAllButton filters={filterValues} />
      {filters &&
        cloneElement(filters, {
          resource,
          showFilter,
          displayedFilters,
          filterValues,
          context: 'button',
        })}
      {isGrid && isNotSmall && <ZoomControl />}
      <ViewModeToggler resource="song" showTitle={false} defaultGrid={false} />
      {isNotSmall && !isGrid && <ToggleFieldsMenu resource="song" />}
    </TopToolbar>
  )
}

SongListActions.defaultProps = {
  selectedIds: [],
  onUnselectItems: () => null,
}
