import React from 'react'
import { Badge } from '../ui/badge'
import { RequestStatus } from '../../types'

const config: Record<RequestStatus, { label: string; variant: 'info' | 'purple' | 'warning' | 'orange' | 'success' | 'gray' | 'destructive' }> = {
  SUBMITTED: { label: 'Submitted', variant: 'info' },
  ASSIGNED: { label: 'Assigned', variant: 'purple' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  ON_HOLD: { label: 'On Hold', variant: 'orange' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'gray' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'gray' },
}

export const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const { label, variant } = config[status] || { label: status, variant: 'gray' as const }
  return <Badge variant={variant}>{label}</Badge>
}
