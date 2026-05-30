export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "reconnecting";

export type EventHandler<T = unknown> = (
  payload: T
) => void;

export interface WebSocketHook {
  connectionStatus: ConnectionStatus;

  subscribe: (
    event: string,
    handler: EventHandler
  ) => void;

  unsubscribe: (
    event: string,
    handler: EventHandler
  ) => void;

  emit: (
    event: string,
    payload?: unknown
  ) => void;
}

export interface ShipmentUpdate {
  shipmentId: string;

  status: string;

  timestamp: string;

  metadata?: Record<
    string,
    unknown
  >;
}