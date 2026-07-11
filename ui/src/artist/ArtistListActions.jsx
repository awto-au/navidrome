import React, { cloneElement } from 'react'
import { sanitizeListRestProps, TopToolbar } from 'react-admin'
import { useMediaQuery } from '@material-ui/core'
import { useSelector } from 'react-redux'
import { ToggleFieldsMenu, ViewModeToggler, ZoomControl } from '../common'

const ArtistListActions = ({
  className,
  filters,
  resource,
  showFilter,
  displayedFilters,
  filterValues,
  ...rest
}) => {
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))
  const isGrid = useSelector((state) => state.viewMode?.artist?.grid ?? true)

  return (
    <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
      {filters &&
        cloneElement(filters, {
          resource,
          showFilter,
          displayedFilters,
          filterValues,
          context: 'button',
        })}
      {isGrid && isNotSmall && <ZoomControl />}
      {isNotSmall && (
        <ViewModeToggler resource="artist" showTitle={false} />
      )}
      {isNotSmall && !isGrid && <ToggleFieldsMenu resource="artist" />}
    </TopToolbar>
  )
}

export default ArtistListActions
