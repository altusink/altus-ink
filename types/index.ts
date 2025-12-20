export type UserRole = 'CEO' | 'ARTIST' | 'SELLER' | 'COORDINATOR'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export type TattooType = 'small' | 'medium' | 'large' | 'extra-large'

export type TattooCategory = 'ultrarealism' | 'fineline' | 'coverup' | 'oldschool' | 'colorful'

export interface User {
    id: string
    email: string
    role: UserRole
    full_name: string
    avatar_url?: string
    phone?: string
    team_id?: string
    managed_by?: string
    created_at: string
    updated_at: string
}

export interface Artist {
    id: string
    user_id: string
    stage_name: string
    bio: string
    specialties: string[]
    hourly_rate: number
    commission_rate: number
    is_active: boolean
    portfolio_images: string[]
    social_links: {
        instagram?: string
        facebook?: string
        twitter?: string
    }
    availability: {
        [key: string]: { start: string; end: string }[]
    }
    created_at: string
    updated_at: string
}

export interface Booking {
    id: string
    artist_id: string
    client_name: string
    client_email: string
    client_phone: string
    client_language: string
    booking_date: string
    booking_time: string
    duration_hours: number
    tattoo_type: TattooType
    tattoo_category?: TattooCategory
    tattoo_description: string
    body_location: string
    reference_images: string[]
    estimated_price: number
    deposit_amount: number
    deposit_paid: boolean
    payment_intent_id?: string
    status: BookingStatus
    health_form: {
        allergies?: string
        medications?: string
        medical_conditions?: string
        pregnant?: boolean
    }
    consent_signed: boolean
    consent_signed_at?: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface Tour {
    id: string
    artist_id: string
    city: string
    country: string
    start_date: string
    end_date: string
    studio_partner?: string
    studio_address?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Review {
    id: string
    booking_id: string
    artist_id: string
    rating: number
    comment: string
    is_published: boolean
    created_at: string
    updated_at: string
}

export interface LoyaltyPoints {
    id: string
    client_email: string
    points: number
    reason: string
    booking_id?: string
    created_at: string
    updated_at: string
}

export interface Waitlist {
    id: string
    artist_id: string
    client_name: string
    client_email: string
    client_phone: string
    preferred_dates: string[]
    tattoo_type: TattooType
    status: 'WAITING' | 'NOTIFIED' | 'BOOKED' | 'EXPIRED'
    created_at: string
    updated_at: string
}

export interface Voucher {
    id: string
    code: string
    value: number
    is_redeemed: boolean
    redeemed_by?: string
    redeemed_at?: string
    expires_at: string
    created_at: string
    updated_at: string
}

export interface FlashTattoo {
    id: string
    artist_id: string
    design_image: string
    name: string
    size: string
    price: number
    quantity_total: number
    quantity_sold: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Revenue {
    id: string
    booking_id?: string
    artist_id?: string
    amount: number
    payment_method?: string
    payment_status: 'PENDING' | 'COMPLETED' | 'REFUNDED'
    description?: string
    category?: string
    created_by?: string
    created_at: string
    updated_at: string
}

export interface Expense {
    id: string
    amount: number
    category: string
    description: string
    receipt_url?: string
    payment_method?: string
    paid_to?: string
    approved_by?: string
    created_by?: string
    created_at: string
    updated_at: string
}
