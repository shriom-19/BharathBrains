import axios from 'axios'
import { logger } from '../utils/logger.js'
import type { PincodeValidationResult, RetailerName } from '../types/index.js'

export class PincodeService {
  private readonly pincodeApiUrl = 'https://api.postalpincode.in/pincode'
  private readonly cache = new Map<string, PincodeValidationResult>()
  private readonly cacheTimeout = 24 * 60 * 60 * 1000 // 24 hours

  async validatePincode(pincode: string): Promise<PincodeValidationResult> {
    logger.info(`Validating pincode: ${pincode}`)

    // Check cache first
    const cacheKey = `pincode-${pincode}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      logger.info(`Using cached result for pincode: ${pincode}`)
      return cached
    }

    try {
      // Validate format first
      if (!/^\d{6}$/.test(pincode)) {
        const result: PincodeValidationResult = {
          valid: false,
          error: 'Pincode must be a 6-digit number'
        }
        return result
      }

      // Call external API for validation
      const response = await axios.get(`${this.pincodeApiUrl}/${pincode}`, {
        timeout: 5000,
      })

      if (response.data && response.data[0]?.Status === 'Success') {
        const postOffice = response.data[0].PostOffice[0]
        const result: PincodeValidationResult = {
          valid: true,
          city: postOffice.District,
          state: postOffice.State,
        }

        // Cache the result
        this.cache.set(cacheKey, result)
        setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout)

        logger.info(`Pincode ${pincode} validated successfully: ${postOffice.District}, ${postOffice.State}`)
        return result
      } else {
        const result: PincodeValidationResult = {
          valid: false,
          error: 'Invalid pincode or not found'
        }
        return result
      }

    } catch (error) {
      logger.error(`Error validating pincode ${pincode}:`, error)

      // Fallback validation - basic format check
      if (/^\d{6}$/.test(pincode)) {
        const result: PincodeValidationResult = {
          valid: true,
          city: 'Unknown',
          state: 'Unknown',
        }
        return result
      }

      const result: PincodeValidationResult = {
        valid: false,
        error: 'Unable to validate pincode at this time'
      }
      return result
    }
  }

  async getDeliveryInfo(pincode: string, retailer: RetailerName): Promise<any> {
    logger.info(`Getting delivery info for ${retailer} to pincode: ${pincode}`)

    // First validate the pincode
    const validation = await this.validatePincode(pincode)
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid pincode')
    }

    // Mock delivery information based on retailer and location
    // In real implementation, this would integrate with retailer APIs
    const deliveryInfo = {
      available: true,
      estimatedDays: this.getEstimatedDeliveryDays(retailer, pincode),
      cost: this.getDeliveryCost(retailer, pincode),
      options: this.getDeliveryOptions(retailer),
      restrictions: this.getDeliveryRestrictions(retailer, pincode),
    }

    return {
      pincode,
      retailer,
      location: {
        city: validation.city,
        state: validation.state,
      },
      delivery: deliveryInfo,
    }
  }

  private getEstimatedDeliveryDays(retailer: RetailerName, pincode: string): number {
    // Mock logic based on retailer and location
    const majorCityPincodes = ['110001', '400001', '560001', '600001', '700001']
    const isMajorCity = majorCityPincodes.includes(pincode)

    const deliveryTimes = {
      amazon: isMajorCity ? 1 : 3,
      flipkart: isMajorCity ? 2 : 4,
      myntra: isMajorCity ? 2 : 5,
      meesho: isMajorCity ? 3 : 7,
    }

    return deliveryTimes[retailer] || 5
  }

  private getDeliveryCost(retailer: RetailerName, pincode: string): number {
    // Mock delivery cost logic
    const majorCityPincodes = ['110001', '400001', '560001', '600001', '700001']
    const isMajorCity = majorCityPincodes.includes(pincode)

    const baseCosts = {
      amazon: 0, // Free delivery
      flipkart: isMajorCity ? 0 : 40,
      myntra: isMajorCity ? 0 : 50,
      meesho: isMajorCity ? 30 : 60,
    }

    return baseCosts[retailer] || 50
  }

  private getDeliveryOptions(retailer: RetailerName): string[] {
    const options = {
      amazon: ['Standard', 'Prime', 'Same Day'],
      flipkart: ['Standard', 'Express', 'Flipkart Plus'],
      myntra: ['Standard', 'Express', 'Try & Buy'],
      meesho: ['Standard', 'Express'],
    }

    return options[retailer] || ['Standard']
  }

  private getDeliveryRestrictions(retailer: RetailerName, pincode: string): string[] {
    // Mock restrictions based on location and retailer
    const restrictions: string[] = []

    // Remote area restrictions
    if (!['110001', '400001', '560001', '600001', '700001'].includes(pincode)) {
      restrictions.push('No same-day delivery')
      
      if (retailer === 'myntra') {
        restrictions.push('Try & Buy not available')
      }
    }

    // Retailer-specific restrictions
    if (retailer === 'meesho') {
      restrictions.push('Cash on delivery only')
    }

    return restrictions
  }
}