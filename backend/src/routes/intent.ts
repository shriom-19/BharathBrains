import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler.js'
import { IntentParserService } from '../services/IntentParserService.js'
import type { ApiResponse, ParsedIntent } from '../types/index.js'

const router = Router()
const intentParser = new IntentParserService()

// Validation middleware
const validateParseRequest = [
  body('query')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Query must be a string between 1 and 500 characters'),
]

// Parse natural language query into structured intent
router.post('/parse', validateParseRequest, asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    } as ApiResponse<never>)
  }

  const { query } = req.body

  try {
    const parsedIntent = await intentParser.parseQuery(query)
    
    res.json({
      success: true,
      data: parsedIntent,
    } as ApiResponse<ParsedIntent>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse intent',
    } as ApiResponse<never>)
  }
}))

// Extract entities from text (for advanced use cases)
router.post('/entities', validateParseRequest, asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    } as ApiResponse<never>)
  }

  const { query } = req.body

  try {
    const entities = await intentParser.extractEntities(query)
    
    res.json({
      success: true,
      data: entities,
    } as ApiResponse<any>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract entities',
    } as ApiResponse<never>)
  }
}))

export default router