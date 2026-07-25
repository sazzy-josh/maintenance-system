import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { Category } from '../../types'
import { Spinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { useToast } from '../../context/ToastContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Edit2, Trash2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  description: z.string().min(5, 'At least 5 characters'),
  slaHours: z.preprocess(v => Number(v), z.number().int().positive('Must be a positive number')),
  isActive: z.boolean(),
})

type CategoryForm = {
  name: string
  description: string
  slaHours: number
  isActive: boolean
}

interface CategoryModalProps {
  category?: Category
  onClose: () => void
}

const CategoryModal = ({ category, onClose }: CategoryModalProps) => {
  const { toast } = useToast()
  const qc = useQueryClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryForm, any, CategoryForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: category ? {
      name: category.name,
      description: category.description,
      slaHours: category.slaHours,
      isActive: category.isActive,
    } : { isActive: true, slaHours: 24 },
  })

  const mutation = useMutation({
    mutationFn: (data: CategoryForm) =>
      category ? api.patch(`/categories/${category.id}`, data) : api.post('/categories', data),
    onSuccess: () => {
      toast(category ? 'Category updated' : 'Category created', 'success')
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
    onError: (err: unknown) => {
      toast((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Operation failed', 'error')
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{category ? 'Edit Category' : 'New Category'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input {...register('name')} className="input" placeholder="e.g. Electrical" aria-invalid={!!errors.name} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Describe what this category covers..." aria-invalid={!!errors.description} />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>
          <div>
            <label className="label">SLA (hours) *</label>
            <input type="number" {...register('slaHours')} className="input" min={1} placeholder="24" aria-invalid={!!errors.slaHours} />
            {errors.slaHours && <p className="mt-1 text-xs text-red-600">{errors.slaHours.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Time allowed to resolve requests in this category</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" {...register('isActive')} className="rounded" />
            Active (visible to users)
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary btn">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary btn">
              {isSubmitting ? <Spinner size="sm" /> : category ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const AdminCategoriesPage = () => {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [modalCat, setModalCat] = useState<Category | undefined | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data as Category[]),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast('Category deleted', 'success')
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      setDeleteId(null)
    },
    onError: () => toast('Cannot delete category — it may have active requests', 'error'),
  })

  const categories: Category[] = data || []

  return (
    <div className="space-y-6">
      {modalCat !== null && <CategoryModal category={modalCat || undefined} onClose={() => setModalCat(null)} />}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete Category?</h3>
            <p className="text-sm text-gray-500">This action cannot be undone. Categories with existing requests cannot be deleted.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary btn">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="btn-danger btn">
                {deleteMutation.isPending ? <Spinner size="sm" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-500 text-sm mt-1">Manage maintenance request categories and SLAs</p>
        </div>
        <button onClick={() => setModalCat(undefined)} className="btn-primary btn">
          <Plus size={18} /> New Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Spinner /></div>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Create your first category to get started." action={<button onClick={() => setModalCat(undefined)} className="btn-primary btn btn-sm">Create Category</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: Category) => (
            <div key={cat.id} className={`card transition-all ${cat.isActive ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{cat.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="badge bg-blue-100 text-blue-700">SLA: {cat.slaHours}h</span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => setModalCat(cat)} className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors" aria-label="Edit">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{cat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
