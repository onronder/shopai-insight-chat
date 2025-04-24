// File: src/components/ui/use-sidebar-hook.tsx

import * as React from "react"
import { SidebarContext, SidebarContextType } from "./sidebar-context"

// Export the hook from a separate file to avoid Fast Refresh warnings
export function useSidebar(): SidebarContextType {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}