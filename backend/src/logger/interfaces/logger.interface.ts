export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  traceId?: string
  spanId?: string
  operation?: string
  module?: string
  component?: string
  version?: string
  environment?: string
  timestamp?: Date
  metadata?: Record<string, any>
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  duration?: number
  tags?: string[]
  sensitive?: boolean
}

export interface LoggerConfig {
  level: LogLevel
  format: LogFormat
  transports: LogTransportConfig[]
  enableConsole: boolean
  enableFile: boolean
  enableDatabase: boolean
  enableElastic: boolean
  maxFileSize: string
  maxFiles: number
  datePattern: string
  colorize: boolean
  prettyPrint: boolean
  sanitizeFields: string[]
  maskSensitiveData: boolean
  enableMetrics: boolean
  enableTracing: boolean
  enableProfiling: boolean
  bufferSize: number
  flushInterval: number
}

export interface LogTransportConfig {
  type: "console" | "file" | "database" | "elasticsearch" | "http" | "slack"
  level: LogLevel
  options: Record<string, any>
  enabled: boolean
}

export interface LogMetrics {
  totalLogs: number
  logsByLevel: Record<LogLevel, number>
  errorRate: number
  averageResponseTime: number
  peakMemoryUsage: number
  activeConnections: number
  lastLogTime: Date
}

export interface ILoggerService {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
  fatal(message: string, error?: Error, context?: LogContext): void
  log(entry: LogEntry): void
  profile(id: string, message?: string, context?: LogContext): void
  startTimer(label: string): () => void
  getMetrics(): LogMetrics
  flush(): Promise<void>
  close(): Promise<void>
}

export enum LogLevel {
  FATAL = "fatal",
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
}

export enum LogFormat {
  JSON = "json",
  SIMPLE = "simple",
  COMBINED = "combined",
  CUSTOM = "custom",
}

export interface DatabaseLogEntry {
  id?: number
  level: string
  message: string
  context: string
  error: string
  timestamp: Date
  userId?: string
  sessionId?: string
  requestId?: string
  traceId?: string
  module?: string
  component?: string
  duration?: number
  tags: string
  metadata: string
  environment: string
  version: string
  hostname: string
  processId: number
  threadId?: string
  memoryUsage?: number
  cpuUsage?: number
}
