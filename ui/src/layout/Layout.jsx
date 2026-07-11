import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout as RALayout, toggleSidebar } from 'react-admin'
import { makeStyles } from '@material-ui/core/styles'
import { HotKeys } from 'react-hotkeys'
import Menu from './Menu'
import AppBar from './AppBar'
import Notification from './Notification'
import useCurrentTheme from '../themes/useCurrentTheme'
import { useSearchRefocus } from '../common'

const useStyles = makeStyles({
  root: { paddingBottom: (props) => (props.addPadding ? '80px' : 0) },
})

// The app shell keeps focus on a wrapping element (see react-hotkeys'
// <HotKeys> below) rather than on whichever region actually scrolls, so the
// browser's native PageUp/PageDown/Home/End scrolling never finds a target
// and silently does nothing. Drive it manually: find the largest scrollable
// region on screen and scroll that directly.
const isTypingTarget = (el) =>
  !!el &&
  (el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable)

const findScrollTarget = () => {
  const { scrollingElement } = document
  if (scrollingElement && scrollingElement.scrollHeight > scrollingElement.clientHeight) {
    return scrollingElement
  }
  let best = null
  let bestArea = 0
  for (const el of document.querySelectorAll('*')) {
    const style = getComputedStyle(el)
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      el.scrollHeight > el.clientHeight + 1
    ) {
      const area = el.clientWidth * el.clientHeight
      if (area > bestArea) {
        bestArea = area
        best = el
      }
    }
  }
  return best
}

const useScrollKeys = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isTypingTarget(document.activeElement)) return
      if (!['PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return
      const target = findScrollTarget()
      if (!target) return
      e.preventDefault()
      const page = target.clientHeight * 0.9
      if (e.key === 'PageDown') target.scrollBy({ top: page, behavior: 'smooth' })
      else if (e.key === 'PageUp') target.scrollBy({ top: -page, behavior: 'smooth' })
      else if (e.key === 'Home') target.scrollTo({ top: 0, behavior: 'smooth' })
      else if (e.key === 'End')
        target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

const Layout = (props) => {
  const theme = useCurrentTheme()
  const queue = useSelector((state) => state.player?.queue)
  const classes = useStyles({ addPadding: queue.length > 0 })
  const dispatch = useDispatch()
  useSearchRefocus()
  useScrollKeys()

  const keyHandlers = {
    TOGGLE_MENU: useCallback(() => dispatch(toggleSidebar()), [dispatch]),
  }

  return (
    <HotKeys handlers={keyHandlers}>
      <RALayout
        {...props}
        className={classes.root}
        menu={Menu}
        appBar={AppBar}
        theme={theme}
        notification={Notification}
      />
    </HotKeys>
  )
}

export default Layout
