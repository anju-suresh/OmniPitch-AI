import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from './config/db.js';
import { MatchSimulator } from './services/matchSimulator.js';
import { createMatchRouter } from './routes/matchRoutes.js';
import { createAgentRouter } from './routes/agentRoutes.js';
import { datasetRouter } from './routes/datasetRoutes.js';
import { hasLiveGemini } from './config/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both cwd and backend directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: '*', // Allow connections from frontend dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize match simulator
const simulator = new MatchSimulator(io);

// Connect DB
connectDB();

// API Routes
app.use('/api/match', createMatchRouter(simulator));
app.use('/api/agents', createAgentRouter(simulator));
app.use('/api/datasets', datasetRouter);

// System Health & Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    geminiLive: hasLiveGemini(),
    database: getDBStatus(),
    matchStatus: simulator.matchState.status,
    currentMinute: simulator.matchState.currentMinute,
    scores: {
      arsenal: simulator.matchState.homeScore,
      chelsea: simulator.matchState.awayScore
    }
  });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  // Immediately send current match state
  socket.emit('match:state', simulator.getCurrentState());

  socket.on('simulator:start', () => simulator.start());
  socket.on('simulator:pause', () => simulator.pause());
  socket.on('simulator:reset', () => simulator.reset());
  socket.on('simulator:speed', (multiplier) => simulator.setSpeed(multiplier));

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  ⚽ OMNIPITCH AI BACKEND                      ║
║  Real-Time Sports Intelligence & Multimodal Agentic Platform  ║
╚═══════════════════════════════════════════════════════════════╝
  🚀 Server running on: http://localhost:${PORT}
  📡 WebSocket Server:  Ready on port ${PORT}
  🤖 Gemini AI Status:  ${hasLiveGemini() ? 'LIVE API Connected' : 'Simulated / Hybrid Mode Active'}
  🗄️ Database Status:   ${getDBStatus().type}
  `);
});
