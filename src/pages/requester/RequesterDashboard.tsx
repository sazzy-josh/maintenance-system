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
  ClipboardIcon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  AddCircleIcon,
  ArrowRight01Icon,
} from 'hugeicons-react'
import { format } from 'date-fns'

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
  iconColor: string
}

const StatCard = ({ label, value, icon: Icon, gradient, iconColor }: StatCardProps) => (
  <Card className="border-0 shadow-card overflow-hidden">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </CardContent>
  </Card>
)

export const RequesterDashboard = () => {
  const { user } = useAuth()

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['my-requests', { limit: 5 }],
    queryFn: () => api.get('/requests?limit=5&sort=-createdAt').then(r => r.data),
  })

  const requests: ServiceRequest[] = requestsData?.data || []
  const meta = requestsData?.meta

  const stats = React.useMemo(() => ({
    total: meta?.total ?? requests.length,
    submitted: requests.filter((r: ServiceRequest) => r.status === 'SUBMITTED').length,
    inProgress: requests.filter((r: ServiceRequest) => ['ASSIGNED', 'IN_PROGRESS'].includes(r.status as string)).length,
    completed: requests.filter((r: ServiceRequest) => ['COMPLETED', 'CLOSED'].includes(r.status as string)).length,
  }), [requests, meta])

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your maintenance requests.
          </p>
        </div>
        <Button asChild size="default">
          <Link to="/requests/new">
            <AddCircleIcon size={18} />
            New Request
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={ClipboardIcon}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          iconColor="text-white"
        />
        <StatCard
          label="Pending Review"
          value={stats.submitted}
          icon={Clock01Icon}
          gradient="bg-gradient-to-br from-amber-400 to-amber-500"
          iconColor="text-white"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Alert01Icon}
          gradient="bg-gradient-to-br from-orange-400 to-orange-500"
          iconColor="text-white"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckmarkCircle01Icon}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconColor="text-white"
        />
      </div>

      {/* Recent Requests */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-0 flex flex-row items-center justify-between border-b border-border/60 px-6 py-4">
          <CardTitle className="text-base font-semibold">Recent Requests</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary gap-1">
            <Link to="/requests">
              View all <ArrowRight01Icon size={14} />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-10"><Spinner /></div>
          ) : requests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Submit your first maintenance request to get started."
              action={
                <Button asChild size="sm">
                  <Link to="/requests/new">Create Request</Link>
                </Button>
              }
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {requests.map((req: ServiceRequest) => (
                    <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/requests/${req.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                          {req.referenceNo}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/requests/${req.id}`} className="text-sm font-medium text-foreground hover:text-primary line-clamp-1 max-w-[260px] block">
                          {req.title}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5">{req.location}</div>
                      </td>
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
        </CardContent>
      </Card>
    </div>
  )
}
