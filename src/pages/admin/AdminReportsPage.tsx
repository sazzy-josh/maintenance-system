import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { Spinner } from '../../components/shared/Spinner'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts'
import { Download, FileText, Calendar } from 'lucide-react'
import { format, subDays, startOfMonth } from 'date-fns'

type ReportRange = '7d' | '30d' | '90d' | 'month'

const RANGES: { key: ReportRange; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'month', label: 'This month' },
]

const getDateRange = (range: ReportRange) => {
  const now = new Date()
  switch (range) {
    case '7d': return { from: format(subDays(now, 7), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') }
    case '30d': return { from: format(subDays(now, 30), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') }
    case '90d': return { from: format(subDays(now, 90), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') }
    case 'month': return { from: format(startOfMonth(now), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') }
  }
}

export const AdminReportsPage = () => {
  const [range, setRange] = useState<ReportRange>('30d')
  const { from, to } = getDateRange(range)

  const { data: summaryData, isLoading: loadingSummary } = useQuery({
    queryKey: ['reports-summary', range],
    queryFn: () => api.get(`/reports/summary?dateFrom=${from}&dateTo=${to}`).then(r => r.data.data),
  })
  const { data: byCategoryData, isLoading: loadingCat } = useQuery({
    queryKey: ['reports-by-category'],
    queryFn: () => api.get('/reports/by-category').then(r => r.data.data),
  })
  const { data: byOfficerData, isLoading: loadingOfficer } = useQuery({
    queryKey: ['reports-by-officer'],
    queryFn: () => api.get('/reports/by-officer').then(r => r.data.data),
  })
  const { data: trendData, isLoading: loadingTrend } = useQuery({
    queryKey: ['reports-monthly-trend'],
    queryFn: () => api.get('/reports/monthly-trend').then(r => r.data.data),
  })

  const isLoading = loadingSummary || loadingCat || loadingOfficer || loadingTrend

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const url = type === 'csv'
        ? `/reports/export/csv?dateFrom=${from}&dateTo=${to}`
        : `/reports/export/pdf`
      const res = await api.get(url, { responseType: 'blob' })
      const objectUrl = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `fixit-report-${from}-${to}.${type}`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      // silent — server may lack Cloudinary/email config
    }
  }

  const trend = (trendData || []).slice(-7)
  const byCategory = (byCategoryData || []).map((c: { category: string; total: number }) => ({ category: c.category, count: c.total }))
  const byOfficer = (byOfficerData || []).map((o: { name: string; completed: number }) => ({ officer: o.name, resolved: o.completed }))
  const summary = {
    total: summaryData?.total ?? 0,
    resolved: summaryData?.completed ?? 0,
    avgHours: summaryData?.avgResolutionHours ?? 0,
    slaCompliance: summaryData?.completionRate ?? 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500 text-sm mt-1">Analysis and export of maintenance data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary btn btn-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="btn-secondary btn btn-sm">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Report Period:</span>
          <div className="flex gap-1 flex-wrap">
            {RANGES.map(r => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  range === r.key ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-auto hidden sm:block">{from} to {to}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Submitted', value: summary.total ?? 0, color: 'bg-primary-100 text-primary-700' },
              { label: 'Resolved', value: summary.resolved ?? 0, color: 'bg-green-100 text-green-700' },
              { label: 'Avg Resolution (h)', value: summary.avgHours?.toFixed(1) ?? 'N/A', color: 'bg-blue-100 text-blue-700' },
              { label: 'SLA Compliance', value: `${summary.slaCompliance ?? 0}%`, color: 'bg-yellow-100 text-yellow-700' },
            ].map(s => (
              <div key={s.label} className="card">
                <div className={`text-3xl font-bold mb-1 ${s.color.split(' ')[1]}`}>{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Daily Trend */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Request Trend</h3>
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" name="Requests" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No trend data for this period</div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* By Category */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Requests by Category</h3>
              {byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byCategory} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1d4ed8" radius={[0, 4, 4, 0]} name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>
              )}
            </div>

            {/* By Officer */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Requests Resolved by Officer</h3>
              {byOfficer.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byOfficer} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="officer" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="resolved" fill="#22c55e" radius={[0, 4, 4, 0]} name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No officer data available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
