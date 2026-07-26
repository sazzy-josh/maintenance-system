import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RegisterPage } from '../../pages/RegisterPage'

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ toast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderRegisterPage = () => {
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => { qc.clear() })

  it('shows password mismatch error', async () => {
    renderRegisterPage()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@miva.university')
    await user.type(screen.getByLabelText(/matric/i), 'MTR2024001')
    await user.type(screen.getByLabelText(/^password \*/i), 'ValidPass@1')
    await user.type(screen.getByLabelText(/^confirm password/i), 'DifferentPass@1')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('shows password strength meter when typing', async () => {
    renderRegisterPage()
    const user = userEvent.setup()
    const passInput = screen.getByLabelText(/^password \*/i)
    await user.type(passInput, 'weak')
    await waitFor(() => {
      expect(screen.queryByText(/weak|fair|good|strong/i)).toBeTruthy()
    })
  })

  it('button is accessible and has correct label', () => {
    renderRegisterPage()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })
})
