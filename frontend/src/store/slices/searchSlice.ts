import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
  retailer: string
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

interface SearchState {
  currentQuery: ProductQuery | null
  parsedIntent: ParsedIntent | null
  results: RetailerSearchResults
  isSearching: boolean
  error: string | null
}

const initialState: SearchState = {
  currentQuery: null,
  parsedIntent: null,
  results: {
    amazon: { status: 'loading', products: [] },
    flipkart: { status: 'loading', products: [] },
    myntra: { status: 'loading', products: [] },
    meesho: { status: 'loading', products: [] },
  },
  isSearching: false,
  error: null,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<ProductQuery>) => {
      state.currentQuery = action.payload
    },
    setParsedIntent: (state, action: PayloadAction<ParsedIntent>) => {
      state.parsedIntent = action.payload
    },
    startSearch: (state) => {
      state.isSearching = true
      state.error = null
      // Reset all retailer results to loading
      Object.keys(state.results).forEach((retailer) => {
        state.results[retailer as keyof RetailerSearchResults] = {
          status: 'loading',
          products: [],
        }
      })
    },
    setRetailerResult: (
      state,
      action: PayloadAction<{
        retailer: keyof RetailerSearchResults
        result: SearchResult
      }>
    ) => {
      state.results[action.payload.retailer] = action.payload.result
    },
    completeSearch: (state) => {
      state.isSearching = false
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isSearching = false
    },
    clearResults: (state) => {
      state.results = initialState.results
      state.currentQuery = null
      state.parsedIntent = null
      state.error = null
    },
  },
})

export const {
  setQuery,
  setParsedIntent,
  startSearch,
  setRetailerResult,
  completeSearch,
  setError,
  clearResults,
} = searchSlice.actions

export default searchSlice.reducer