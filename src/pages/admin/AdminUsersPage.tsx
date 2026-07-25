import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { User, RoleName } from '../../types'
import { Spinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { useToast } from '../../context/ToastContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, X, Edit2, UserX, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

const ROLE_BADGE: Record<RoleName, string> = {
  ADMIN: 'badge bg-red-100 text-red-700',
  OFFICER: 'badge bg-purple-100 text-purple-700',
  REQUESTER: 'badge bg-blue-100 text-blue-700',
}

const userSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  matricOrStaffId: z.string().min(6).max(20),
  role: z.enum(['REQUESTER', 'OFFICER', 'ADMIN']),
  phone: z.string().optional(),
  department: z.string().optional(),
  specialization: z.string().optional(),
  password: z.string().min(8).optional().or(z.literal('')),
})

type UserForm = z.infer<typeof userSchema>

interface UserModalProps {
  user?: User
  onClose: () => void
}

const UserModal = ({ user, onClose }: UserModalProps) => {
  const { toast } = useToast()
  const qc = useQueryClient()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      fullName: user.fullName,
      email: user.email,
      matricOrStaffId: user.matricOrStaffId,
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
      specialization: user.specialization || '',
      password: '',
    } : { role: 'REQUESTER' },
  })

  const role = watch('role')

  const mutation = useMutation({
    mutationFn: (data: UserForm) => {
      const payload = { ...data }
      if (!payload.password) delete payload.password
      return user ? api.patch(`/users/${user.id}`, payload) : api.post('/users', payload)
    },
    onSuccess: () => {
      toast(user ? 'User updated' : 'User created', 'success')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      onClose()
    },
    onError: (err: unknown) => {
      toast((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Operation failed', 'error')
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{user ? 'Edit User' : 'Create User'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input {...register('fullName')} className="input" placeholder="Jane Doe" aria-invalid={!!errors.fullName} />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email')} className="input" aria-invalid={!!errors.email} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Matric/Staff ID *</label>
              <input {...register('matricOrStaffId')} className="input" aria-invalid={!!errors.matricOrStaffId} />
              {errors.matricOrStaffId && <p className="mt-1 text-xs text-red-600">{errors.matricOrStaffId.message}</p>}
            </div>
            <div>
              <label className="label">Role *</label>
              <select {...register('role')} className="input">
                <option value="REQUESTER">Requester</option>
                <option value="OFFICER">Officer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" {...register('phone')} className="input" />
            </div>
            <div>
              <label className="label">Department</label>
              <input {...register('department')} className="input" />
            </div>
            {role === 'OFFICER' && (
              <div className="col-span-2">
                <label className="label">Specialization</label>
                <input {...register('specialization')} className="input" placeholder="e.g. Electrical, Plumbing, HVAC" />
              </div>
            )}
            <div className="col-span-2">
              <label className="label">{user ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
              <input type="password" {...register('password')} className="input" placeholder={user ? 'Leave blank to keep unchanged' : 'Min 8 characters'} />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary btn">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary btn">
              {isSubmitting ? <Spinner size="sm" /> : user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const AdminUsersPage = () => {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalUser, setModalUser] = useState<User | undefined | null>(null)
  const limit = 15

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search, roleFilter, page }],
    queryFn: (): Promise<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }> => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      return api.get(`/users?${params.toString()}`).then(r => r.data)
    },
    placeholderData: keepPreviousData,
  })

  const users: User[] = data?.data || []
  const meta = data?.meta

  const toggleActive = useMutation({
    mutationFn: (u: User) => api.patch(`/users/${u.id}`, { isActive: !u.isActive }),
    onSuccess: (_, u) => {
      toast(`User ${u.isActive ? 'deactivated' : 'activated'}`, 'success')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  return (
    <div className="space-y-6">
      {modalUser !== null && <UserModal user={modalUser || undefined} onClose={() => setModalUser(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-500 text-sm mt-1">{meta?.total ?? 0} total users</p>
        </div>
        <button onClick={() => setModalUser(undefined)} className="btn-primary btn">
          <Plus size={18} /> New User
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" placeholder="Search by name, email, ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="input pl-9" />
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="input sm:w-40">
            <option value="">All Roles</option>
            <option value="REQUESTER">Requester</option>
            <option value="OFFICER">Officer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Name</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">ID</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Role</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Department</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Status</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Joined</th>
                  <th className="table-cell text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {users.map((u: User) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {u.fullName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs text-gray-600">{u.matricOrStaffId}</td>
                    <td className="table-cell">
                      <span className={ROLE_BADGE[u.role]}>{u.role}</span>
                    </td>
                    <td className="table-cell text-gray-600 text-xs">{u.department || '—'}</td>
                    <td className="table-cell">
                      <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 text-xs whitespace-nowrap">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => setModalUser(u)} className="btn-secondary btn btn-sm text-xs">
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => toggleActive.mutate(u)}
                          className={`btn btn-sm text-xs ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          {u.isActive ? <><UserX size={12} /> Deactivate</> : <><UserCheck size={12} /> Activate</>}
                        </button>
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn btn-sm"><ChevronLeft size={16} /> Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn-secondary btn btn-sm">Next <ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
