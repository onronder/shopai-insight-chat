// File: src/components/ui/sidebar-context.tsx

import * as React from "react"

export type SidebarState = "expanded" | "collapsed"

export interface SidebarContextType {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

// Create and export the context
export const SidebarContext = React.createContext<SidebarContextType | null>(null)