import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler.js'
import { FeedbackService } from '../services/FeedbackService.js'
import type { ApiResponse, UserFeedback } from '../types/index.js'

const router = Router()
const feedbackService = new FeedbackService()

// Validation middleware
const validateFeedbackRequest = [
  body('productId')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Product ID is required'),
  body('type')
    .isString()
    .trim()
    .isIn(['relevant', 'not_relevant'])
    .withMessage('Feedback type must be either "relevant" or "not_relevant"'),
  body('queryId')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Query ID is required'),
  body('timestamp')
    .optional()
    .isNumeric()
    .withMessage('Timestamp must be a number'),
]

// Submit user feedback for a product recommendation
router.post('/', validateFeedbackRequest, asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    } as ApiResponse<never>)
  }

  const feedback: UserFeedback = {
    ...req.body,
    timestamp: req.body.timestamp || Date.now(),
  }

  try {
    await feedbackService.submitFeedback(feedback)
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
    } as ApiResponse<never>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit feedback',
    } as ApiResponse<never>)
  }
}))

// Get feedback analytics (for internal use)
router.get('/analytics', asyncHandler(async (req, res) => {
  try {
    const analytics = await feedbackService.getFeedbackAnalytics()
    
    res.json({
      success: true,
      data: analytics,
    } as ApiResponse<any>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get feedback analytics',
    } as ApiResponse<never>)
  }
}))

export default router