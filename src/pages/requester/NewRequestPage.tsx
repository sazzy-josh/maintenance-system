import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { useToast } from '../../context/ToastContext'
import { Spinner } from '../../components/shared/Spinner'
import { Category } from '../../types'
import { Upload, X, ImageIcon, ArrowLeft } from 'lucide-react'

const schema = z.object({
  title: z.string().min(5, 'At least 5 characters').max(150),
  description: z.string().min(10, 'At least 10 characters').max(2000),
  location: z.string().min(2, 'Location is required'),
  roomNumber: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
})

type FormData = z.infer<typeof schema>

interface FilePreview {
  file: File
  preview: string
}

export const NewRequestPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FilePreview[]>([])

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories?isActive=true').then(r => r.data.data as Category[]),
  })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
  })

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const newFiles = Array.from(incoming)
      .filter(f => f.type.startsWith('image/') || f.type === 'application/pdf')
      .slice(0, 5 - files.length)
      .map(f => ({ file: f, preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : '' }))
    setFiles(prev => [...prev, ...newFiles].slice(0, 5))
  }

  const removeFile = (idx: number) => {
    setFiles(prev => {
      const next = [...prev]
      if (next[idx].preview) URL.revokeObjectURL(next[idx].preview)
      next.splice(idx, 1)
      return next
    })
  }

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v) })
      files.forEach(f => formData.append('attachments', f.file))
      return api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: (res) => {
      toast('Request submitted successfully!', 'success')
      navigate(`/requests/${res.data.data.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to submit request'
      toast(msg, 'error')
    },
  })

  const onSubmit = (data: FormData) => mutation.mutate(data)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary btn btn-sm">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Maintenance Request</h2>
          <p className="text-gray-500 text-sm">Fill in the details below to report a fault</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">Request Details</h3>

          <div>
            <label className="label" htmlFor="title">Title *</label>
            <input id="title" {...register('title')} className="input" placeholder="e.g. Broken air conditioner in lab 3" aria-invalid={!!errors.title} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="description">Description *</label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="input resize-none"
              placeholder="Describe the problem in detail..."
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label" htmlFor="location">Location / Building *</label>
              <input id="location" {...register('location')} className="input" placeholder="e.g. Science Block A" aria-invalid={!!errors.location} />
              {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label" htmlFor="roomNumber">Room / Floor (optional)</label>
              <input id="roomNumber" {...register('roomNumber')} className="input" placeholder="e.g. Room 204" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="categoryId">Category *</label>
              <select id="categoryId" {...register('categoryId')} className="input" aria-invalid={!!errors.categoryId}>
                <option value="">Select category...</option>
                {categoriesData?.map((c: Category) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="priority">Priority *</label>
              <select id="priority" {...register('priority')} className="input">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="card space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Attachments</h3>
            <p className="text-sm text-gray-500 mt-1">Upload up to 5 photos or documents (images, PDF)</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              files.length >= 5 ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
            }`}
            aria-label="Upload files"
          >
            <Upload className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              {files.length >= 5 ? 'Maximum 5 files reached' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG, PDF up to 10MB each</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={e => addFiles(e.target.files)}
          />
          {files.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    {f.preview ? (
                      <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove file"
                  >
                    <X size={10} />
                  </button>
                  <p className="text-xs text-gray-500 truncate mt-1">{f.file.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary btn">
            {isSubmitting ? <><Spinner size="sm" /> Submitting...</> : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
