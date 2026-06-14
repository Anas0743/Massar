import axios from "axios"
import type {
  AdminStats,
  Availability,
  Booking,
  BookingStatus,
  ContactMessage,
  Expert,
  FAQ,
  MeResponse,
  PaymentStatus,
  Review,
  SessionNote,
  SessionType,
  StudentProfile,
  Track,
  User,
  UserRole,
} from "../types/models"

export const TOKEN_KEY = "masar_token"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export const authAPI = {
  register: (payload: { name: string; email: string; password: string; role: UserRole; phone?: string }) =>
    api.post<TokenResponse>("/auth/register", payload).then((res) => res.data),
  login: (payload: { email: string; password: string }) =>
    api.post<TokenResponse>("/auth/login", payload).then((res) => res.data),
  me: () => api.get<MeResponse>("/auth/me").then((res) => res.data),
}

export const publicAPI = {
  tracks: () => api.get<Track[]>("/tracks").then((res) => res.data),
  sessionTypes: () => api.get<SessionType[]>("/session-types").then((res) => res.data),
  experts: (params?: { search?: string; track?: string; max_price?: number; min_rating?: number }) =>
    api.get<Expert[]>("/experts", { params }).then((res) => res.data),
  expert: (id: string | number) => api.get<Expert>(`/experts/${id}`).then((res) => res.data),
  expertReviews: (id: string | number) => api.get<Review[]>(`/experts/${id}/reviews`).then((res) => res.data),
  faqs: () => api.get<FAQ[]>("/faqs").then((res) => res.data),
  contact: (payload: { name: string; email: string; phone?: string; message: string }) =>
    api.post<ContactMessage>("/contact", payload).then((res) => res.data),
}

export const studentAPI = {
  profile: () => api.get<StudentProfile>("/student/profile").then((res) => res.data),
  updateProfile: (payload: Partial<StudentProfile> & { name?: string; phone?: string; avatar_url?: string }) =>
    api.put<StudentProfile>("/student/profile", payload).then((res) => res.data),
  bookings: () => api.get<Booking[]>("/student/bookings").then((res) => res.data),
  createBooking: (payload: {
    expert_id: number
    session_type_id: number
    scheduled_at: string
    student_message?: string
    payment_method?: "manual"
  }) => api.post<Booking>("/bookings", payload).then((res) => res.data),
  booking: (id: string | number) => api.get<Booking>(`/bookings/${id}`).then((res) => res.data),
  cancelBooking: (id: number) =>
    api.put<Booking>(`/bookings/${id}/status`, { status: "cancelled" satisfies BookingStatus }).then((res) => res.data),
  review: (id: number, payload: { rating: number; comment?: string }) =>
    api.post<Review>(`/bookings/${id}/review`, payload).then((res) => res.data),
}

export const expertAPI = {
  profile: () => api.get<Expert>("/experts/profile").then((res) => res.data),
  updateProfile: (payload: Partial<Expert> & { track_ids?: number[]; session_type_ids?: number[] }) =>
    api.put<Expert>("/experts/profile", payload).then((res) => res.data),
  bookings: () => api.get<Booking[]>("/expert/bookings").then((res) => res.data),
  availability: () => api.get<Availability[]>("/expert/availability").then((res) => res.data),
  updateAvailability: (payload: Array<Omit<Availability, "id" | "expert_id">>) =>
    api.put<Availability[]>("/expert/availability", payload).then((res) => res.data),
  updateStatus: (id: number, status: BookingStatus, expert_message?: string) =>
    api.put<Booking>(`/bookings/${id}/status`, { status, expert_message }).then((res) => res.data),
  updateMeetingUrl: (id: number, meeting_url: string) =>
    api.put<Booking>(`/bookings/${id}/meeting-url`, { meeting_url }).then((res) => res.data),
  sessionNote: (id: number, payload: Omit<SessionNote, "id" | "booking_id" | "created_at">) =>
    api.post<SessionNote>(`/bookings/${id}/session-note`, payload).then((res) => res.data),
}

export const adminAPI = {
  stats: () => api.get<AdminStats>("/admin/stats").then((res) => res.data),
  users: (role?: UserRole) => api.get<User[]>("/admin/users", { params: { role } }).then((res) => res.data),
  students: () => api.get<User[]>("/admin/students").then((res) => res.data),
  experts: (approved?: boolean) => api.get<Expert[]>("/admin/experts", { params: { approved } }).then((res) => res.data),
  approveExpert: (id: number) => api.put<Expert>(`/admin/experts/${id}/approve`).then((res) => res.data),
  rejectExpert: (id: number) => api.put<Expert>(`/admin/experts/${id}/reject`).then((res) => res.data),
  createExpert: (payload: {
    name: string
    email: string
    password: string
    phone?: string
    avatar_url?: string
    title?: string
    company?: string
    years_of_experience?: number
    bio?: string
    hourly_price?: number
    session_duration_minutes?: number
    linkedin_url?: string
    github_url?: string
    portfolio_url?: string
    is_approved?: boolean
  }) => api.post<Expert>("/admin/experts", payload).then((res) => res.data),
  bookings: (params?: { status?: BookingStatus; expert_id?: number; student_id?: number }) =>
    api.get<Booking[]>("/admin/bookings", { params }).then((res) => res.data),
  updatePaymentStatus: (id: number, status: PaymentStatus, transaction_reference?: string) =>
    api.put<Booking>(`/admin/bookings/${id}/payment-status`, { status, transaction_reference }).then((res) => res.data),
  tracks: () => api.get<Track[]>("/tracks", { params: { include_inactive: true } }).then((res) => res.data),
  createTrack: (payload: Omit<Track, "id">) => api.post<Track>("/admin/tracks", payload).then((res) => res.data),
  updateTrack: (id: number, payload: Partial<Track>) => api.put<Track>(`/admin/tracks/${id}`, payload).then((res) => res.data),
  deleteTrack: (id: number) => api.delete(`/admin/tracks/${id}`),
  sessionTypes: () =>
    api.get<SessionType[]>("/session-types", { params: { include_inactive: true } }).then((res) => res.data),
  createSessionType: (payload: Omit<SessionType, "id" | "custom_price">) =>
    api.post<SessionType>("/admin/session-types", payload).then((res) => res.data),
  updateSessionType: (id: number, payload: Partial<SessionType>) =>
    api.put<SessionType>(`/admin/session-types/${id}`, payload).then((res) => res.data),
  deleteSessionType: (id: number) => api.delete(`/admin/session-types/${id}`),
  faqs: () => api.get<FAQ[]>("/admin/faqs").then((res) => res.data),
  createFaq: (payload: Omit<FAQ, "id">) => api.post<FAQ>("/admin/faqs", payload).then((res) => res.data),
  updateFaq: (id: number, payload: Partial<FAQ>) => api.put<FAQ>(`/admin/faqs/${id}`, payload).then((res) => res.data),
  deleteFaq: (id: number) => api.delete(`/admin/faqs/${id}`),
  contactMessages: () => api.get<ContactMessage[]>("/admin/contact-messages").then((res) => res.data),
}
