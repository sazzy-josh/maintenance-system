export type RoleName = 'REQUESTER' | 'OFFICER' | 'ADMIN'
export type RequestStatus = 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED' | 'REJECTED' | 'CANCELLED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface User {
  id: string
  email: string
  fullName: string
  matricOrStaffId: string
  phone?: string
  department?: string
  role: RoleName
  specialization?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  slaHours: number
  isActive: boolean
}

export interface Attachment {
  id: string
  url: string
  publicId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  kind: string
  uploadedById: string
  createdAt: string
}

export interface Comment {
  id: string
  requestId: string
  authorId: string
  author: { id: string; fullName: string; role: RoleName }
  body: string
  isInternal: boolean
  createdAt: string
}

export interface StatusUpdate {
  id: string
  requestId: string
  fromStatus?: RequestStatus
  toStatus: RequestStatus
  note?: string
  actorId: string
  actor: { id: string; fullName: string; role: RoleName }
  createdAt: string
}

export interface Assignment {
  id: string
  requestId: string
  officerId: string
  officer: { id: string; fullName: string; specialization?: string }
  assignedById: string
  assignedBy: { id: string; fullName: string }
  status: string
  note?: string
  assignedAt: string
  completedAt?: string
}

export interface ServiceRequest {
  id: string
  referenceNo: string
  title: string
  description: string
  location: string
  roomNumber?: string
  categoryId: string
  category: Category
  requesterId: string
  requester: { id: string; fullName: string; email: string; department?: string }
  status: RequestStatus
  priority: Priority
  dueAt?: string
  resolvedAt?: string
  closedAt?: string
  rating?: number
  feedback?: string
  createdAt: string
  updatedAt: string
  assignments: Assignment[]
  statusUpdates: StatusUpdate[]
  attachments: Attachment[]
  comments: Comment[]
  _count?: { attachments: number; comments: number }
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
