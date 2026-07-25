import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/shared/Spinner'
import { RoleName } from '../types'

interface Props {
  allowedRoles?: RoleName[]
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
