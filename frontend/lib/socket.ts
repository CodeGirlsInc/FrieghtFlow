import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  // Strip /api/v1 from the URL as the socket server runs at the root
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

export const connectSocket = (token: string): Socket => {
  if (socket) {
    if (socket.connected) {
      return socket;
    }
    // Tear down any stale disconnected socket before reconnecting
    socket.disconnect();
  }

  const socketUrl = getSocketUrl();

  socket = io(socketUrl, {
    transports: ['websocket'],
    auth: {
      token: `Bearer ${token}`,
    },
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};
