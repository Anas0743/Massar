export type UserRole = "student" | "expert" | "admin"
export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "completed"
export type PaymentStatus = "unpaid" | "paid" | "refunded"
export type PaymentMethod = "manual" | "cliq" | "zaincash" | "stripe" | "paypal"

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  phone?: string | null
  avatar_url?: string | null
  is_active: boolean
  created_at: string
}

export interface Track {
  id: number
  name: string
  slug: string
  description: string
  icon?: string | null
  is_active: boolean
}

export interface SessionType {
  id: number
  name: string
  slug: string
  description: string
  duration_minutes: number
  base_price: number
  custom_price?: number | null
  is_active: boolean
}

export interface Availability {
  id: number
  expert_id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Expert {
  id: number
  name: string
  email: string
  phone?: string | null
  avatar_url?: string | null
  title?: string | null
  company?: string | null
  years_of_experience: number
  bio?: string | null
  hourly_price: number
  session_duration_minutes: number
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
  is_approved: boolean
  rating_average: number
  rating_count: number
  tracks: Track[]
  session_types: SessionType[]
  availability: Availability[]
}

export interface Payment {
  id: number
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: PaymentMethod
  transaction_reference?: string | null
}

export interface SessionNote {
  id: number
  booking_id: number
  summary: string
  strengths?: string | null
  weaknesses?: string | null
  action_plan_30_days?: string | null
  resources?: string | null
  next_steps?: string | null
  created_at: string
}

export interface Review {
  id: number
  booking_id: number
  student_id: number
  expert_id: number
  student_name?: string | null
  rating: number
  comment?: string | null
  created_at: string
}

export interface Booking {
  id: number
  student_id: number
  expert_id: number
  session_type_id: number
  scheduled_at: string
  duration_minutes: number
  price: number
  status: BookingStatus
  meeting_url?: string | null
  student_message?: string | null
  expert_message?: string | null
  created_at: string
  updated_at: string
  student_name: string
  expert_name: string
  expert_title?: string | null
  session_type_name: string
  payment?: Payment | null
  session_note?: SessionNote | null
  review?: Review | null
}

export interface StudentProfile {
  id: number
  user_id: number
  university?: string | null
  major?: string | null
  academic_year?: string | null
  current_skills: string[]
  interested_tracks: string[]
  github_url?: string | null
  linkedin_url?: string | null
  cv_url?: string | null
  bio?: string | null
}

export interface FAQ {
  id: number
  question: string
  answer: string
  order: number
  is_active: boolean
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone?: string | null
  message: string
  status: "new" | "read" | "closed"
  created_at: string
}

export interface AdminStats {
  students_count: number
  experts_count: number
  bookings_count: number
  completed_bookings_count: number
  pending_bookings_count: number
  average_rating: number
}

export interface MeResponse {
  user: User
  student_profile?: StudentProfile | null
  expert_profile?: Expert | null
}
