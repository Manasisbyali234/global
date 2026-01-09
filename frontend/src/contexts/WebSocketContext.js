import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Always use localhost for development
    const socketUrl = 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinCandidateRoom = (candidateId) => {
    if (socket && candidateId) {
      socket.emit('join-candidate', candidateId);
      
    }
  };

  const joinAdminRoom = () => {
    if (socket) {
      socket.emit('join-admin');
      
    }
  };

  const value = {
    socket,
    isConnected,
    joinCandidateRoom,
    joinAdminRoom
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
