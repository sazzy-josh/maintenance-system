import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { useAuth } from '../../context/AuthContext'
import { ServiceRequest } from '../../types'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PriorityBadge } from '../../components/shared/PriorityBadge'
import { Spinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Briefcase01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  ArrowRight01Icon,
} from 'hugeicons-react'
import { format, isPast } from 'date-fns'

const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
}

const StatCard = ({ label, value, icon: Icon, gradient }: StatCardProps) => (
  <Card className="border-0 shadow-card">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export const OfficerDashboard = () => {
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] ?? 'Officer'

  const { data, isLoading } = useQuery({
    queryKey: ['officer-jobs'],
    queryFn: () => api.get('/assignments/my').then(r => r.data),
  })

  const jobs: ServiceRequest[] = data?.data || []

  const active = jobs.filter((j: ServiceRequest) => ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(j.status))
  const completed = jobs.filter((j: ServiceRequest) => ['COMPLETED', 'CLOSED'].includes(j.status))
  const overdue = active.filter((j: ServiceRequest) => j.dueAt && isPast(new Date(j.dueAt)))
  const sortedActive = [...active].sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good day, {firstName} 👷</h1>
        <p className="text-muted-foreground text-sm mt-1">Your assigned maintenance jobs — sorted by priority.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Jobs"
          value={active.length}
          icon={Briefcase01Icon}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          label="In Progress"
          value={active.filter(j => j.status === 'IN_PROGRESS').length}
          icon={Clock01Icon}
          gradient="bg-gradient-to-br from-amber-400 to-amber-500"
        />
        <StatCard
          label="Overdue"
          value={overdue.length}
          icon={Alert01Icon}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
        />
        <StatCard
          label="Completed"
          value={completed.length}
          icon={CheckmarkCircle01Icon}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Active Jobs Table */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-0 flex flex-row items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <CardTitle className="text-base font-semibold">Active Jobs</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Sorted by priority — critical first</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary gap-1">
            <Link to="/officer/jobs">
              View all <ArrowRight01Icon size={14} />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-10"><Spinner /></div>
          ) : sortedActive.length === 0 ? (
            <EmptyState
              title="No active jobs"
              description="You have no pending assignments right now."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {sortedActive.map((job: ServiceRequest) => {
                    const isOverdue = job.dueAt && isPast(new Date(job.dueAt))
                    return (
                      <tr
                        key={job.id}
                        className={`hover:bg-muted/20 transition-colors ${isOverdue ? 'bg-red-50/60' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/officer/jobs/${job.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                            {job.referenceNo}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/officer/jobs/${job.id}`} className="text-sm font-medium text-foreground hover:text-primary block truncate max-w-[260px]">
                            {job.title}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-0.5">{job.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={job.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap"><PriorityBadge priority={job.priority} /></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.dueAt ? (
                            <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                              {isOverdue && <span className="mr-1 font-semibold">OVERDUE ·</span>}
                              {format(new Date(job.dueAt), 'MMM d, HH:mm')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
