import { io, Socket } from 'socket.io-client';

// Strip /api/v1 from the API URL to get the socket server origin
const SOCKET_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6000/api/v1').replace('/api/v1', '');

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  // Tear down any stale socket before creating a new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
