'use client'

import Link from 'next/link'
import { usePageTransition } from '../contexts/PageTransitionContext'

export default function LoadingLink({ href, children, onClick, ...props }) {
  const { setLoading } = usePageTransition()

  const handleClick = (e) => {
    // Only show loader if navigating to a different page
    if (href && typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      if (href !== currentPath) {
        setLoading(true)
      }
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}

