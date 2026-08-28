import { io, Socket } from 'socket.io-client';
import { useSocketStatusStore } from '../stores/socket-status.store';

// Strip /api/v1 from the API URL to get the socket server origin
const SOCKET_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6000/api/v1').replace('/api/v1', '');

/** How long to wait before retrying after socket.io gives up on its own
 * reconnectionAttempts budget (a "sustained" drop, per FE-109). */
const GIVE_UP_RETRY_DELAY_MS = 30_000;

let socket: Socket | null = null;
let giveUpRetryTimer: ReturnType<typeof setTimeout> | null = null;

export function getSocket(): Socket | null {
  return socket;
}

function clearGiveUpRetryTimer() {
  if (giveUpRetryTimer) {
    clearTimeout(giveUpRetryTimer);
    giveUpRetryTimer = null;
  }
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  // Tear down any stale socket before creating a new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  clearGiveUpRetryTimer();

  useSocketStatusStore.getState().setStatus('connecting');

  socket = io(SOCKET_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 15000,
  });

  socket.on('connect', () => {
    useSocketStatusStore.getState().setStatus('connected');
  });

  socket.on('disconnect', (reason) => {
    // A deliberate disconnect (us calling disconnectSocket(), or the server
    // dropping us intentionally) shouldn't be reported as a lost connection.
    if (reason === 'io client disconnect') {
      useSocketStatusStore.getState().setStatus('disconnected');
      return;
    }
    useSocketStatusStore.getState().setStatus('reconnecting');
  });

  socket.on('reconnect_attempt', () => {
    useSocketStatusStore.getState().setStatus('reconnecting');
  });

  socket.on('connect_error', (err) => {
    console.warn('[socket] connection error:', err.message);
  });

  // socket.io gives up entirely after reconnectionAttempts — that would
  // otherwise leave a sustained outage silent and permanent for the rest of
  // the session. Keep retrying on a slower cadence instead of staying dead.
  socket.io.on('reconnect_failed', () => {
    console.warn('[socket] reconnection attempts exhausted, retrying in 30s');
    clearGiveUpRetryTimer();
    giveUpRetryTimer = setTimeout(() => {
      socket?.connect();
    }, GIVE_UP_RETRY_DELAY_MS);
  });

  return socket;
}

export function disconnectSocket() {
  clearGiveUpRetryTimer();
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  useSocketStatusStore.getState().setStatus('disconnected');
}
