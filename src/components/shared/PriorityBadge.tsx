import React from 'react'
import { Badge } from '../ui/badge'
import { Priority } from '../../types'

const config: Record<Priority, { label: string; variant: 'gray' | 'info' | 'orange' | 'destructive' }> = {
  LOW: { label: 'Low', variant: 'gray' },
  MEDIUM: { label: 'Medium', variant: 'info' },
  HIGH: { label: 'High', variant: 'orange' },
  CRITICAL: { label: 'Critical', variant: 'destructive' },
}

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const { label, variant } = config[priority] || { label: priority, variant: 'gray' as const }
  return <Badge variant={variant}>{label}</Badge>
}
