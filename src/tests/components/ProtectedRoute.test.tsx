import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../../routes/ProtectedRoute'

// We need to mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { useAuth } from '../../context/AuthContext'

const renderWithRouter = (
  initialPath: string,
  mockUser: { role: string } | null,
  allowedRoles?: string[]
) => {
  vi.mocked(useAuth).mockReturnValue({
    user: mockUser as any,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        <Route element={<ProtectedRoute allowedRoles={allowedRoles as any} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /login', () => {
    renderWithRouter('/protected', null)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders content for authenticated user with correct role', () => {
    renderWithRouter('/protected', { role: 'ADMIN' }, ['ADMIN'])
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects user with wrong role to /unauthorized', () => {
    renderWithRouter('/protected', { role: 'REQUESTER' }, ['ADMIN'])
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
  })

  it('renders content when no allowedRoles restriction', () => {
    renderWithRouter('/protected', { role: 'OFFICER' })
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
