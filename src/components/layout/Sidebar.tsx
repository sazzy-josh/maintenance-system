import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/utils'
import {
  Home01Icon, ClipboardIcon, AddCircleIcon, UserGroupIcon,
  BarChartIcon, Wrench01Icon, BookOpen01Icon, ShieldKeyIcon,
  Cancel01Icon, Logout02Icon, UserCircleIcon, Task01Icon
} from 'hugeicons-react'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const REQUESTER_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: Home01Icon },
  { to: '/requests', label: 'My Requests', icon: ClipboardIcon },
  { to: '/requests/new', label: 'New Request', icon: AddCircleIcon },
  { to: '/profile', label: 'Profile', icon: UserCircleIcon },
]

const OFFICER_NAV: NavItem[] = [
  { to: '/officer', label: 'Dashboard', icon: Home01Icon },
  { to: '/officer/jobs', label: 'My Jobs', icon: Task01Icon },
  { to: '/profile', label: 'Profile', icon: UserCircleIcon },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: Home01Icon },
  { to: '/admin/requests', label: 'All Requests', icon: ClipboardIcon },
  { to: '/admin/users', label: 'Users', icon: UserGroupIcon },
  { to: '/admin/categories', label: 'Categories', icon: BookOpen01Icon },
  { to: '/admin/reports', label: 'Reports', icon: BarChartIcon },
  { to: '/admin/audit', label: 'Audit Log', icon: ShieldKeyIcon },
]

const ROLE_LABELS: Record<string, string> = {
  REQUESTER: 'Student / Staff',
  OFFICER: 'Maintenance Officer',
  ADMIN: 'Administrator',
}

export const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const navItems =
    user?.role === 'ADMIN' ? ADMIN_NAV : user?.role === 'OFFICER' ? OFFICER_NAV : REQUESTER_NAV
  const initials =
    user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const handleLogout = async () => {
    await logout()
    toast('Signed out successfully', 'success')
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
          'bg-gradient-to-b from-[#312e81] via-[#3730a3] to-[#1e1b4b]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Wrench01Icon size={18} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">MIVA FixIt</div>
              <div className="text-white/40 text-[10px] font-medium uppercase tracking-wider leading-tight">
                {ROLE_LABELS[user?.role || 'REQUESTER']}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <Cancel01Icon size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
          aria-label="Main navigation"
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={['/', '/dashboard', '/officer', '/admin'].includes(to)}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm border border-white/10'
                    : 'text-white/60 hover:bg-white/[0.08] hover:text-white/90'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'h-7 w-7 rounded-lg flex items-center justify-center transition-colors',
                      isActive ? 'bg-white/20' : 'bg-transparent'
                    )}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-white/60'} />
                  </div>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.08] border border-white/10">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.fullName}</div>
              <div className="text-white/40 text-[11px] truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              title="Sign out"
            >
              <Logout02Icon size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
