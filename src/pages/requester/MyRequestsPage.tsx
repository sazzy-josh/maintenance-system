import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { ServiceRequest } from '../../types'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PriorityBadge } from '../../components/shared/PriorityBadge'
import { Spinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { AddCircleIcon, Search01Icon, ArrowLeft01Icon, ArrowRight01Icon, FilterIcon } from 'hugeicons-react'
import { format } from 'date-fns'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const MyRequestsPage = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['my-requests', { search, status, page, limit }],
    queryFn: (): Promise<{ data: ServiceRequest[]; meta: { page: number; limit: number; total: number; totalPages: number } }> => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      return api.get(`/requests?${params.toString()}`).then(r => r.data)
    },
    placeholderData: keepPreviousData,
  })

  const requests: ServiceRequest[] = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {meta?.total != null ? `${meta.total} total request${meta.total !== 1 ? 's' : ''}` : 'Your maintenance requests'}
          </p>
        </div>
        <Button asChild>
          <Link to="/requests/new">
            <AddCircleIcon size={18} />
            New Request
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search01Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, location, reference…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <div className="relative sm:w-48">
              <FilterIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <select
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1) }}
                className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-10"><Spinner /></div>
          ) : requests.length === 0 ? (
            <EmptyState
              title="No requests found"
              description={search || status ? 'Try adjusting your filters.' : 'Submit your first maintenance request.'}
              action={!search && !status ? (
                <Button asChild size="sm">
                  <Link to="/requests/new">Create Request</Link>
                </Button>
              ) : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 bg-white">
                  {requests.map((req: ServiceRequest) => (
                    <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/requests/${req.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                          {req.referenceNo}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/requests/${req.id}`} className="text-sm font-medium text-foreground hover:text-primary block truncate max-w-[240px]">
                          {req.title}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[240px]">{req.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{req.category?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><PriorityBadge priority={req.priority} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(req.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} &mdash; {meta.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ArrowLeft01Icon size={15} /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                >
                  Next <ArrowRight01Icon size={15} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
