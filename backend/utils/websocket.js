const { Server } = require('socket.io');

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://taleglobal.cloud', 'https://www.taleglobal.cloud']
        : "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join candidate-specific room
    socket.on('join-candidate', (candidateId) => {
      socket.join(`candidate-${candidateId}`);
      console.log(`Candidate ${candidateId} joined room`);
    });

    // Join admin room
    socket.on('join-admin', () => {
      socket.join('admin');
      console.log('Admin joined room');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
};

// Emit credit update to specific candidate
const emitCreditUpdate = (candidateId, newCredits) => {
  if (io) {
    io.to(`candidate-${candidateId}`).emit('credit-updated', {
      candidateId,
      credits: newCredits,
      timestamp: new Date()
    });
    console.log(`Credit update sent to candidate ${candidateId}: ${newCredits} credits`);
  }
};

// Emit bulk credit update to multiple candidates
const emitBulkCreditUpdate = (candidateIds, newCredits) => {
  if (io && candidateIds.length > 0) {
    candidateIds.forEach(candidateId => {
      io.to(`candidate-${candidateId}`).emit('credit-updated', {
        candidateId,
        credits: newCredits,
        timestamp: new Date()
      });
    });
    console.log(`Bulk credit update sent to ${candidateIds.length} candidates: ${newCredits} credits`);
  }
};

module.exports = {
  initializeWebSocket,
  getIO,
  emitCreditUpdate,
  emitBulkCreditUpdate
};