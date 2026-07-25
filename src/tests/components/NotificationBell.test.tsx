import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', fullName: 'Test', role: 'REQUESTER', email: 'test@test.com' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  })),
}))

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

import { TopBar } from '../../components/layout/TopBar'

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderTopBar = () =>
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <TopBar onMenuClick={vi.fn()} />
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('NotificationBell', () => {
  it('renders notification bell button', () => {
    renderTopBar()
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument()
  })

  it('shows unread count badge', async () => {
    renderTopBar()
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('opens dropdown on click', async () => {
    renderTopBar()
    fireEvent.click(screen.getByLabelText(/notifications/i))
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument()
    })
  })

  it('shows mark all read button when open', async () => {
    renderTopBar()
    fireEvent.click(screen.getByLabelText(/notifications/i))
    await waitFor(() => {
      expect(screen.getByText(/mark all read/i)).toBeInTheDocument()
    })
  })
})
