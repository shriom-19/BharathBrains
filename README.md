# AI Retailer Bot

An intelligent shopping assistant that searches multiple e-commerce platforms and provides AI-powered product recommendations with natural language processing capabilities.

## 🚀 Features

- **Natural Language Search**: Describe products in plain English
- **Multi-Retailer Search**: Search Amazon, Flipkart, Myntra, and Meesho simultaneously
- **AI-Powered Recommendations**: Get intelligent product suggestions with explanations
- **Location-Based Delivery**: Pincode-based delivery validation and estimates
- **Voice Interface**: Speech-to-text input and spoken result summaries
- **Advanced Filtering**: Brand, price, size, color, and specification filters
- **Cross-Retailer Insights**: Compare prices, delivery times, and options
- **User Feedback System**: Rate recommendations to improve future suggestions

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library + fast-check

### Backend (Node.js + Express + TypeScript)
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript for type safety
- **APIs**: RESTful API design
- **Testing**: Jest + Supertest + fast-check
- **Logging**: Winston for structured logging

## 📦 Project Structure

```
ai-retailer-bot/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── store/          # Redux store and slices
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── package.json
├── .env.example            # Environment variables template
└── package.json           # Root package.json for workspace
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for natural language processing)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-retailer-bot
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   
   # Edit .env files with your configuration
   # Required: OPENAI_API_KEY
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts both frontend (http://localhost:3000) and backend (http://localhost:3001) servers.

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend        # Start only frontend
npm run dev:backend         # Start only backend

# Building
npm run build              # Build both applications
npm run build:frontend     # Build frontend only
npm run build:backend      # Build backend only

# Testing
npm run test              # Run all tests
npm run test:frontend     # Run frontend tests
npm run test:backend      # Run backend tests

# Code Quality
npm run lint              # Lint all code
npm run format            # Format code with Prettier
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

#### Frontend (frontend/.env)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_ENABLE_VOICE=true
```

## 🧪 Testing

The project uses a comprehensive testing strategy:

### Unit Testing
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **Coverage**: 80%+ target for critical paths

### Property-Based Testing
- **Framework**: fast-check
- **Purpose**: Test universal properties across all valid inputs
- **Integration**: Runs alongside unit tests

### Running Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Intent Parsing
```http
POST /api/intent/parse
Content-Type: application/json

{
  "query": "Running shoes under ₹3000 for daily jogging"
}
```

#### Product Search
```http
POST /api/search/products
Content-Type: application/json

{
  "description": "Running shoes",
  "pincode": "110001",
  "budget": { "min": 0, "max": 3000 },
  "confidence": 0.85
}
```

#### Pincode Validation
```http
POST /api/pincode/validate
Content-Type: application/json

{
  "pincode": "110001"
}
```

#### User Feedback
```http
POST /api/feedback
Content-Type: application/json

{
  "productId": "amazon-123",
  "type": "relevant",
  "queryId": "query-456"
}
```

## 🔍 Key Features Implementation

### Natural Language Processing
- OpenAI GPT-4 integration for intent parsing
- Fallback rule-based parsing for reliability
- Entity extraction for product details, budget, and features

### Multi-Retailer Search
- Parallel search execution across all retailers
- Individual error handling to prevent cascade failures
- Real-time status indicators for each retailer

### AI Recommendations
- Match score calculation based on query alignment
- Explanation generation for each recommendation
- Product highlighting (Top Pick, Best Value, Fastest Delivery)

### Voice Interface
- Web Speech API integration
- Speech-to-text for product queries
- Text-to-speech for result summaries

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set up Redis for caching
- Configure logging levels

### Docker Support (Future)
```dockerfile
# Dockerfile will be added in future iterations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and formatting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for natural language processing capabilities
- React and Node.js communities for excellent tooling
- E-commerce platforms for product data (used respectfully)

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation above

---

**Built with ❤️ for intelligent shopping experiences**