import React from 'react'
import { Button, useTranslate } from 'react-admin'
import { ButtonGroup, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline'
import ViewModuleIcon from '@material-ui/icons/ViewModule'
import { useDispatch, useSelector } from 'react-redux'
import { viewModeGrid, viewModeTable } from '../actions'

const useStyles = makeStyles({
  title: { margin: '1rem' },
  buttonGroup: { width: '100%', justifyContent: 'center' },
  leftButton: { paddingRight: '0.5rem' },
  rightButton: { paddingLeft: '0.5rem' },
})

// Grid/table toggle for any resource (Artists, Songs, ...) via the generic
// viewMode reducer - one implementation instead of a bespoke toggler per
// resource (Albums keeps its own pre-existing AlbumViewToggler/albumView
// pair since migrating it carries more risk than it's worth right now).
export const ViewModeToggler = React.forwardRef(
  ({ resource, showTitle = true, defaultGrid = true }, ref) => {
    const dispatch = useDispatch()
    const isGrid = useSelector(
      (state) => state.viewMode?.[resource]?.grid ?? defaultGrid,
    )
    const classes = useStyles()
    const translate = useTranslate()
    return (
      <div ref={ref}>
        {showTitle && (
          <Typography className={classes.title}>
            {translate('ra.toggleFieldsMenu.layout')}
          </Typography>
        )}
        <ButtonGroup
          variant="text"
          color="primary"
          aria-label="text primary button group"
          className={classes.buttonGroup}
        >
          <Button
            size="small"
            className={classes.leftButton}
            label={translate('ra.toggleFieldsMenu.grid')}
            color={isGrid ? 'primary' : 'secondary'}
            onClick={() => dispatch(viewModeGrid(resource))}
          >
            <ViewModuleIcon fontSize="inherit" />
          </Button>
          <Button
            size="small"
            className={classes.rightButton}
            label={translate('ra.toggleFieldsMenu.table')}
            color={isGrid ? 'secondary' : 'primary'}
            onClick={() => dispatch(viewModeTable(resource))}
          >
            <ViewHeadlineIcon fontSize="inherit" />
          </Button>
        </ButtonGroup>
      </div>
    )
  },
)

ViewModeToggler.displayName = 'ViewModeToggler'
