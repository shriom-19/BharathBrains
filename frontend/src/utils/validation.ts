/**
 * Validation utilities for the AI Retailer Bot
 */

/**
 * Validates Indian pincode format (6 digits)
 */
export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/
  return pincodeRegex.test(pincode.trim())
}

/**
 * Validates if a string is not empty after trimming
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

/**
 * Validates price range
 */
export const validatePriceRange = (min: number, max: number): boolean => {
  return min >= 0 && max >= 0 && min <= max
}

/**
 * Validates product query completeness
 */
export const validateProductQuery = (query: {
  description: string
  pincode: string
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!validateRequired(query.description)) {
    errors.push('Product description is required')
  }

  if (!validateRequired(query.pincode)) {
    errors.push('Pincode is required')
  } else if (!validatePincode(query.pincode)) {
    errors.push('Please enter a valid 6-digit pincode')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500) // Limit length
}

/**
 * Formats price for display
 */
export const formatPrice = (price: number, currency = '₹'): string => {
  return `${currency}${price.toLocaleString('en-IN')}`
}

/**
 * Validates URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}