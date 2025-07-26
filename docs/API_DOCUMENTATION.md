# AI Agent Marketplace API Documentation

## Overview

The AI Agent Marketplace API provides endpoints for content management, user authentication, payment processing, and AI agent interactions. The API is built with Node.js, Express, and PostgreSQL.

**Base URL**: `http://localhost:3001/api` (Development)  
**Production URL**: `https://api.aimarketplace.com/api`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "wallet_address": "0x...",
  "role": "content_creator"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "role": "content_creator",
      "wallet_address": "0x...",
      "is_active": true
    },
    "token": "jwt-token-here"
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "role": "content_creator"
    },
    "token": "jwt-token-here"
  }
}
```

#### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "role": "content_creator",
      "wallet_address": "0x...",
      "is_active": true,
      "email_verified": false,
      "profile_data": {}
    }
  }
}
```

#### PUT /auth/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "new_username",
  "wallet_address": "0x...",
  "profile_data": {
    "bio": "Content creator",
    "website": "https://example.com"
  }
}
```

### Content Management

#### POST /content
Create new content for monetization.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "My Article Title",
  "description": "Article description",
  "url": "https://example.com/article",
  "content_type": "article",
  "price_per_access": 0.001,
  "requires_payment": true,
  "metadata": {
    "tags": ["technology", "ai"],
    "category": "blog"
  },
  "access_rules": {
    "allowed_agents": ["openai", "anthropic"],
    "max_accesses": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content created successfully",
  "data": {
    "content": {
      "id": 1,
      "creator_id": 1,
      "title": "My Article Title",
      "description": "Article description",
      "url": "https://example.com/article",
      "content_type": "article",
      "price_per_access": "0.001",
      "is_active": true,
      "requires_payment": true,
      "total_views": 0,
      "paid_views": 0,
      "total_revenue": "0",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /content
Get all content with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `content_type` (string): Filter by content type
- `creator_id` (number): Filter by creator
- `requires_payment` (boolean): Filter by payment requirement
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `search` (string): Search in title and description

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "creator_id": 1,
        "title": "My Article Title",
        "description": "Article description",
        "url": "https://example.com/article",
        "content_type": "article",
        "price_per_access": "0.001",
        "is_active": true,
        "requires_payment": true,
        "total_views": 10,
        "paid_views": 5,
        "total_revenue": "0.005",
        "created_at": "2024-01-01T00:00:00.000Z",
        "creator_username": "username",
        "creator_wallet": "0x..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### GET /content/:id
Get specific content by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "content": {
      "id": 1,
      "creator_id": 1,
      "title": "My Article Title",
      "description": "Article description",
      "url": "https://example.com/article",
      "content_type": "article",
      "price_per_access": "0.001",
      "is_active": true,
      "requires_payment": true,
      "total_views": 10,
      "paid_views": 5,
      "total_revenue": "0.005",
      "created_at": "2024-01-01T00:00:00.000Z",
      "creator_username": "username",
      "creator_wallet": "0x..."
    }
  }
}
```

#### PUT /content/:id
Update content (creator only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price_per_access": 0.002,
  "is_active": true
}
```

#### DELETE /content/:id
Delete content (creator only).

**Headers:** `Authorization: Bearer <token>`

### Content Access

#### POST /content/:id/access
Request access to content (for AI agents).

**Request Body:**
```json
{
  "ai_agent_id": "openai-gpt4",
  "user_id": 1,
  "access_type": "paid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access granted",
  "data": {
    "content_url": "https://example.com/article",
    "access_type": "paid",
    "amount_paid": "0.001"
  }
}
```

### Payments

#### POST /payments/process
Process a payment for content access.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content_id": 1,
  "amount": "0.001",
  "payment_method": "ethereum",
  "transaction_hash": "0x...",
  "ai_agent_id": "openai-gpt4"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transaction_id": "tx_123",
    "status": "confirmed",
    "amount": "0.001",
    "platform_fee": "0.00005",
    "creator_payment": "0.00095"
  }
}
```

#### GET /payments/history
Get payment history for user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): "sent" or "received"

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "transaction_hash": "0x...",
        "from_user_id": 1,
        "to_user_id": 2,
        "content_id": 1,
        "amount": "0.001",
        "currency": "ETH",
        "status": "confirmed",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### AI Agents

#### POST /ai-agents/register
Register a new AI agent.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "agent_id": "openai-gpt4",
  "name": "OpenAI GPT-4",
  "description": "Advanced language model",
  "capabilities": ["text-generation", "content-analysis"],
  "wallet_address": "0x..."
}
```

#### GET /ai-agents
Get all registered AI agents.

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": 1,
        "agent_id": "openai-gpt4",
        "name": "OpenAI GPT-4",
        "description": "Advanced language model",
        "capabilities": ["text-generation", "content-analysis"],
        "wallet_address": "0x...",
        "total_accesses": 100,
        "total_spent": "0.1",
        "registered_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Analytics

#### GET /analytics/creator/:id
Get analytics for a content creator.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (string): "day", "week", "month", "year"
- `start_date` (string): Start date (ISO format)
- `end_date` (string): End date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_content": 10,
      "total_views": 1000,
      "total_revenue": "1.5",
      "active_content": 8
    },
    "revenue_timeline": [
      {
        "date": "2024-01-01",
        "revenue": "0.1",
        "views": 50
      }
    ],
    "top_content": [
      {
        "id": 1,
        "title": "Popular Article",
        "views": 200,
        "revenue": "0.2"
      }
    ],
    "ai_agent_activity": [
      {
        "agent_id": "openai-gpt4",
        "accesses": 100,
        "spent": "0.1"
      }
    ]
  }
}
```

#### GET /analytics/content/:id
Get analytics for specific content.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "content_id": 1,
    "title": "My Article",
    "total_views": 100,
    "paid_views": 50,
    "total_revenue": "0.05",
    "access_logs": [
      {
        "id": 1,
        "ai_agent_id": "openai-gpt4",
        "access_type": "paid",
        "amount_paid": "0.001",
        "accessed_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "daily_stats": [
      {
        "date": "2024-01-01",
        "views": 10,
        "revenue": "0.01"
      }
    ]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 10 requests per minute
- **Content endpoints**: 100 requests per minute
- **Payment endpoints**: 50 requests per minute
- **Analytics endpoints**: 30 requests per minute

## WebSocket Events

For real-time updates, the API supports WebSocket connections:

### Connection
```javascript
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to API');
});
```

### Events

#### content_accessed
Emitted when content is accessed by an AI agent.

```javascript
socket.on('content_accessed', (data) => {
  console.log('Content accessed:', data);
  // data: { content_id, ai_agent_id, amount_paid }
});
```

#### payment_processed
Emitted when a payment is processed.

```javascript
socket.on('payment_processed', (data) => {
  console.log('Payment processed:', data);
  // data: { transaction_id, amount, status }
});
```

#### revenue_updated
Emitted when creator revenue is updated.

```javascript
socket.on('revenue_updated', (data) => {
  console.log('Revenue updated:', data);
  // data: { creator_id, new_total_revenue }
});
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

class AIMarketplaceAPI {
  constructor(baseURL, token) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createContent(contentData) {
    const response = await this.api.post('/content', contentData);
    return response.data;
  }

  async getContent(contentId) {
    const response = await this.api.get(`/content/${contentId}`);
    return response.data;
  }

  async processPayment(paymentData) {
    const response = await this.api.post('/payments/process', paymentData);
    return response.data;
  }
}

// Usage
const api = new AIMarketplaceAPI('http://localhost:3001/api', 'your-token');
const content = await api.createContent({
  title: 'My Article',
  url: 'https://example.com/article',
  price_per_access: 0.001
});
```

### Python

```python
import requests

class AIMarketplaceAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_content(self, content_data):
        response = requests.post(
            f'{self.base_url}/content',
            json=content_data,
            headers=self.headers
        )
        return response.json()
    
    def get_content(self, content_id):
        response = requests.get(
            f'{self.base_url}/content/{content_id}',
            headers=self.headers
        )
        return response.json()

# Usage
api = AIMarketplaceAPI('http://localhost:3001/api', 'your-token')
content = api.create_content({
    'title': 'My Article',
    'url': 'https://example.com/article',
    'price_per_access': 0.001
})
```

## Testing

The API includes comprehensive test coverage. Run tests with:

```bash
# Backend directory
npm test
npm run test:watch
```

Test files are located in `backend/test/` and cover:
- Authentication endpoints
- Content management
- Payment processing
- Analytics
- Error handling
- Rate limiting

## Deployment

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_marketplace
JWT_SECRET=your-secret-key

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your-private-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Server
PORT=3001
NODE_ENV=production
```

### Docker Deployment

```bash
# Build image
docker build -t ai-marketplace-api .

# Run container
docker run -p 3001:3001 --env-file .env ai-marketplace-api
```

### Production Checklist

- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Set up CI/CD pipeline
- [ ] Configure rate limiting
- [ ] Set up error tracking
- [ ] Configure caching (Redis)
- [ ] Set up load balancing
- [ ] Configure security headers 