export interface NavItem {
  label: string
  path: string
  icon: string
}

export const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: 'Home' },
  { label: 'Connections', path: '/connections', icon: 'Plug' },
  { label: 'Corporates', path: '/corporates', icon: 'Building2' },
  { label: 'Integrations', path: '/integrations', icon: 'Boxes' },
  { label: 'Data Model', path: '/data-model', icon: 'Database' },
  { label: 'Webhooks', path: '/webhooks', icon: 'Webhook' },
  { label: 'Sync Logs', path: '/sync-logs', icon: 'ScrollText' },
  { label: 'Audit Logs', path: '/audit-logs', icon: 'ShieldCheck' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
]
