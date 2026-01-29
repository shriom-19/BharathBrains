import { logger } from '../utils/logger.js'
import type { UserFeedback } from '../types/index.js'

export class FeedbackService {
  private feedbackStore: UserFeedback[] = []

  async submitFeedback(feedback: UserFeedback): Promise<void> {
    logger.info(`Submitting feedback for product ${feedback.productId}: ${feedback.type}`)

    // Validate feedback
    this.validateFeedback(feedback)

    // Store feedback (in real implementation, this would go to a database)
    this.feedbackStore.push({
      ...feedback,
      timestamp: feedback.timestamp || Date.now(),
    })

    logger.info(`Feedback stored successfully. Total feedback count: ${this.feedbackStore.length}`)

    // In real implementation, this would trigger:
    // 1. Update recommendation algorithms
    // 2. Store in database
    // 3. Send analytics events
    // 4. Update user preferences
  }

  async getFeedbackAnalytics(): Promise<any> {
    logger.info('Generating feedback analytics')

    const totalFeedback = this.feedbackStore.length
    const relevantCount = this.feedbackStore.filter(f => f.type === 'relevant').length
    const notRelevantCount = this.feedbackStore.filter(f => f.type === 'not_relevant').length

    // Group by product
    const productFeedback = this.feedbackStore.reduce((acc, feedback) => {
      if (!acc[feedback.productId]) {
        acc[feedback.productId] = { relevant: 0, not_relevant: 0 }
      }
      acc[feedback.productId][feedback.type]++
      return acc
    }, {} as Record<string, { relevant: number; not_relevant: number }>)

    // Group by query
    const queryFeedback = this.feedbackStore.reduce((acc, feedback) => {
      if (!acc[feedback.queryId]) {
        acc[feedback.queryId] = { relevant: 0, not_relevant: 0 }
      }
      acc[feedback.queryId][feedback.type]++
      return acc
    }, {} as Record<string, { relevant: number; not_relevant: number }>)

    // Calculate relevance rate
    const relevanceRate = totalFeedback > 0 ? (relevantCount / totalFeedback) * 100 : 0

    // Recent feedback (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    const recentFeedback = this.feedbackStore.filter(f => f.timestamp > oneDayAgo)

    const analytics = {
      summary: {
        totalFeedback,
        relevantCount,
        notRelevantCount,
        relevanceRate: Math.round(relevanceRate * 100) / 100,
      },
      byProduct: Object.entries(productFeedback).map(([productId, counts]) => ({
        productId,
        ...counts,
        relevanceRate: Math.round((counts.relevant / (counts.relevant + counts.not_relevant)) * 10000) / 100,
      })),
      byQuery: Object.entries(queryFeedback).map(([queryId, counts]) => ({
        queryId,
        ...counts,
        relevanceRate: Math.round((counts.relevant / (counts.relevant + counts.not_relevant)) * 10000) / 100,
      })),
      recent: {
        count: recentFeedback.length,
        relevant: recentFeedback.filter(f => f.type === 'relevant').length,
        notRelevant: recentFeedback.filter(f => f.type === 'not_relevant').length,
      },
      trends: this.calculateTrends(),
    }

    logger.info(`Analytics generated: ${relevanceRate.toFixed(2)}% relevance rate from ${totalFeedback} feedback entries`)

    return analytics
  }

  private validateFeedback(feedback: UserFeedback): void {
    if (!feedback.productId || typeof feedback.productId !== 'string') {
      throw new Error('Product ID is required and must be a string')
    }

    if (!feedback.queryId || typeof feedback.queryId !== 'string') {
      throw new Error('Query ID is required and must be a string')
    }

    if (!['relevant', 'not_relevant'].includes(feedback.type)) {
      throw new Error('Feedback type must be either "relevant" or "not_relevant"')
    }

    if (feedback.timestamp && (typeof feedback.timestamp !== 'number' || feedback.timestamp < 0)) {
      throw new Error('Timestamp must be a positive number')
    }
  }

  private calculateTrends(): any {
    // Calculate feedback trends over time
    const now = Date.now()
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000)

    const thisWeek = this.feedbackStore.filter(f => f.timestamp > oneWeekAgo)
    const lastWeek = this.feedbackStore.filter(f => f.timestamp > twoWeeksAgo && f.timestamp <= oneWeekAgo)

    const thisWeekRelevance = thisWeek.length > 0 
      ? (thisWeek.filter(f => f.type === 'relevant').length / thisWeek.length) * 100 
      : 0

    const lastWeekRelevance = lastWeek.length > 0 
      ? (lastWeek.filter(f => f.type === 'relevant').length / lastWeek.length) * 100 
      : 0

    const trend = thisWeekRelevance - lastWeekRelevance

    return {
      thisWeek: {
        count: thisWeek.length,
        relevanceRate: Math.round(thisWeekRelevance * 100) / 100,
      },
      lastWeek: {
        count: lastWeek.length,
        relevanceRate: Math.round(lastWeekRelevance * 100) / 100,
      },
      trend: {
        direction: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
        change: Math.round(Math.abs(trend) * 100) / 100,
      },
    }
  }

  // Method to get feedback for a specific product (for recommendation tuning)
  async getProductFeedback(productId: string): Promise<UserFeedback[]> {
    return this.feedbackStore.filter(f => f.productId === productId)
  }

  // Method to get feedback for a specific query (for intent parsing improvement)
  async getQueryFeedback(queryId: string): Promise<UserFeedback[]> {
    return this.feedbackStore.filter(f => f.queryId === queryId)
  }
}