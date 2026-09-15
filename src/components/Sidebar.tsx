import { NavLink } from 'react-router-dom'
import { navItems } from '../data/navigation'
import { iconMap } from './icon-map'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`shrink-0 border-r border-slate-200 bg-white flex flex-col transition-[width] duration-200 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-[228px]'
      }`}
    >
      <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-200">
        <div className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm">
          H
        </div>
        {!collapsed && (
          <span className="font-semibold text-slate-900 text-[15px] truncate">
            Hypersync
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={2} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-2 border-t border-slate-200">
        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center gap-2 w-full rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {collapsed ? (
            <iconMap.ChevronRight className="size-[18px]" />
          ) : (
            <>
              <iconMap.ChevronLeft className="size-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
