import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '../../pages/LoginPage'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ toast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { useAuth } from '../../context/AuthContext'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderLoginPage = () => {
  const mockLogin = vi.fn()
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    login: mockLogin,
    logout: vi.fn(),
    refreshUser: vi.fn(),
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { mockLogin }
}

describe('LoginPage', () => {
  beforeEach(() => { queryClient.clear() })

  it('renders email and password fields', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    renderLoginPage()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.queryAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('calls login with entered values', async () => {
    const { mockLogin } = renderLoginPage()
    mockLogin.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email address/i), 'admin@miva.university')
    await user.type(screen.getByLabelText(/^password$/i), 'Admin@123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@miva.university', 'Admin@123')
    })
  })

  it('displays server error message', async () => {
    const { mockLogin } = renderLoginPage()
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid email or password' } },
    })
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email address/i), 'wrong@miva.university')
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPass@1')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password')
    })
  })
})
