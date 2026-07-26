import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:5001/api/v1'

const mockUser = {
  id: 'user-1',
  email: 'test@miva.university',
  fullName: 'Test User',
  matricOrStaffId: 'MTR001',
  role: 'REQUESTER' as const,
  isActive: true,
  createdAt: new Date().toISOString(),
}

const mockRequest = {
  id: 'req-1',
  referenceNo: 'REQ-2025-000001',
  title: 'Broken air conditioner in Lab 3',
  description: 'The AC unit has been non-functional for three days now and it is affecting productivity.',
  location: 'Engineering Building',
  roomNumber: '301',
  category: { id: 'cat-1', name: 'Electrical', description: 'Electrical issues', slaHours: 24, isActive: true },
  categoryId: 'cat-1',
  requesterId: 'user-1',
  requester: { id: 'user-1', fullName: 'Test User', email: 'test@miva.university' },
  status: 'SUBMITTED' as const,
  priority: 'HIGH' as const,
  dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  resolvedAt: null,
  closedAt: null,
  rating: null,
  feedback: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assignments: [],
  statusUpdates: [
    { id: 'su-1', requestId: 'req-1', fromStatus: null, toStatus: 'SUBMITTED', note: 'Request submitted', actorId: 'user-1', actor: { id: 'user-1', fullName: 'Test User', role: 'REQUESTER' }, createdAt: new Date().toISOString() }
  ],
  attachments: [],
  comments: [],
  _count: { attachments: 0, comments: 0 },
}

export const handlers = [
  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({ success: true, data: { accessToken: 'mock-access-token' } })
  ),
  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({ success: true, data: mockUser })
  ),
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ success: true, data: { accessToken: 'mock-token', user: mockUser } })
  ),
  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json({ success: true, data: { id: 'user-1', email: mockUser.email } }, { status: 201 })
  ),
  http.get(`${BASE}/requests`, () =>
    HttpResponse.json({
      success: true,
      data: [mockRequest],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    })
  ),
  http.get(`${BASE}/requests/stats`, () =>
    HttpResponse.json({ success: true, data: { total: 5, open: 2, inProgress: 1, completed: 2 } })
  ),
  http.get(`${BASE}/requests/:id`, () =>
    HttpResponse.json({ success: true, data: mockRequest })
  ),
  http.post(`${BASE}/requests`, () =>
    HttpResponse.json({ success: true, data: mockRequest }, { status: 201 })
  ),
  http.get(`${BASE}/categories`, () =>
    HttpResponse.json({ success: true, data: [{ id: 'cat-1', name: 'Electrical', description: 'Electrical faults', slaHours: 24, isActive: true }] })
  ),
  http.get(`${BASE}/notifications/unread-count`, () =>
    HttpResponse.json({ success: true, data: { count: 3 } })
  ),
  http.get(`${BASE}/notifications`, () =>
    HttpResponse.json({ success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } })
  ),
  http.patch(`${BASE}/notifications/read-all`, () =>
    HttpResponse.json({ success: true, data: null })
  ),
]
