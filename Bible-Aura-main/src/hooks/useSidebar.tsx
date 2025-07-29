import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggle = () => setIsExpanded(!isExpanded);
  const expand = () => setIsExpanded(true);
  const collapse = () => setIsExpanded(false);

  return (
    <SidebarContext.Provider value={{ isExpanded, toggle, expand, collapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 