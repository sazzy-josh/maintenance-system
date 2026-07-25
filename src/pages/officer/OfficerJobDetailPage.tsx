import React, { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { ServiceRequest, RequestStatus } from '../../types'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PriorityBadge } from '../../components/shared/PriorityBadge'
import { Spinner } from '../../components/shared/Spinner'
import { useToast } from '../../context/ToastContext'
import { ArrowLeft, Upload, X, MessageSquare, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

type AllowedTransition = { to: RequestStatus; label: string; className: string }

const TRANSITIONS: Record<string, AllowedTransition[]> = {
  ASSIGNED: [
    { to: 'IN_PROGRESS', label: 'Start Work', className: 'btn-primary btn btn-sm' },
    { to: 'ON_HOLD', label: 'Put On Hold', className: 'btn-secondary btn btn-sm' },
  ],
  IN_PROGRESS: [
    { to: 'COMPLETED', label: 'Mark Complete', className: 'btn bg-green-600 text-white hover:bg-green-700 btn-sm focus:ring-green-500' },
    { to: 'ON_HOLD', label: 'Put On Hold', className: 'btn-secondary btn btn-sm' },
  ],
  ON_HOLD: [
    { to: 'IN_PROGRESS', label: 'Resume Work', className: 'btn-primary btn btn-sm' },
  ],
}

interface ActionModalProps {
  toStatus: RequestStatus
  label: string
  requestId: string
  onClose: () => void
}

const ActionModal = ({ toStatus, label, requestId, onClose }: ActionModalProps) => {
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      formData.append('status', toStatus)
      if (note) formData.append('note', note)
      files.forEach(f => formData.append('attachments', f))
      return api.patch(`/requests/${requestId}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      toast(`Status updated to ${label}`, 'success')
      qc.invalidateQueries({ queryKey: ['officer-job', requestId] })
      onClose()
    },
    onError: () => toast('Failed to update status', 'error'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">{label}</h3>
        <div>
          <label className="label">Note (optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="input resize-none" placeholder="Add a note about this update..." />
        </div>
        {toStatus === 'COMPLETED' && (
          <div>
            <label className="label">Proof of completion (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              <Upload className="mx-auto h-6 w-6 text-gray-300 mb-1" />
              <p className="text-xs text-gray-500">Upload photos</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
            {files.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs">
                    {f.name}
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="btn-secondary btn">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary btn">
            {mutation.isPending ? <Spinner size="sm" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const OfficerJobDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [activeAction, setActiveAction] = useState<AllowedTransition | null>(null)
  const [comment, setComment] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['officer-job', id],
    queryFn: () => api.get(`/requests/${id}`).then(r => r.data.data as ServiceRequest),
    enabled: !!id,
  })

  const addComment = useMutation({
    mutationFn: () => api.post(`/requests/${id}/comments`, { body: comment, isInternal: false }),
    onSuccess: () => {
      toast('Comment added', 'success')
      setComment('')
      qc.invalidateQueries({ queryKey: ['officer-job', id] })
    },
  })

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>
  if (!data) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Job not found.</p>
      <Link to="/officer/jobs" className="text-primary-700 hover:underline text-sm">Back to jobs</Link>
    </div>
  )

  const req = data
  const transitions = TRANSITIONS[req.status] || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {activeAction && (
        <ActionModal
          toStatus={activeAction.to}
          label={activeAction.label}
          requestId={req.id}
          onClose={() => setActiveAction(null)}
        />
      )}

      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary btn btn-sm mt-1"><ArrowLeft size={16} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-sm text-primary-700 bg-primary-50 px-2 py-0.5 rounded font-medium">{req.referenceNo}</span>
            <StatusBadge status={req.status} />
            <PriorityBadge priority={req.priority} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{req.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{req.location}{req.roomNumber ? `, ${req.roomNumber}` : ''}</p>
        </div>
        {transitions.length > 0 && (
          <div className="flex gap-2 flex-shrink-0">
            {transitions.map(t => (
              <button key={t.to} onClick={() => setActiveAction(t)} className={t.className}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{req.description}</p>
          </div>

          {req.attachments?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Attachments ({req.attachments.length})</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {req.attachments.map((att) => (
                  <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="group block">
                    {att.mimeType?.startsWith('image/') ? (
                      <img src={att.url} alt={att.fileName} className="w-full aspect-square object-cover rounded-lg border border-gray-200 group-hover:ring-2 ring-primary-500 transition-all" />
                    ) : (
                      <div className="w-full aspect-square rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <span className="text-xs text-gray-500 text-center px-2 break-all">{att.fileName}</span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Comments ({req.comments?.length || 0})
            </h3>
            <div className="space-y-4 mb-4">
              {(req.comments || []).filter((c) => !c.isInternal).map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {c.author.fullName?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{c.author.fullName}</span>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-gray-600">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="input resize-none" placeholder="Add a comment..." />
              <button onClick={() => addComment.mutate()} disabled={!comment.trim() || addComment.isPending} className="btn-primary btn btn-sm">
                {addComment.isPending ? <Spinner size="sm" /> : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-gray-500">Category</dt><dd className="text-gray-900 font-medium">{req.category?.name}</dd></div>
              <div><dt className="text-gray-500">Requester</dt><dd className="text-gray-900 font-medium">{req.requester?.fullName}</dd></div>
              <div><dt className="text-gray-500">Submitted</dt><dd className="text-gray-900">{format(new Date(req.createdAt), 'MMM d, yyyy HH:mm')}</dd></div>
              {req.dueAt && <div><dt className="text-gray-500">Due</dt><dd className="text-gray-900">{format(new Date(req.dueAt), 'MMM d, yyyy HH:mm')}</dd></div>}
            </dl>
          </div>

          {req.statusUpdates?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} /> Status History
              </h3>
              <div className="relative pl-6 space-y-4">
                {[...req.statusUpdates].reverse().map((u) => (
                  <div key={u.id} className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary-700 border-2 border-white shadow" />
                    <StatusBadge status={u.toStatus} />
                    {u.note && <p className="text-xs text-gray-600 mt-1">{u.note}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
