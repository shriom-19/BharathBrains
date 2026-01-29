// Shared types for the backend API

export interface ProductQuery {
  description: string
  pincode: string
  budget?: {
    min: number
    max: number
  }
  filters?: {
    brands?: string[]
    size?: string
    color?: string
    specifications?: Record<string, string>
  }
  confidence: number
}

export interface ParsedIntent {
  productType: string
  budget: { min: number; max: number } | null
  features: string[]
  brand?: string
  specifications?: Record<string, string>
}

export interface Product {
  id: string
  retailer: RetailerName
  name: string
  brand: string
  price: number
  originalPrice?: number
  currency: string
  image: string
  description: string
  specifications: Record<string, string>
  availability: boolean
  deliveryInfo: {
    available: boolean
    eta: string
    cost: number
  }
  rating: number
  reviewCount: number
  matchScore: number
  explanation: string
  highlights: Array<{
    type: 'top_pick' | 'best_value' | 'fastest_delivery'
    reason: string
  }>
  retailerUrl: string
  lastUpdated: Date
}

export interface SearchResult {
  status: 'loading' | 'success' | 'error' | 'not_deliverable'
  products: Product[]
  error?: string
}

export interface RetailerSearchResults {
  amazon: SearchResult
  flipkart: SearchResult
  myntra: SearchResult
  meesho: SearchResult
}

export type RetailerName = 'amazon' | 'flipkart' | 'myntra' | 'meesho'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PincodeValidationResult {
  valid: boolean
  city?: string
  state?: string
  error?: string
}

export interface UserFeedback {
  productId: string
  type: 'relevant' | 'not_relevant'
  timestamp: number
  queryId: string
}

export interface RetailerConfig {
  name: RetailerName
  baseUrl: string
  searchPath: string
  enabled: boolean
  timeout: number
  rateLimit: {
    requests: number
    window: number
  }
}

export interface ScrapingResult {
  success: boolean
  products: Product[]
  error?: string
  metadata?: {
    totalResults: number
    searchTime: number
    source: string
  }
}