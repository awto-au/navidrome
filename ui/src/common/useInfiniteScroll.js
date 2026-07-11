import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

// Accumulates every fetched page's ids AND records into ever-growing
// collections (instead of react-admin's default of replacing the visible
// set each page), and advances the page automatically as the user nears
// the bottom, so a grid/list scrolls through the whole collection with no
// "Next page" boundary. Shared by every paginated view (Albums, Artists,
// Songs, ...) rather than reimplemented per page.
//
// Must accumulate `data` as well as `ids`: react-admin's `data` dictionary
// only holds the *current* page's records, not a running history. Only
// accumulating `ids` (an earlier version of this hook) meant `data[id]`
// resolved to undefined for every id from an older page - the ids array
// was genuinely growing, but tiles for anything before the latest page
// silently rendered nothing, since renderTile bails out on a missing
// record. That looked exactly like "stuck at one page's worth of items"
// with no error, and page-size increases didn't help because the bug
// wasn't about how fast pages advanced.
//
// Uses react-intersection-observer's useInView instead of a hand-rolled
// IntersectionObserver: a previous version recreated the observer on every
// page/loading change, and since IntersectionObserver reports the current
// intersection state immediately on creation, that caused an instant
// re-fire whenever the sentinel was still visible after a page loaded.
// useInView manages the observer lifecycle correctly and exposes `inView`
// as real React state instead.
export const useInfiniteScroll = (ids, data, rawPage, total, loading, setPage) => {
  // Some list controllers (e.g. Artists, which - unlike Albums - doesn't
  // force default query params into the URL on mount) report `page` as
  // undefined for a render or two before settling on 1. `0 < undefined` is
  // false in JS, so the trigger check below would silently never fire if
  // this weren't normalized first.
  const page = rawPage || 1
  // Same reasoning as `page` above: until the list controller has a real
  // count, treat total as unbounded rather than block on `x < undefined`.
  const knownTotal = typeof total === 'number' ? total : Infinity
  const [accumulated, setAccumulated] = useState(ids)
  const [accumulatedData, setAccumulatedData] = useState(data)
  const triggeredForPage = useRef(0)
  const { ref: sentinelRef, inView } = useInView({ rootMargin: '1000px' })

  useEffect(() => {
    if (loading) return
    if (page === 1) {
      setAccumulated(ids)
      setAccumulatedData(data)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev)
        const fresh = ids.filter((id) => !seen.has(id))
        return fresh.length ? [...prev, ...fresh] : prev
      })
      setAccumulatedData((prev) => ({ ...prev, ...data }))
    }
  }, [ids, data, page, loading])

  useEffect(() => {
    if (
      inView &&
      !loading &&
      accumulated.length < knownTotal &&
      triggeredForPage.current < page
    ) {
      triggeredForPage.current = page
      setPage(page + 1)
    }
  }, [inView, loading, accumulated.length, knownTotal, page, setPage])

  return { accumulated, accumulatedData, sentinelRef }
}
