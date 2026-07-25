import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { RequestStatus } from '../../types'

const statuses: { status: RequestStatus; label: string }[] = [
  { status: 'SUBMITTED', label: 'Submitted' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'ON_HOLD', label: 'On Hold' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'CLOSED', label: 'Closed' },
  { status: 'REJECTED', label: 'Rejected' },
  { status: 'CANCELLED', label: 'Cancelled' },
]

describe('StatusBadge', () => {
  statuses.forEach(({ status, label }) => {
    it(`renders correct label for ${status}`, () => {
      render(<StatusBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders visually distinct badges for different statuses', () => {
    const { container: c1 } = render(<StatusBadge status="SUBMITTED" />)
    const { container: c2 } = render(<StatusBadge status="CLOSED" />)
    const el1 = c1.firstChild as HTMLElement
    const el2 = c2.firstChild as HTMLElement
    expect(el1?.className).not.toBe(el2?.className)
  })
})
