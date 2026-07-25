import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { ServiceRequest, Comment, StatusUpdate } from '../../types'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PriorityBadge } from '../../components/shared/PriorityBadge'
import { Spinner } from '../../components/shared/Spinner'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, MessageSquare, Clock, Star, Paperclip } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const StatusTimeline = ({ updates }: { updates: StatusUpdate[] }) => (
  <div className="relative pl-6 space-y-4">
    {[...updates].reverse().map((u, i) => (
      <div key={u.id} className="relative">
        <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary-700 border-2 border-white shadow" />
        {i < updates.length - 1 && <div className="absolute -left-[19px] top-4 bottom-0 w-px bg-gray-200" />}
        <div className="ml-2">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={u.toStatus} />
            {u.fromStatus && <span className="text-xs text-gray-400">from <StatusBadge status={u.fromStatus} /></span>}
          </div>
          {u.note && <p className="text-sm text-gray-600 mt-1">{u.note}</p>}
          <p className="text-xs text-gray-400 mt-1">
            {u.actor.fullName} &middot; {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    ))}
  </div>
)

const RatingStars = ({ requestId, currentRating }: { requestId: string; currentRating?: number }) => {
  const [hover, setHover] = useState(0)
  const [selected, setSelected] = useState(currentRating || 0)
  const { toast } = useToast()
  const qc = useQueryClient()

  const rate = useMutation({
    mutationFn: (rating: number) => api.post(`/requests/${requestId}/rating`, { rating }),
    onSuccess: () => {
      toast('Thank you for your feedback!', 'success')
      qc.invalidateQueries({ queryKey: ['request', requestId] })
    },
  })

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => { setSelected(i); rate.mutate(i) }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
          aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            size={24}
            className={`transition-colors ${i <= (hover || selected) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )
}

export const RequestDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => api.get(`/requests/${id}`).then(r => r.data.data as ServiceRequest),
    enabled: !!id,
  })

  const addComment = useMutation({
    mutationFn: () => api.post(`/requests/${id}/comments`, { body: comment, isInternal }),
    onSuccess: () => {
      toast('Comment added', 'success')
      setComment('')
      qc.invalidateQueries({ queryKey: ['request', id] })
    },
    onError: () => toast('Failed to add comment', 'error'),
  })

  const cancelRequest = useMutation({
    mutationFn: () => api.patch(`/requests/${id}/status`, { status: 'CANCELLED' }),
    onSuccess: () => {
      toast('Request cancelled', 'info')
      qc.invalidateQueries({ queryKey: ['request', id] })
      setCancelConfirm(false)
    },
    onError: () => toast('Failed to cancel request', 'error'),
  })

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>
  if (!data) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Request not found.</p>
      <Link to="/requests" className="text-primary-700 hover:underline text-sm">Back to requests</Link>
    </div>
  )

  const req = data
  const canCancel = user?.role === 'REQUESTER' && ['SUBMITTED'].includes(req.status)
  const canRate = user?.role === 'REQUESTER' && ['COMPLETED', 'CLOSED'].includes(req.status)
  const isAdmin = user?.role === 'ADMIN'
  const comments = req.comments || []
  const visibleComments = isAdmin ? comments : comments.filter((c: Comment) => !c.isInternal)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary btn btn-sm mt-1">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-sm text-primary-700 bg-primary-50 px-2 py-0.5 rounded font-medium">{req.referenceNo}</span>
            <StatusBadge status={req.status} />
            <PriorityBadge priority={req.priority} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{req.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{req.location}{req.roomNumber ? `, ${req.roomNumber}` : ''}</p>
        </div>
        {canCancel && (
          <div className="flex-shrink-0">
            {cancelConfirm ? (
              <div className="flex gap-2">
                <button onClick={() => cancelRequest.mutate()} className="btn-danger btn btn-sm">Confirm</button>
                <button onClick={() => setCancelConfirm(false)} className="btn-secondary btn btn-sm">No</button>
              </div>
            ) : (
              <button onClick={() => setCancelConfirm(true)} className="btn-danger btn btn-sm">Cancel Request</button>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{req.description}</p>
          </div>

          {/* Attachments */}
          {req.attachments?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Paperclip size={16} /> Attachments ({req.attachments.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {req.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                  >
                    {att.mimeType?.startsWith('image/') ? (
                      <img
                        src={att.url}
                        alt={att.fileName}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200 group-hover:ring-2 ring-primary-500 transition-all"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                        <span className="text-xs text-gray-500 text-center px-2 break-all">{att.fileName}</span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          {canRate && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star size={16} /> Rate this service
              </h3>
              <RatingStars requestId={req.id} currentRating={req.rating} />
              {req.rating && <p className="text-sm text-gray-500 mt-2">You rated this {req.rating}/5</p>}
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Comments ({visibleComments.length})
            </h3>
            <div className="space-y-4 mb-4">
              {visibleComments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
              ) : visibleComments.map((c: Comment) => (
                <div key={c.id} className={`flex gap-3 ${c.isInternal ? 'bg-yellow-50 p-3 rounded-lg' : ''}`}>
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {c.author.fullName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{c.author.fullName}</span>
                      <span className="text-xs text-gray-400">{c.author.role}</span>
                      {c.isInternal && <span className="badge bg-yellow-100 text-yellow-800 text-xs">Internal</span>}
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Add a comment..."
              />
              {isAdmin && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={e => setIsInternal(e.target.checked)}
                    className="rounded"
                  />
                  Internal comment (not visible to requester)
                </label>
              )}
              <button
                onClick={() => addComment.mutate()}
                disabled={!comment.trim() || addComment.isPending}
                className="btn-primary btn btn-sm"
              >
                {addComment.isPending ? <Spinner size="sm" /> : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900 font-medium">{req.category?.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Submitted by</dt>
                <dd className="text-gray-900 font-medium">{req.requester?.fullName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Department</dt>
                <dd className="text-gray-900">{req.requester?.department || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900">{format(new Date(req.createdAt), 'MMM d, yyyy HH:mm')}</dd>
              </div>
              {req.dueAt && (
                <div>
                  <dt className="text-gray-500">Due by</dt>
                  <dd className="text-gray-900">{format(new Date(req.dueAt), 'MMM d, yyyy HH:mm')}</dd>
                </div>
              )}
              {req.resolvedAt && (
                <div>
                  <dt className="text-gray-500">Resolved</dt>
                  <dd className="text-gray-900">{format(new Date(req.resolvedAt), 'MMM d, yyyy')}</dd>
                </div>
              )}
              {req.assignments?.length > 0 && (
                <div>
                  <dt className="text-gray-500">Assigned to</dt>
                  {req.assignments.map(a => (
                    <dd key={a.id} className="text-gray-900 font-medium">{a.officer?.fullName}</dd>
                  ))}
                </div>
              )}
            </dl>
          </div>

          {/* Status Timeline */}
          {req.statusUpdates?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} /> Status History
              </h3>
              <StatusTimeline updates={req.statusUpdates} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
