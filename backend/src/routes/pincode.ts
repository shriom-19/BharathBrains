import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler.js'
import { PincodeService } from '../services/PincodeService.js'
import type { ApiResponse, PincodeValidationResult } from '../types/index.js'

const router = Router()
const pincodeService = new PincodeService()

// Validation middleware
const validatePincodeRequest = [
  body('pincode')
    .isString()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),
]

// Validate pincode and get location information
router.post('/validate', validatePincodeRequest, asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    } as ApiResponse<never>)
  }

  const { pincode } = req.body

  try {
    const result = await pincodeService.validatePincode(pincode)
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse<PincodeValidationResult>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate pincode',
    } as ApiResponse<never>)
  }
}))

// Get delivery information for a pincode and retailer
router.post('/delivery', [
  ...validatePincodeRequest,
  body('retailer')
    .isString()
    .trim()
    .isIn(['amazon', 'flipkart', 'myntra', 'meesho'])
    .withMessage('Retailer must be one of: amazon, flipkart, myntra, meesho'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    } as ApiResponse<never>)
  }

  const { pincode, retailer } = req.body

  try {
    const deliveryInfo = await pincodeService.getDeliveryInfo(pincode, retailer)
    
    res.json({
      success: true,
      data: deliveryInfo,
    } as ApiResponse<any>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get delivery information',
    } as ApiResponse<never>)
  }
}))

export default router