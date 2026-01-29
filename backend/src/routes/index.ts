import { Router } from 'express'
import intentRoutes from './intent.js'
import searchRoutes from './search.js'
import pincodeRoutes from './pincode.js'
import feedbackRoutes from './feedback.js'

const router = Router()

// Mount route modules
router.use('/intent', intentRoutes)
router.use('/search', searchRoutes)
router.use('/pincode', pincodeRoutes)
router.use('/feedback', feedbackRoutes)

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'AI Retailer Bot API',
      version: '1.0.0',
      description: 'Backend API for intelligent multi-retailer product search',
      endpoints: {
        intent: '/api/intent - Natural language intent parsing',
        search: '/api/search - Product search across retailers',
        pincode: '/api/pincode - Pincode validation and delivery info',
        feedback: '/api/feedback - User feedback collection',
      },
    },
  })
})

export default router