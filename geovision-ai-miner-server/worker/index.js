// Cloudflare Worker for GeoVision AI Miner Backend
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: ['https://geo-miner.com', 'https://www.geo-miner.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'geovision-ai-miner-api'
  })
})

// API Routes
app.get('/api/v1/projects', async (c) => {
  try {
    // Mock data for now - replace with actual D1 database queries
    const projects = [
      {
        id: 1,
        name: 'Mining Project Alpha',
        description: 'Advanced geological analysis project',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Drill Site Beta',
        description: 'Drill hole analysis and mapping',
        status: 'completed',
        created_at: new Date().toISOString()
      }
    ]
    
    return c.json({
      success: true,
      data: projects,
      count: projects.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

app.post('/api/v1/projects', async (c) => {
  try {
    const body = await c.req.json()
    
    // Validate input
    if (!body.name || !body.description) {
      return c.json({
        success: false,
        error: 'Name and description are required'
      }, 400)
    }
    
    // Mock project creation - replace with actual D1 database insert
    const newProject = {
      id: Date.now(),
      name: body.name,
      description: body.description,
      status: 'active',
      created_at: new Date().toISOString()
    }
    
    return c.json({
      success: true,
      data: newProject
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

app.get('/api/v1/analytics', async (c) => {
  try {
    // Mock analytics data
    const analytics = {
      total_projects: 15,
      active_projects: 8,
      completed_projects: 7,
      total_data_points: 125000,
      ai_models_trained: 3,
      accuracy_rate: 94.2
    }
    
    return c.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

app.get('/api/v1/pricing', async (c) => {
  try {
    const pricingPlans = [
      {
        id: 'starter',
        name: 'Starter',
        price: 29,
        interval: 'month',
        features: [
          'Up to 5 projects',
          'Basic AI analysis',
          'Email support',
          '1GB storage'
        ]
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 99,
        interval: 'month',
        features: [
          'Up to 25 projects',
          'Advanced AI models',
          'Priority support',
          '10GB storage',
          'API access'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 299,
        interval: 'month',
        features: [
          'Unlimited projects',
          'Custom AI models',
          '24/7 support',
          'Unlimited storage',
          'API access',
          'Custom integrations'
        ]
      }
    ]
    
    return c.json({
      success: true,
      data: pricingPlans
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// WebSocket endpoint for real-time features
app.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade')
  
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected websocket', 400)
  }
  
  const webSocketPair = new WebSocketPair()
  const [client, server] = Object.values(webSocketPair)
  
  server.accept()
  
  server.addEventListener('message', (event) => {
    // Handle incoming messages
    const message = JSON.parse(event.data)
    
    // Echo back for now
    server.send(JSON.stringify({
      type: 'echo',
      data: message,
      timestamp: new Date().toISOString()
    }))
  })
  
  server.addEventListener('close', () => {
    console.log('WebSocket connection closed')
  })
  
  return new Response(null, {
    status: 101,
    webSocket: client,
  })
})

// Catch-all route for SPA
app.get('*', (c) => {
  return c.json({
    success: false,
    error: 'Route not found',
    available_routes: [
      'GET /health',
      'GET /api/v1/projects',
      'POST /api/v1/projects',
      'GET /api/v1/analytics',
      'GET /api/v1/pricing',
      'GET /ws'
    ]
  }, 404)
})

export default app 