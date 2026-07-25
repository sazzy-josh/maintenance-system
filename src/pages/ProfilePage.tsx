import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/shared/Spinner'
import { User, Lock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

const profileSchema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'At least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    'Must include uppercase, lowercase, digit and symbol'
  ),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

const DEPARTMENTS = ['Engineering', 'Sciences', 'Arts', 'Business', 'Law', 'Medicine', 'Education', 'ICT', 'Administration', 'Other']
const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'badge bg-red-100 text-red-700',
  OFFICER: 'badge bg-purple-100 text-purple-700',
  REQUESTER: 'badge bg-blue-100 text-blue-700',
}

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [passwordChanged, setPasswordChanged] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      department: user?.department || '',
    },
  })

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => api.patch('/auth/profile', data),
    onSuccess: async () => {
      toast('Profile updated successfully', 'success')
      await refreshUser()
    },
    onError: () => toast('Failed to update profile', 'error'),
  })

  const changePassword = useMutation({
    mutationFn: (data: PasswordForm) => api.post('/auth/change-password', data),
    onSuccess: () => {
      toast('Password changed successfully', 'success')
      passwordForm.reset()
      setPasswordChanged(true)
      setTimeout(() => setPasswordChanged(false), 3000)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to change password'
      toast(msg, 'error')
    },
  })

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* User Overview Card */}
      <div className="card flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary-700 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {user.fullName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
            <span className={ROLE_BADGE[user.role] || 'badge bg-gray-100 text-gray-600'}>{user.role}</span>
            {user.isActive && <span className="badge bg-green-100 text-green-700">Active</span>}
          </div>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            ID: {user.matricOrStaffId} &middot; Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
          </p>
          {user.lastLoginAt && (
            <p className="text-xs text-gray-400">Last login: {format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm')}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={15} /> Profile Info
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lock size={15} /> Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
          <form onSubmit={profileForm.handleSubmit(d => updateProfile.mutate(d))} className="space-y-4">
            <div>
              <label className="label" htmlFor="prof-fullName">Full Name *</label>
              <input id="prof-fullName" {...profileForm.register('fullName')} className="input" aria-invalid={!!profileForm.formState.errors.fullName} />
              {profileForm.formState.errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Email</label>
              <input value={user.email} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact admin if needed.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="prof-phone">Phone</label>
                <input id="prof-phone" type="tel" {...profileForm.register('phone')} className="input" placeholder="+234 800 000 0000" />
              </div>
              <div>
                <label className="label" htmlFor="prof-dept">Department</label>
                <select id="prof-dept" {...profileForm.register('department')} className="input">
                  <option value="">Select...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            {user.specialization && (
              <div>
                <label className="label">Specialization</label>
                <input value={user.specialization} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={updateProfile.isPending} className="btn-primary btn">
                {updateProfile.isPending ? <Spinner size="sm" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
          {passwordChanged && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm text-green-700">Password changed successfully!</p>
            </div>
          )}
          <form onSubmit={passwordForm.handleSubmit(d => changePassword.mutate(d))} className="space-y-4">
            <div>
              <label className="label" htmlFor="currentPass">Current Password *</label>
              <input id="currentPass" type="password" {...passwordForm.register('currentPassword')} className="input" aria-invalid={!!passwordForm.formState.errors.currentPassword} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="newPass">New Password *</label>
              <input id="newPass" type="password" {...passwordForm.register('newPassword')} className="input" aria-invalid={!!passwordForm.formState.errors.newPassword} />
              {passwordForm.formState.errors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="confirmPass">Confirm New Password *</label>
              <input id="confirmPass" type="password" {...passwordForm.register('confirmPassword')} className="input" aria-invalid={!!passwordForm.formState.errors.confirmPassword} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={changePassword.isPending} className="btn-primary btn">
                {changePassword.isPending ? <Spinner size="sm" /> : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
