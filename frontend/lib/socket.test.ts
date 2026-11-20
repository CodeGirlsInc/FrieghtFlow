import { useSocketStatusStore } from '../stores/socket-status.store';

// Minimal fake socket.io-client — captures registered handlers so tests can
// fire them manually, and tracks connect()/disconnect() calls.
class FakeSocket {
  handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  connected = false;
  connect = jest.fn(() => {
    this.connected = true;
  });
  disconnect = jest.fn(() => {
    this.connected = false;
  });
  on(event: string, handler: (...args: unknown[]) => void) {
    (this.handlers[event] ??= []).push(handler);
    return this;
  }
  off = jest.fn();
  emit(event: string, ...args: unknown[]) {
    this.handlers[event]?.forEach((h) => h(...args));
  }
  // socket.io-client exposes the Manager via `.io` — `reconnect_failed` is a
  // Manager-level event.
  io = {
    handlers: {} as Record<string, ((...args: unknown[]) => void)[]>,
    on(event: string, handler: (...args: unknown[]) => void) {
      (this.handlers[event] ??= []).push(handler);
      return this;
    },
    emit(event: string, ...args: unknown[]) {
      this.handlers[event]?.forEach((h) => h(...args));
    },
  };
}

let lastFakeSocket: FakeSocket;
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

import { io } from 'socket.io-client';
import { connectSocket, disconnectSocket } from './socket';

const mockIo = io as jest.MockedFunction<typeof io>;

describe('socket.ts connection status (FE-109)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useSocketStatusStore.setState({ status: 'disconnected' });
    mockIo.mockImplementation(() => {
      lastFakeSocket = new FakeSocket();
      return lastFakeSocket as unknown as ReturnType<typeof io>;
    });
  });

  afterEach(() => {
    disconnectSocket();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('sets status to connecting immediately, then connected on the connect event', () => {
    connectSocket('tok');
    expect(useSocketStatusStore.getState().status).toBe('connecting');

    lastFakeSocket.emit('connect');
    expect(useSocketStatusStore.getState().status).toBe('connected');
  });

  it('sets status to reconnecting on an unexpected disconnect', () => {
    connectSocket('tok');
    lastFakeSocket.emit('connect');

    lastFakeSocket.emit('disconnect', 'transport close');

    expect(useSocketStatusStore.getState().status).toBe('reconnecting');
  });

  it('sets status to disconnected (not reconnecting) on a deliberate client disconnect', () => {
    connectSocket('tok');
    lastFakeSocket.emit('connect');

    lastFakeSocket.emit('disconnect', 'io client disconnect');

    expect(useSocketStatusStore.getState().status).toBe('disconnected');
  });

  it('sets status to reconnecting on each reconnect attempt', () => {
    connectSocket('tok');
    lastFakeSocket.emit('connect');
    lastFakeSocket.emit('disconnect', 'transport close');

    lastFakeSocket.io.emit('reconnect_attempt');

    expect(useSocketStatusStore.getState().status).toBe('reconnecting');
  });

  it('retries after a delay once socket.io gives up on reconnectionAttempts (a sustained drop)', () => {
    connectSocket('tok');
    const socketAtGiveUp = lastFakeSocket;

    socketAtGiveUp.io.emit('reconnect_failed');
    expect(socketAtGiveUp.connect).not.toHaveBeenCalled();

    jest.advanceTimersByTime(30_000);

    expect(socketAtGiveUp.connect).toHaveBeenCalledTimes(1);
  });

  it('disconnectSocket sets status to disconnected and cancels any pending give-up retry', () => {
    connectSocket('tok');
    const socketAtGiveUp = lastFakeSocket;
    socketAtGiveUp.io.emit('reconnect_failed');

    disconnectSocket();
    jest.advanceTimersByTime(30_000);

    expect(useSocketStatusStore.getState().status).toBe('disconnected');
    expect(socketAtGiveUp.connect).not.toHaveBeenCalled();
  });
});
