import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { ServiceRequest } from '../../types'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PriorityBadge } from '../../components/shared/PriorityBadge'
import { Spinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { format } from 'date-fns'

type Tab = 'active' | 'completed' | 'all'

const TABS: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All Jobs' },
]

export const OfficerJobsPage = () => {
  const [tab, setTab] = useState<Tab>('active')

  const { data, isLoading } = useQuery({
    queryKey: ['officer-jobs-all'],
    queryFn: () => api.get('/assignments/my').then(r => r.data.data as ServiceRequest[]),
  })

  const allJobs: ServiceRequest[] = data || []
  const jobs = tab === 'active'
    ? allJobs.filter(j => ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(j.status))
    : tab === 'completed'
    ? allJobs.filter(j => ['COMPLETED', 'CLOSED'].includes(j.status))
    : allJobs

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Jobs</h2>
        <p className="text-gray-500 text-sm mt-1">All your assigned maintenance requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs found" description={`No ${tab} jobs at the moment.`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Reference</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Title</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Category</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Status</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Priority</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Assigned</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {jobs.map((job: ServiceRequest) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-primary-700 font-medium">{job.referenceNo}</td>
                    <td className="table-cell max-w-xs">
                      <div className="text-gray-900 font-medium truncate">{job.title}</div>
                      <div className="text-xs text-gray-400">{job.location}</div>
                    </td>
                    <td className="table-cell text-gray-600">{job.category?.name}</td>
                    <td className="table-cell"><StatusBadge status={job.status} /></td>
                    <td className="table-cell"><PriorityBadge priority={job.priority} /></td>
                    <td className="table-cell text-gray-500 whitespace-nowrap text-xs">
                      {job.assignments?.[0]?.assignedAt ? format(new Date(job.assignments[0].assignedAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="table-cell">
                      <Link to={`/officer/jobs/${job.id}`} className="btn-secondary btn btn-sm text-xs">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
