import axios from 'axios'
import type {
  ProductQuery,
  ParsedIntent,
  RetailerSearchResults,
  ApiResponse,
  PincodeValidationResult,
  UserFeedback,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 seconds timeout for search operations
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error)
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.')
    }
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.')
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.')
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  // Intent parsing
  parseIntent: async (query: string): Promise<ParsedIntent> => {
    const response = await api.post<ApiResponse<ParsedIntent>>('/intent/parse', {
      query,
    })
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to parse intent')
    }
    return response.data.data
  },

  // Pincode validation
  validatePincode: async (pincode: string): Promise<PincodeValidationResult> => {
    const response = await api.post<ApiResponse<PincodeValidationResult>>(
      '/pincode/validate',
      { pincode }
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to validate pincode')
    }
    return response.data.data
  },

  // Product search
  searchProducts: async (query: ProductQuery): Promise<RetailerSearchResults> => {
    const response = await api.post<ApiResponse<RetailerSearchResults>>(
      '/search/products',
      query
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to search products')
    }
    return response.data.data
  },

  // User feedback
  submitFeedback: async (feedback: UserFeedback): Promise<void> => {
    const response = await api.post<ApiResponse<void>>('/feedback', feedback)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to submit feedback')
    }
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get<
      ApiResponse<{ status: string; timestamp: string }>
    >('/health')
    if (!response.data.success || !response.data.data) {
      throw new Error('Health check failed')
    }
    return response.data.data
  },
}

export default api