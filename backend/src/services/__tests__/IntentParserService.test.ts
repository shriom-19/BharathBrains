import { IntentParserService } from '../IntentParserService.js'

// Mock OpenAI
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}))

describe('IntentParserService', () => {
  let service: IntentParserService
  let mockOpenAI: any

  beforeEach(() => {
    // Set up environment variable
    process.env.OPENAI_API_KEY = 'test-key'
    
    service = new IntentParserService()
    mockOpenAI = (service as any).openai
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('parseQuery', () => {
    it('should parse a simple product query', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              productType: 'running shoes',
              budget: { min: 0, max: 3000 },
              features: ['running', 'daily jogging'],
              brand: null,
              specifications: {}
            })
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const result = await service.parseQuery('Running shoes under ₹3000 for daily jogging')

      expect(result).toEqual({
        productType: 'running shoes',
        budget: { min: 0, max: 3000 },
        features: ['running', 'daily jogging'],
        brand: null,
        specifications: {}
      })

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' })
        ]),
        temperature: 0.1,
        max_tokens: 500
      })
    })

    it('should handle OpenAI API errors with fallback parsing', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'))

      const result = await service.parseQuery('running shoes under 3000')

      // Should use fallback parsing
      expect(result.productType).toBe('shoes')
      expect(result.budget).toEqual({ min: 0, max: 3000 })
      expect(result.features).toContain('running')
    })

    it('should handle invalid JSON response with fallback', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const result = await service.parseQuery('laptop for gaming')

      // Should use fallback parsing
      expect(result.productType).toBe('laptop')
      expect(result.features).toContain('gaming')
    })
  })

  describe('extractEntities', () => {
    it('should extract entities from text', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              productType: 'smartphone',
              brand: 'Samsung',
              features: ['good camera'],
              specifications: { camera: 'good' },
              budget: { min: 0, max: 20000 }
            })
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const result = await service.extractEntities('Samsung smartphone with good camera under 20000')

      expect(result).toEqual({
        productType: 'smartphone',
        brand: 'Samsung',
        features: ['good camera'],
        specifications: { camera: 'good' },
        budget: { min: 0, max: 20000 }
      })
    })

    it('should handle API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'))

      await expect(service.extractEntities('test query')).rejects.toThrow('Failed to extract entities from query')
    })
  })

  describe('fallback parsing', () => {
    it('should extract product type from keywords', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'))

      const result = await service.parseQuery('I need new running shoes')

      expect(result.productType).toBe('shoes')
      expect(result.features).toContain('running')
    })

    it('should extract budget from text', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'))

      const result = await service.parseQuery('laptop under ₹50000')

      expect(result.productType).toBe('laptop')
      expect(result.budget).toEqual({ min: 0, max: 50000 })
    })

    it('should handle queries without budget', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'))

      const result = await service.parseQuery('formal shirt')

      expect(result.productType).toBe('shirt')
      expect(result.budget).toBeNull()
      expect(result.features).toContain('formal')
    })
  })
})