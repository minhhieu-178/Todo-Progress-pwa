import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketUrl = import.meta.env.VITE_API_BASE_URL 
        ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
        : 'http://localhost:5001';
        
      const newSocket = io(socketUrl); 
      setSocket(newSocket);

      newSocket.emit('join_user_room', user._id);

      return () => newSocket.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={ socket }>
      {children}
    </SocketContext.Provider>
  );
};