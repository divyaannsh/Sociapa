'use client'

import { useRouter as useNextRouter } from 'next/navigation'
import { usePageTransition } from '../contexts/PageTransitionContext'

export function useLoadingRouter() {
  const router = useNextRouter()
  const { setLoading } = usePageTransition()

  return {
    ...router,
    push: (href, options) => {
      setLoading(true)
      return router.push(href, options)
    },
    replace: (href, options) => {
      setLoading(true)
      return router.replace(href, options)
    },
  }
}

