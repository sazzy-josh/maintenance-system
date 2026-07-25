import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { Spinner } from '../../components/shared/Spinner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  ClipboardIcon,
  UserGroupIcon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  AnalyticsUpIcon,
  BarChartIcon,
  Chart01Icon,
} from 'hugeicons-react'

interface StatsData {
  totalRequests: number
  openRequests: number
  completedToday: number
  avgResolutionHours: number
  slaBreaches: number
  totalUsers: number
  requestsByStatus: { status: string; count: number }[]
  requestsByCategory: { category: string; count: number }[]
  weeklyTrend: { date: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#6366f1',
  ASSIGNED: '#8b5cf6',
  IN_PROGRESS: '#f59e0b',
  ON_HOLD: '#f97316',
  COMPLETED: '#10b981',
  CLOSED: '#6b7280',
  REJECTED: '#ef4444',
  CANCELLED: '#9ca3af',
}

interface KpiCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  gradient: string
  sub?: string
}

const KpiCard = ({ label, value, icon: Icon, gradient, sub }: KpiCardProps) => (
  <Card className="border-0 shadow-card overflow-hidden">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1 leading-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-lg shadow-elevated px-3 py-2">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-bold text-primary">{payload[0].value} requests</p>
    </div>
  )
}

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/requests/stats').then(r => r.data.data as StatsData),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading dashboard data…</p>
      </div>
    )
  }

  const byStatus = stats?.requestsByStatus || []
  const byCategory = stats?.requestsByCategory?.slice(0, 6) || []
  const trend = stats?.weeklyTrend || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">System-wide overview — live metrics and analytics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          label="Total Requests"
          value={stats?.totalRequests ?? 0}
          icon={ClipboardIcon}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
        />
        <KpiCard
          label="Open"
          value={stats?.openRequests ?? 0}
          icon={Clock01Icon}
          gradient="bg-gradient-to-br from-amber-400 to-amber-600"
          sub="Needs attention"
        />
        <KpiCard
          label="Completed Today"
          value={stats?.completedToday ?? 0}
          icon={CheckmarkCircle01Icon}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
        <KpiCard
          label="Avg Resolution"
          value={`${stats?.avgResolutionHours?.toFixed(1) ?? 0}h`}
          icon={AnalyticsUpIcon}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          sub="Response time"
        />
        <KpiCard
          label="SLA Breaches"
          value={stats?.slaBreaches ?? 0}
          icon={Alert01Icon}
          gradient="bg-gradient-to-br from-red-500 to-red-700"
          sub="Past deadline"
        />
        <KpiCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={UserGroupIcon}
          gradient="bg-gradient-to-br from-violet-500 to-violet-700"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Weekly Trend — wider */}
        <Card className="border-0 shadow-card lg:col-span-3">
          <CardHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <BarChartIcon size={18} className="text-primary" />
              <CardTitle className="text-sm font-semibold">Requests This Week</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={trend} barSize={32}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution — narrower */}
        <Card className="border-0 shadow-card lg:col-span-2">
          <CardHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Chart01Icon size={18} className="text-primary" />
              <CardTitle className="text-sm font-semibold">By Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {byStatus.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={68}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {byStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} requests`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1.5">
                  {byStatus.slice(0, 5).map(entry => (
                    <div key={entry.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[entry.status] || '#6b7280' }} />
                        <span className="text-muted-foreground capitalize">{entry.status.replace('_', ' ')}</span>
                      </div>
                      <span className="font-semibold text-foreground">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <BarChartIcon size={18} className="text-primary" />
            <CardTitle className="text-sm font-semibold">Top Categories</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCategory} layout="vertical" barSize={20}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} width={130} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
