'use client'

import { createContext, useContext, useState } from 'react'

const PageTransitionContext = createContext({
  isLoading: false,
  setLoading: () => {},
})

export function PageTransitionProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)

  const setLoading = (loading) => {
    setIsLoading(loading)
  }

  return (
    <PageTransitionContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </PageTransitionContext.Provider>
  )
}

export function usePageTransition() {
  return useContext(PageTransitionContext)
}

