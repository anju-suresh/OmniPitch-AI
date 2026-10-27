import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to OmniPitch live broadcast server.');
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server.');
    });
  }
  return socket;
};
