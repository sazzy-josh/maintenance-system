import React, { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { Spinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  actorId: string
  actor: { id: string; fullName: string; role: string }
  meta?: Record<string, unknown>
  createdAt: string
  ipAddress?: string
}

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
  ASSIGN: 'bg-orange-100 text-orange-700',
  STATUS_CHANGE: 'bg-yellow-100 text-yellow-700',
}

const getActionColor = (action: string) => {
  for (const key of Object.keys(ACTION_COLOR)) {
    if (action.includes(key)) return ACTION_COLOR[key]
  }
  return 'bg-gray-100 text-gray-600'
}

export const AdminAuditPage = () => {
  const [search, setSearch] = useState('')
  const [entity, setEntity] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { search, entity, page }],
    queryFn: (): Promise<{ data: AuditLog[]; meta: { page: number; limit: number; total: number; totalPages: number } }> => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (search) params.set('search', search)
      if (entity) params.set('entity', entity)
      return api.get(`/audit?${params.toString()}`).then(r => r.data)
    },
    placeholderData: keepPreviousData,
  })

  const logs: AuditLog[] = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
        <p className="text-gray-500 text-sm mt-1">System activity and change history</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by action, entity, actor..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input pl-9"
            />
          </div>
          <select value={entity} onChange={e => { setEntity(e.target.value); setPage(1) }} className="input sm:w-44">
            <option value="">All Entities</option>
            <option value="ServiceRequest">Requests</option>
            <option value="User">Users</option>
            <option value="Category">Categories</option>
            <option value="Assignment">Assignments</option>
            <option value="Comment">Comments</option>
            <option value="Auth">Authentication</option>
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : logs.length === 0 ? (
          <EmptyState title="No audit logs found" description="No activity matches your filters." />
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log: AuditLog) => (
              <div key={log.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`badge flex-shrink-0 mt-0.5 ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{log.actor?.fullName || 'System'}</span>
                        {' '}
                        <span className="text-gray-500">
                          {log.action.toLowerCase().replace(/_/g, ' ')} {log.entity}
                          {log.entityId ? <span className="font-mono text-xs text-gray-400"> #{log.entityId.slice(0, 8)}</span> : ''}
                        </span>
                      </p>
                      {log.meta && Object.keys(log.meta).length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {Object.entries(log.meta).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{log.actor?.role}</span>
                        {log.ipAddress && <span className="text-xs text-gray-400">IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages} — {meta.total} entries</p>
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
