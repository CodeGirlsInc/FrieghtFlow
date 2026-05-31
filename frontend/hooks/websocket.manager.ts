import { io, Socket } from "socket.io-client";

import {
  ConnectionStatus,
} from "./websocket.types";

import {
  RECONNECT_DELAYS,
} from "./websocket.constants";

class WebSocketManager {

  private socket:
    Socket | null = null;

  private reconnectAttempt = 0;

  private status:
    ConnectionStatus =
      "disconnected";

  private listeners =
    new Set<
      (
        status:
          ConnectionStatus
      ) => void
    >();

  connect(token: string) {

    if (
      this.socket?.connected
    ) {
      return this.socket;
    }

    this.socket = io(
      process.env
        .NEXT_PUBLIC_WS_URL!,
      {
        autoConnect: true,

        transports: [
          "websocket",
        ],

        auth: {
          token,
        },

        reconnection: false,
      }
    );

    this.registerLifecycle();

    return this.socket;
  }

  private registerLifecycle() {

    if (!this.socket) {
      return;
    }

    this.socket.on(
      "connect",
      () => {
        this.reconnectAttempt = 0;

        this.updateStatus(
          "connected"
        );
      }
    );

    this.socket.on(
      "disconnect",
      () => {
        this.updateStatus(
          "reconnecting"
        );

        this.scheduleReconnect();
      }
    );
  }

  private scheduleReconnect() {

    const delay =
      RECONNECT_DELAYS[
        Math.min(
          this.reconnectAttempt,
          RECONNECT_DELAYS.length -
            1
        )
      ];

    this.reconnectAttempt++;

    setTimeout(() => {

      this.socket?.connect();

    }, delay);
  }

  private updateStatus(
    status: ConnectionStatus
  ) {
    this.status = status;

    this.listeners.forEach(
      (listener) =>
        listener(status)
    );
  }

  onStatusChange(
    listener: (
      status:
        ConnectionStatus
    ) => void
  ) {
    this.listeners.add(
      listener
    );

    return () => {
      this.listeners.delete(
        listener
      );
    };
  }

  getStatus() {
    return this.status;
  }

  getSocket() {
    return this.socket;
  }
}

export const websocketManager =
  new WebSocketManager();