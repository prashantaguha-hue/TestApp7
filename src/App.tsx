import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Connections } from './pages/Connections'
import { Placeholder } from './pages/Placeholder'
import { navItems } from './data/navigation'
import type { PersonaId } from './types/persona'
import { SidebarProvider } from './context/SidebarContext'

function App() {
  const [persona, setPersona] = useState<PersonaId>('new-admin')

  return (
    <SidebarProvider>
      <Routes>
        <Route element={<Layout persona={persona} onPersonaChange={setPersona} />}>
          <Route path="/" element={<Home persona={persona} />} />
          <Route path="/connections" element={<Connections />} />
          {navItems
            .filter((item) => item.path !== '/' && item.path !== '/connections')
            .map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={<Placeholder title={item.label} />}
              />
            ))}
        </Route>
      </Routes>
    </SidebarProvider>
  )
}

export default App
