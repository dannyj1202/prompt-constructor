import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { deletionsRouter } from './routes/deletions.ts'
import { favoritesRouter } from './routes/favorites.ts'
import { historyRouter } from './routes/history.ts'
import { promptsRouter } from './routes/prompts.ts'
import { skillsRouter } from './routes/skills.ts'
import { syncRouter } from './routes/sync.ts'
import { tasteRouter } from './routes/taste.ts'
import { workflowsRouter } from './routes/workflows.ts'

export const app = new Hono()

// Enable CORS for local dev
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'prompt-constructor-backend',
    time: new Date().toISOString(),
  })
})

// Mount API routes
app.route('/api/prompts', promptsRouter)
app.route('/api/workflows', workflowsRouter)
app.route('/api/skills', skillsRouter)
app.route('/api/taste', tasteRouter)
app.route('/api/favorites', favoritesRouter)
app.route('/api/history', historyRouter)
app.route('/api/deletions', deletionsRouter)
app.route('/api/sync', syncRouter)

const PORT = Number(process.env.PORT) || 3001
// Loopback only: there's no auth, so the API must not be reachable from the network.
const HOSTNAME = '127.0.0.1'

if (process.env.NODE_ENV !== 'test') {
  serve({ fetch: app.fetch, port: PORT, hostname: HOSTNAME }, (info) => {
    console.log(`🚀 Prompt Constructor API Server running at http://${HOSTNAME}:${info.port}`)
  })
}
