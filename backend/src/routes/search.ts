import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler.js'
import { CrossRetailerEngine } from '../services/CrossRetailerEngine.js'
import type { ApiResponse, ProductQuery, RetailerSearchResults } from '../types/index.js'

const router = Router()
const searchEngine = new CrossRetailerEngine()

// Validation middleware
const validateSearchRequest = [
  body('description')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be a string between 1 and 500 characters'),
  body('pincode')
    .isString()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),
  body('budget.min')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Budget minimum must be a positive number'),
  body('budget.max')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Budget maximum must be a positive number'),
  body('confidence')
    .optional()
    .isNumeric()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be a number between 0 and 1'),
]

// Search products across all retailers
router.post('/products', validateSearchRequest, asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    } as ApiResponse<never>)
  }

  const query: ProductQuery = req.body

  // Validate budget range if provided
  if (query.budget && query.budget.min > query.budget.max) {
    return res.status(400).json({
      success: false,
      error: 'Budget minimum cannot be greater than maximum',
    } as ApiResponse<never>)
  }

  try {
    const results = await searchEngine.searchAllRetailers(query)
    
    res.json({
      success: true,
      data: results,
    } as ApiResponse<RetailerSearchResults>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search products',
    } as ApiResponse<never>)
  }
}))

// Search products from a specific retailer
router.post('/retailer/:retailer', validateSearchRequest, asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    } as ApiResponse<never>)
  }

  const { retailer } = req.params
  const query: ProductQuery = req.body

  // Validate retailer name
  const validRetailers = ['amazon', 'flipkart', 'myntra', 'meesho']
  if (!validRetailers.includes(retailer)) {
    return res.status(400).json({
      success: false,
      error: `Invalid retailer. Must be one of: ${validRetailers.join(', ')}`,
    } as ApiResponse<never>)
  }

  try {
    const products = await searchEngine.searchRetailer(retailer as any, query)
    
    res.json({
      success: true,
      data: {
        retailer,
        products,
        count: products.length,
      },
    } as ApiResponse<any>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : `Failed to search ${retailer}`,
    } as ApiResponse<never>)
  }
}))

export default router