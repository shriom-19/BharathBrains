// Re-export types from store slices for convenience
export type {
  ProductQuery,
  ParsedIntent,
  Product,
  SearchResult,
  RetailerSearchResults,
} from '../store/slices/searchSlice'

// Additional types for the application
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

export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface RetailerInsights {
  bestPrice: {
    retailer: RetailerName
    price: number
    product: Product
  } | null
  fastestDelivery: {
    retailer: RetailerName
    eta: string
    product: Product
  } | null
  mostOptions: {
    retailer: RetailerName
    count: number
  } | null
}

export interface UserFeedback {
  productId: string
  type: 'relevant' | 'not_relevant'
  timestamp: number
  queryId: string
}