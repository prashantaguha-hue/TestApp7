import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import type { PersonaId } from '../types/persona'
import { useSidebar } from '../context/SidebarContext'

interface LayoutProps {
  persona: PersonaId
  onPersonaChange: (id: PersonaId) => void
}

export function Layout({ persona, onPersonaChange }: LayoutProps) {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav persona={persona} onPersonaChange={onPersonaChange} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
