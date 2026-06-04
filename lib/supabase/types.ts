export type Role = 'admin' | 'host'
export type AvailabilityStatus = 'available' | 'booked' | 'blocked'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          phone: string | null
          whatsapp: string | null
          role: Role
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          phone?: string | null
          whatsapp?: string | null
          role?: Role
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          whatsapp?: string | null
          role?: Role
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          host_id: string
          title: string
          slug: string
          description: string
          location: string
          price: number
          bedrooms: number
          bathrooms: number
          max_guests: number
          pet_friendly: boolean
          pool: boolean
          wifi: boolean
          parking: boolean
          ac: boolean
          bbq: boolean
          sea_view: boolean
          mountain_view: boolean
          latitude: number | null
          longitude: number | null
          house_rules: string[]
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          slug: string
          description: string
          location: string
          price: number
          bedrooms?: number
          bathrooms?: number
          max_guests?: number
          pet_friendly?: boolean
          pool?: boolean
          wifi?: boolean
          parking?: boolean
          ac?: boolean
          bbq?: boolean
          sea_view?: boolean
          mountain_view?: boolean
          latitude?: number | null
          longitude?: number | null
          house_rules?: string[]
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          host_id?: string
          title?: string
          slug?: string
          description?: string
          location?: string
          price?: number
          bedrooms?: number
          bathrooms?: number
          max_guests?: number
          pet_friendly?: boolean
          pool?: boolean
          wifi?: boolean
          parking?: boolean
          ac?: boolean
          bbq?: boolean
          sea_view?: boolean
          mountain_view?: boolean
          latitude?: number | null
          longitude?: number | null
          house_rules?: string[]
          is_featured?: boolean
          is_active?: boolean
          updated_at?: string
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          url: string
          display_order: number
          alt_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          url: string
          display_order?: number
          alt_text?: string | null
          created_at?: string
        }
        Update: {
          listing_id?: string
          url?: string
          display_order?: number
          alt_text?: string | null
        }
      }
      listing_rooms: {
        Row: {
          id: string
          listing_id: string
          name: string
          beds: number
          view_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          name: string
          beds?: number
          view_description?: string | null
          created_at?: string
        }
        Update: {
          listing_id?: string
          name?: string
          beds?: number
          view_description?: string | null
        }
      }
      availability: {
        Row: {
          id: string
          listing_id: string
          date: string
          status: AvailabilityStatus
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          date: string
          status?: AvailabilityStatus
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          listing_id?: string
          date?: string
          status?: AvailabilityStatus
          note?: string | null
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      role: Role
      availability_status: AvailabilityStatus
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type ListingImage = Database['public']['Tables']['listing_images']['Row']
export type ListingRoom = Database['public']['Tables']['listing_rooms']['Row']
export type Availability = Database['public']['Tables']['availability']['Row']

export type ListingWithImages = Listing & { listing_images: ListingImage[] }
export type ListingFull = Listing & {
  listing_images: ListingImage[]
  listing_rooms: ListingRoom[]
  availability: Availability[]
}
