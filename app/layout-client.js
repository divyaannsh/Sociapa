'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransitionProvider } from '../contexts/PageTransitionContext'
import PageTransitionLoader from '../components/PageTransitionLoader'

export default function LayoutClient({ children }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Handle loading states for navigation
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    router.events?.on('routeChangeStart', handleStart)
    router.events?.on('routeChangeComplete', handleComplete)
    router.events?.on('routeChangeError', handleComplete)

    return () => {
      router.events?.off('routeChangeStart', handleStart)
      router.events?.off('routeChangeComplete', handleComplete)
      router.events?.off('routeChangeError', handleComplete)
    }
  }, [router])

  useEffect(() => {
    // Set sidebar to closed (minimenu) by default
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Mark client-portal pages so our CSS can strip the header-offset padding
      if (pathname?.startsWith('/client-portal')) {
        document.documentElement.classList.add('client-portal-page')
        document.documentElement.classList.remove('minimenu')
      } else {
        document.documentElement.classList.remove('client-portal-page')
        document.documentElement.classList.add('minimenu')
        // Hide full logo and show abbreviated logo
        const logoFull = document.querySelector('.logo-full')
        const logoAbbr = document.querySelector('.logo-abbr')
        if (logoFull) logoFull.style.display = 'none'
        if (logoAbbr) logoAbbr.style.display = 'block'
      }
    }

    // Wait for DOM to be ready and scripts to load
    const initTheme = () => {
      // Initialize Bootstrap components
      if (typeof window !== 'undefined' && window.bootstrap) {
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
          new window.bootstrap.Tooltip(tooltipTriggerEl)
        })

        // Initialize popovers
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
        popoverTriggerList.forEach(function (popoverTriggerEl) {
          new window.bootstrap.Popover(popoverTriggerEl)
        })

        // Initialize dropdowns
        const dropdownElementList = document.querySelectorAll('[data-bs-toggle="dropdown"]')
        dropdownElementList.forEach(function (dropdownToggleEl) {
          new window.bootstrap.Dropdown(dropdownToggleEl)
        })
      }

      // Trigger common init if available
      if (typeof window !== 'undefined' && window.commonInit) {
        window.commonInit()
      }

      // Ensure sidebar stays closed after scripts load (skip on client-portal)
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        if (!pathname?.startsWith('/client-portal')) {
          document.documentElement.classList.add('minimenu')
          const logoFull = document.querySelector('.logo-full')
          const logoAbbr = document.querySelector('.logo-abbr')
          if (logoFull) logoFull.style.display = 'none'
          if (logoAbbr) logoAbbr.style.display = 'block'
        }
      }
    }

    // Load page-specific JavaScript
    const loadPageScript = () => {
      const scriptMap = {
        '/': 'dashboard-init.min.js',
        '/analytics': 'analytics-init.min.js',
        '/leads': 'leads-init.min.js',
        '/customers': 'customers-init.min.js',
        '/projects': 'projects-init.min.js',
        '/proposal': 'proposal-init.min.js',
        '/payment': 'payment-init.min.js',
        '/reports/sales': 'reports-sales-init.min.js',
        '/reports/leads': 'reports-leads-init.min.js',
        '/reports/project': 'reports-project-init.min.js',
        '/reports/timesheets': 'reports-tmesheets-init.min.js',
        '/apps/chat': 'apps-chat-init.min.js',
        '/apps/email': 'apps-email-init.min.js',
        '/apps/tasks': 'apps-tasks-init.min.js',
        '/apps/notes': 'apps-notes-init.min.js',
        '/apps/storage': 'apps-storage-init.min.js',
        '/apps/calendar': 'apps-calendar-init.min.js',
        '/settings/general': 'settings-init.min.js',
        '/widgets/charts': 'widgets-charts-init.min.js',
        '/widgets/lists': 'widgets-lists-init.min.js',
        '/widgets/tables': 'widgets-tables-init.min.js',
        '/widgets/statistics': 'widgets-statistics-init.min.js',
        '/widgets/miscellaneous': 'widgets-miscellaneous-init.min.js',
      }

      // Remove existing page-specific scripts
      const existingScripts = document.querySelectorAll('script[data-page-init]')
      existingScripts.forEach(script => {
        script.parentNode.removeChild(script)
      })

      // Load page-specific script if available
      const scriptName = scriptMap[pathname]
      if (scriptName) {
        const script = document.createElement('script')
        script.src = `/assets/js/${scriptName}`
        script.setAttribute('data-page-init', 'true')
        script.onload = () => {
          // Reinitialize after script loads
          setTimeout(initTheme, 100)
        }
        document.body.appendChild(script)
      } else {
        // Still initialize even if no page script
        setTimeout(initTheme, 100)
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadPageScript()
    }, 50)

    return () => {
      clearTimeout(timer)
    }
  }, [pathname])

  return (
    <PageTransitionProvider>
      <PageTransitionLoader />
      {children}
    </PageTransitionProvider>
  )
}

