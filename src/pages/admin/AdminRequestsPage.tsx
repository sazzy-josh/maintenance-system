import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { ServiceRequest, User } from '../../types'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PriorityBadge } from '../../components/shared/PriorityBadge'
import { Spinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { useToast } from '../../context/ToastContext'
import { Search, ChevronLeft, ChevronRight, X, UserCheck } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_OPTIONS = [
  '', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED',
]
const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

interface AssignModalProps {
  request: ServiceRequest
  onClose: () => void
}

const AssignModal = ({ request, onClose }: AssignModalProps) => {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [note, setNote] = useState('')

  const { data: officers } = useQuery({
    queryKey: ['officers'],
    queryFn: () => api.get('/users?role=OFFICER&isActive=true&limit=100').then(r => r.data.data as User[]),
  })

  const assign = useMutation({
    mutationFn: () => api.post('/assignments', { requestId: request.id, officerId: selectedOfficer, note }),
    onSuccess: () => {
      toast('Request assigned successfully', 'success')
      qc.invalidateQueries({ queryKey: ['admin-requests'] })
      onClose()
    },
    onError: () => toast('Failed to assign request', 'error'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Assign Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-500">
          Assigning: <span className="font-medium text-gray-900">{request.referenceNo} — {request.title}</span>
        </p>
        <div>
          <label className="label">Select Officer *</label>
          <select value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)} className="input">
            <option value="">Choose an officer...</option>
            {officers?.map(o => (
              <option key={o.id} value={o.id}>
                {o.fullName}{o.specialization ? ` (${o.specialization})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Assignment Note (optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="input resize-none" placeholder="Any special instructions..." />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary btn">Cancel</button>
          <button onClick={() => assign.mutate()} disabled={!selectedOfficer || assign.isPending} className="btn-primary btn">
            {assign.isPending ? <Spinner size="sm" /> : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const AdminRequestsPage = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)
  const [assignTarget, setAssignTarget] = useState<ServiceRequest | null>(null)
  const limit = 15

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', { search, status, priority, page }],
    queryFn: (): Promise<{ data: ServiceRequest[]; meta: { page: number; limit: number; total: number; totalPages: number } }> => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (priority) params.set('priority', priority)
      return api.get(`/requests?${params.toString()}`).then(r => r.data)
    },
    placeholderData: keepPreviousData,
  })

  const requests: ServiceRequest[] = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      {assignTarget && <AssignModal request={assignTarget} onClose={() => setAssignTarget(null)} />}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">All Requests</h2>
        <p className="text-gray-500 text-sm mt-1">{meta?.total ?? 0} total requests</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by title, reference, location..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input pl-9"
            />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input sm:w-44">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <select value={priority} onChange={e => { setPriority(e.target.value); setPage(1) }} className="input sm:w-40">
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : requests.length === 0 ? (
          <EmptyState title="No requests found" description="Try adjusting your search filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Reference</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Title</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Requester</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Category</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Status</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Priority</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Date</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {requests.map((req: ServiceRequest) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <Link to={`/admin/requests/${req.id}`} className="text-primary-700 hover:underline font-mono text-xs font-medium">
                        {req.referenceNo}
                      </Link>
                    </td>
                    <td className="table-cell max-w-xs">
                      <Link to={`/admin/requests/${req.id}`} className="text-gray-900 hover:text-primary-700 font-medium block truncate">
                        {req.title}
                      </Link>
                      <div className="text-xs text-gray-400 truncate">{req.location}</div>
                    </td>
                    <td className="table-cell">
                      <div className="text-gray-900 text-xs font-medium">{req.requester?.fullName}</div>
                      <div className="text-xs text-gray-400">{req.requester?.department}</div>
                    </td>
                    <td className="table-cell text-gray-600 text-xs">{req.category?.name}</td>
                    <td className="table-cell"><StatusBadge status={req.status} /></td>
                    <td className="table-cell"><PriorityBadge priority={req.priority} /></td>
                    <td className="table-cell text-gray-500 text-xs whitespace-nowrap">{format(new Date(req.createdAt), 'MMM d, yyyy')}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <Link to={`/admin/requests/${req.id}`} className="btn-secondary btn btn-sm text-xs">View</Link>
                        {['SUBMITTED', 'ASSIGNED'].includes(req.status) && (
                          <button onClick={() => setAssignTarget(req)} className="btn btn-sm text-xs bg-purple-100 text-purple-700 hover:bg-purple-200">
                            <UserCheck size={12} /> Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages} — {meta.total} results</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn btn-sm">
                <ChevronLeft size={16} /> Prev
              </button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn-secondary btn btn-sm">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
