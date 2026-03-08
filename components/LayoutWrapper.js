'use client'

import { AuthProvider } from '../contexts/AuthContext'
import HydrationFix from './HydrationFix'

export default function LayoutWrapper({ children }) {
  return (
    <HydrationFix>
      <AuthProvider>
        {children}
      </AuthProvider>
    </HydrationFix>
  )
}
