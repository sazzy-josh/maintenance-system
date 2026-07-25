import React, { useState, useRef, useEffect } from 'react'
import {
  Menu01Icon, Notification01Icon, Logout02Icon, UserCircleIcon
} from 'hugeicons-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { Notification } from '../../types'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'

export const TopBar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const initials =
    user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () =>
      api.get('/notifications/unread-count').then(r => r.data.data.count as number),
    refetchInterval: 30000,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      api.get('/notifications?limit=10').then(r => r.data.data as Notification[]),
    enabled: notifOpen,
  })

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-count'] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast('Signed out successfully', 'success')
    navigate('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-border/60 flex items-center px-4 gap-3 flex-shrink-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Open navigation"
      >
        <Menu01Icon size={18} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Notification01Icon size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-border/60 z-50 overflow-hidden animate-fade-in"
              role="dialog"
              aria-label="Notifications"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <span className="font-semibold text-sm text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length ? (
                  notifications.map(n => (
                    <Link
                      key={n.id}
                      to={n.link || '#'}
                      onClick={() => {
                        setNotifOpen(false)
                        api.patch(`/notifications/${n.id}/read`)
                        qc.invalidateQueries({ queryKey: ['notifications-count'] })
                      }}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0',
                        !n.isRead && 'bg-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full mt-1.5 flex-shrink-0',
                          n.isRead ? 'bg-transparent' : 'bg-primary'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <Notification01Icon size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                    You're all caught up!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(o => !o)}
            className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-full border border-border/60 hover:bg-muted/60 transition-colors"
            aria-label="User menu"
            aria-expanded={userOpen}
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block max-w-[100px] truncate">
              {user?.fullName?.split(' ')[0]}
            </span>
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-border/60 z-50 py-1 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-border/50">
                <p className="text-sm font-semibold text-foreground">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                <UserCircleIcon size={15} className="text-muted-foreground" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full text-left"
              >
                <Logout02Icon size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
