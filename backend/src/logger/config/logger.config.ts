import { registerAs } from "@nestjs/config"
import { LogLevel, LogFormat, type LoggerConfig } from "../interfaces/logger.interface"

export default registerAs(
  "logger",
  (): LoggerConfig => ({
    level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    format: (process.env.LOG_FORMAT as LogFormat) || LogFormat.JSON,
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== "false",
    enableFile: process.env.LOG_ENABLE_FILE === "true",
    enableDatabase: process.env.LOG_ENABLE_DATABASE === "true",
    enableElastic: process.env.LOG_ENABLE_ELASTIC === "true",
    maxFileSize: process.env.LOG_MAX_FILE_SIZE || "20m",
    maxFiles: Number.parseInt(process.env.LOG_MAX_FILES || "14"),
    datePattern: process.env.LOG_DATE_PATTERN || "YYYY-MM-DD",
    colorize: process.env.NODE_ENV !== "production",
    prettyPrint: process.env.NODE_ENV === "development",
    sanitizeFields: (process.env.LOG_SANITIZE_FIELDS || "password,token,secret,key,authorization").split(","),
    maskSensitiveData: process.env.LOG_MASK_SENSITIVE !== "false",
    enableMetrics: process.env.LOG_ENABLE_METRICS === "true",
    enableTracing: process.env.LOG_ENABLE_TRACING === "true",
    enableProfiling: process.env.LOG_ENABLE_PROFILING === "true",
    bufferSize: Number.parseInt(process.env.LOG_BUFFER_SIZE || "1000"),
    flushInterval: Number.parseInt(process.env.LOG_FLUSH_INTERVAL || "5000"),
    transports: [
      {
        type: "console",
        level: LogLevel.DEBUG,
        enabled: true,
        options: {
          colorize: true,
          timestamp: true,
        },
      },
      {
        type: "file",
        level: LogLevel.INFO,
        enabled: process.env.LOG_ENABLE_FILE === "true",
        options: {
          filename: "logs/freightflow-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "14d",
          zippedArchive: true,
        },
      },
      {
        type: "file",
        level: LogLevel.ERROR,
        enabled: process.env.LOG_ENABLE_FILE === "true",
        options: {
          filename: "logs/freightflow-error-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "30d",
          zippedArchive: true,
        },
      },
      {
        type: "database",
        level: LogLevel.WARN,
        enabled: process.env.LOG_ENABLE_DATABASE === "true",
        options: {
          tableName: "logs",
          batchSize: 100,
          flushInterval: 5000,
        },
      },
      {
        type: "elasticsearch",
        level: LogLevel.INFO,
        enabled: process.env.LOG_ENABLE_ELASTIC === "true",
        options: {
          node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
          index: "freightflow-logs",
          type: "_doc",
        },
      },
    ],
  }),
)
