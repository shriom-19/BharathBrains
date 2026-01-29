// Test setup for backend
import { jest } from '@jest/globals'

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.REDIS_URL = 'redis://localhost:6379'

// Mock external services
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}))

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  })),
}))

jest.mock('puppeteer', () => ({
  launch: jest.fn(() => ({
    newPage: jest.fn(() => ({
      goto: jest.fn(),
      evaluate: jest.fn(),
      close: jest.fn(),
    })),
    close: jest.fn(),
  })),
}))