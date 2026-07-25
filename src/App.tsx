import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { Spinner } from './components/shared/Spinner'

// Public pages (eager-loaded for fast initial paint)
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

// Lazy-loaded pages
const RequesterDashboard = React.lazy(() => import('./pages/requester/RequesterDashboard').then(m => ({ default: m.RequesterDashboard })))
const MyRequestsPage = React.lazy(() => import('./pages/requester/MyRequestsPage').then(m => ({ default: m.MyRequestsPage })))
const NewRequestPage = React.lazy(() => import('./pages/requester/NewRequestPage').then(m => ({ default: m.NewRequestPage })))
const RequestDetailPage = React.lazy(() => import('./pages/requester/RequestDetailPage').then(m => ({ default: m.RequestDetailPage })))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))

const OfficerDashboard = React.lazy(() => import('./pages/officer/OfficerDashboard').then(m => ({ default: m.OfficerDashboard })))
const OfficerJobsPage = React.lazy(() => import('./pages/officer/OfficerJobsPage').then(m => ({ default: m.OfficerJobsPage })))
const OfficerJobDetailPage = React.lazy(() => import('./pages/officer/OfficerJobDetailPage').then(m => ({ default: m.OfficerJobDetailPage })))

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminRequestsPage = React.lazy(() => import('./pages/admin/AdminRequestsPage').then(m => ({ default: m.AdminRequestsPage })))
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
const AdminCategoriesPage = React.lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })))
const AdminReportsPage = React.lazy(() => import('./pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })))
const AdminAuditPage = React.lazy(() => import('./pages/admin/AdminAuditPage').then(m => ({ default: m.AdminAuditPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const RoleRedirect = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
  if (user.role === 'OFFICER') return <Navigate to="/officer" replace />
  return <Navigate to="/dashboard" replace />
}

const Loading = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Spinner size="lg" />
  </div>
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">403 — Unauthorized</h1>
                    <p className="text-gray-500 mb-4">You don&apos;t have permission to view this page.</p>
                    <a href="/" className="text-primary-700 hover:underline text-sm">Go to home</a>
                  </div>
                </div>
              } />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<RoleRedirect />} />
                <Route element={<AppLayout />}>
                  <Route path="/profile" element={<Suspense fallback={<Loading />}><ProfilePage /></Suspense>} />

                  {/* Requester */}
                  <Route element={<ProtectedRoute allowedRoles={['REQUESTER', 'ADMIN']} />}>
                    <Route path="/dashboard" element={<Suspense fallback={<Loading />}><RequesterDashboard /></Suspense>} />
                    <Route path="/requests" element={<Suspense fallback={<Loading />}><MyRequestsPage /></Suspense>} />
                    <Route path="/requests/new" element={<Suspense fallback={<Loading />}><NewRequestPage /></Suspense>} />
                    <Route path="/requests/:id" element={<Suspense fallback={<Loading />}><RequestDetailPage /></Suspense>} />
                  </Route>

                  {/* Officer */}
                  <Route element={<ProtectedRoute allowedRoles={['OFFICER']} />}>
                    <Route path="/officer" element={<Suspense fallback={<Loading />}><OfficerDashboard /></Suspense>} />
                    <Route path="/officer/jobs" element={<Suspense fallback={<Loading />}><OfficerJobsPage /></Suspense>} />
                    <Route path="/officer/jobs/:id" element={<Suspense fallback={<Loading />}><OfficerJobDetailPage /></Suspense>} />
                  </Route>

                  {/* Admin */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<Suspense fallback={<Loading />}><AdminDashboard /></Suspense>} />
                    <Route path="/admin/requests" element={<Suspense fallback={<Loading />}><AdminRequestsPage /></Suspense>} />
                    <Route path="/admin/requests/:id" element={<Suspense fallback={<Loading />}><RequestDetailPage /></Suspense>} />
                    <Route path="/admin/users" element={<Suspense fallback={<Loading />}><AdminUsersPage /></Suspense>} />
                    <Route path="/admin/categories" element={<Suspense fallback={<Loading />}><AdminCategoriesPage /></Suspense>} />
                    <Route path="/admin/reports" element={<Suspense fallback={<Loading />}><AdminReportsPage /></Suspense>} />
                    <Route path="/admin/audit" element={<Suspense fallback={<Loading />}><AdminAuditPage /></Suspense>} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
