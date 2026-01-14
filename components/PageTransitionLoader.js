'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { usePageTransition } from '../contexts/PageTransitionContext'

export default function PageTransitionLoader() {
  const pathname = usePathname()
  const { isLoading, setLoading } = usePageTransition()
  const prevPathnameRef = useRef(pathname)
  const isInitialMount = useRef(true)
  const timeoutRef = useRef(null)

  // Intercept all Link clicks globally
  useEffect(() => {
    const handleLinkClick = (e) => {
      // Find the closest anchor tag or element with href (Next.js Link renders as <a>)
      let element = e.target
      let anchor = null
      let href = null

      // Traverse up the DOM tree to find an anchor or Link element
      while (element && element !== document.body) {
        if (element.tagName === 'A' && element.hasAttribute('href')) {
          anchor = element
          href = element.getAttribute('href')
          break
        }
        // Check if it's a Next.js Link component (might have data attributes)
        if (element.hasAttribute && element.hasAttribute('href')) {
          href = element.getAttribute('href')
          anchor = element
          break
        }
        element = element.parentElement
      }

      if (!anchor || !href) return

      // Skip if it's an external link, anchor link, or special protocol
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        href.startsWith('javascript:')
      ) {
        return
      }

      // Get current pathname
      const currentPath = window.location.pathname

      // Skip if it's the same page (normalize paths)
      const normalizedHref = href.split('?')[0].split('#')[0]
      const normalizedPath = currentPath.split('?')[0].split('#')[0]
      
      if (normalizedHref === normalizedPath) {
        return
      }

      // Show loader immediately when link is clicked
      setLoading(true)
    }

    // Add click listener to document with capture phase to catch early
    document.addEventListener('click', handleLinkClick, true)

    return () => {
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [pathname, setLoading])

  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevPathnameRef.current = pathname
      return
    }

    // Hide loader when pathname changes (navigation complete)
    if (pathname !== prevPathnameRef.current && isLoading) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Hide loader after page has had time to render
      timeoutRef.current = setTimeout(() => {
        setLoading(false)
      }, 300)
    }

    // Update the previous pathname
    prevPathnameRef.current = pathname

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, isLoading, setLoading])

  if (!isLoading) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(3px)',
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #667eea',
              borderRight: '5px solid #764ba2',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p
            style={{
              color: '#667eea',
              fontSize: '1.1rem',
              fontWeight: '600',
              margin: 0,
              letterSpacing: '0.5px',
            }}
          >
            Loading...
          </p>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}

