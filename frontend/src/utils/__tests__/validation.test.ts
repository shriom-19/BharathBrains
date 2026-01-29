import {
  validatePincode,
  validateRequired,
  validatePriceRange,
  validateProductQuery,
  sanitizeInput,
  formatPrice,
  validateUrl,
} from '../validation'

describe('Validation Utils', () => {
  describe('validatePincode', () => {
    it('validates correct 6-digit pincodes', () => {
      expect(validatePincode('110001')).toBe(true)
      expect(validatePincode('400001')).toBe(true)
      expect(validatePincode('560001')).toBe(true)
    })

    it('rejects invalid pincodes', () => {
      expect(validatePincode('12345')).toBe(false) // Too short
      expect(validatePincode('1234567')).toBe(false) // Too long
      expect(validatePincode('abcdef')).toBe(false) // Non-numeric
      expect(validatePincode('110a01')).toBe(false) // Mixed
      expect(validatePincode('')).toBe(false) // Empty
    })

    it('handles whitespace', () => {
      expect(validatePincode(' 110001 ')).toBe(true)
      expect(validatePincode('  110001')).toBe(true)
      expect(validatePincode('110001  ')).toBe(true)
    })
  })

  describe('validateRequired', () => {
    it('validates non-empty strings', () => {
      expect(validateRequired('hello')).toBe(true)
      expect(validateRequired('a')).toBe(true)
    })

    it('rejects empty or whitespace-only strings', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired('\t\n')).toBe(false)
    })
  })

  describe('validatePriceRange', () => {
    it('validates correct price ranges', () => {
      expect(validatePriceRange(0, 100)).toBe(true)
      expect(validatePriceRange(50, 50)).toBe(true) // Equal values
      expect(validatePriceRange(1000, 5000)).toBe(true)
    })

    it('rejects invalid price ranges', () => {
      expect(validatePriceRange(-1, 100)).toBe(false) // Negative min
      expect(validatePriceRange(0, -1)).toBe(false) // Negative max
      expect(validatePriceRange(100, 50)).toBe(false) // Min > Max
    })
  })

  describe('validateProductQuery', () => {
    it('validates complete queries', () => {
      const result = validateProductQuery({
        description: 'Running shoes',
        pincode: '110001',
      })
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('identifies missing description', () => {
      const result = validateProductQuery({
        description: '',
        pincode: '110001',
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Product description is required')
    })

    it('identifies missing pincode', () => {
      const result = validateProductQuery({
        description: 'Running shoes',
        pincode: '',
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Pincode is required')
    })

    it('identifies invalid pincode format', () => {
      const result = validateProductQuery({
        description: 'Running shoes',
        pincode: '12345',
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Please enter a valid 6-digit pincode')
    })
  })

  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
      expect(sanitizeInput('Hello <b>world</b>')).toBe('Hello world')
    })

    it('trims whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world')
    })

    it('limits length', () => {
      const longString = 'a'.repeat(600)
      const result = sanitizeInput(longString)
      expect(result).toHaveLength(500)
    })
  })

  describe('formatPrice', () => {
    it('formats prices with default currency', () => {
      expect(formatPrice(1000)).toBe('₹1,000')
      expect(formatPrice(50000)).toBe('₹50,000')
      expect(formatPrice(100)).toBe('₹100')
    })

    it('formats prices with custom currency', () => {
      expect(formatPrice(1000, '$')).toBe('$1,000')
      expect(formatPrice(50000, '€')).toBe('€50,000')
    })
  })

  describe('validateUrl', () => {
    it('validates correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true)
      expect(validateUrl('http://example.com')).toBe(true)
      expect(validateUrl('https://example.com/path?query=1')).toBe(true)
    })

    it('rejects invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false)
      expect(validateUrl('ftp://example.com')).toBe(true) // FTP is valid URL
      expect(validateUrl('')).toBe(false)
      expect(validateUrl('example.com')).toBe(false) // Missing protocol
    })
  })
})