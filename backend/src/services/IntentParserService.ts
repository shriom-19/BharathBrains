import OpenAI from 'openai'
import { logger } from '../utils/logger.js'
import type { ParsedIntent } from '../types/index.js'

export class IntentParserService {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }

    this.openai = new OpenAI({
      apiKey,
    })
  }

  async parseQuery(query: string): Promise<ParsedIntent> {
    try {
      logger.info(`Parsing intent for query: "${query}"`)

      const prompt = this.buildIntentParsingPrompt(query)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at parsing natural language product search queries into structured data. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const parsedIntent = JSON.parse(content) as ParsedIntent
      
      // Validate the parsed intent
      this.validateParsedIntent(parsedIntent)
      
      logger.info(`Successfully parsed intent:`, parsedIntent)
      return parsedIntent

    } catch (error) {
      logger.error('Error parsing intent:', error)
      
      // Fallback to rule-based parsing if AI fails
      return this.fallbackParsing(query)
    }
  }

  async extractEntities(text: string): Promise<any> {
    try {
      const prompt = `Extract entities from this product search query: "${text}"
      
      Return a JSON object with the following structure:
      {
        "productType": "string",
        "brand": "string or null",
        "features": ["array", "of", "features"],
        "specifications": {"key": "value"},
        "budget": {"min": number, "max": number} or null
      }`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting entities from product search queries. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)

    } catch (error) {
      logger.error('Error extracting entities:', error)
      throw new Error('Failed to extract entities from query')
    }
  }

  private buildIntentParsingPrompt(query: string): string {
    return `Parse this product search query into structured data: "${query}"

    Return a JSON object with this exact structure:
    {
      "productType": "string - the main product category (e.g., 'shoes', 'laptop', 'shirt')",
      "budget": {"min": number, "max": number} or null,
      "features": ["array", "of", "desired", "features"],
      "brand": "string or null",
      "specifications": {"key": "value"} or {}
    }

    Examples:
    - "Running shoes under ₹3000 for daily jogging" → {"productType": "running shoes", "budget": {"min": 0, "max": 3000}, "features": ["daily jogging", "running"], "brand": null, "specifications": {}}
    - "Samsung smartphone with good camera under 20000" → {"productType": "smartphone", "budget": {"min": 0, "max": 20000}, "features": ["good camera"], "brand": "Samsung", "specifications": {"camera": "good"}}
    - "Formal shirt size L blue color" → {"productType": "formal shirt", "budget": null, "features": ["formal"], "brand": null, "specifications": {"size": "L", "color": "blue"}}

    Important:
    - Extract budget amounts from text (₹, rupees, Rs, etc.)
    - If no budget is mentioned, set budget to null
    - Include relevant features and specifications
    - Keep productType concise but descriptive`
  }

  private validateParsedIntent(intent: ParsedIntent): void {
    if (!intent.productType || typeof intent.productType !== 'string') {
      throw new Error('Invalid productType in parsed intent')
    }

    if (intent.budget && (typeof intent.budget.min !== 'number' || typeof intent.budget.max !== 'number')) {
      throw new Error('Invalid budget format in parsed intent')
    }

    if (!Array.isArray(intent.features)) {
      throw new Error('Invalid features format in parsed intent')
    }
  }

  private fallbackParsing(query: string): ParsedIntent {
    logger.info('Using fallback rule-based parsing')

    const lowerQuery = query.toLowerCase()
    
    // Extract product type (simple keyword matching)
    let productType = 'product'
    const productKeywords = ['shoes', 'shirt', 'laptop', 'phone', 'smartphone', 'jeans', 'dress', 'watch', 'bag']
    for (const keyword of productKeywords) {
      if (lowerQuery.includes(keyword)) {
        productType = keyword
        break
      }
    }

    // Extract budget
    let budget = null
    const budgetMatch = lowerQuery.match(/(?:under|below|less than|₹|rs\.?|rupees?)\s*(\d+(?:,\d+)*)/i)
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1].replace(/,/g, ''))
      budget = { min: 0, max: amount }
    }

    // Extract basic features
    const features: string[] = []
    if (lowerQuery.includes('running')) features.push('running')
    if (lowerQuery.includes('formal')) features.push('formal')
    if (lowerQuery.includes('casual')) features.push('casual')
    if (lowerQuery.includes('gaming')) features.push('gaming')

    return {
      productType,
      budget,
      features,
      brand: null,
      specifications: {},
    }
  }
}