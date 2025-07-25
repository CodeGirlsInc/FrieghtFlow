import { Injectable, type OnModuleDestroy } from "@nestjs/common"
import { Client } from "@elastic/elasticsearch"
import type { LogEntry } from "../interfaces/logger.interface"
import * as os from "os"

@Injectable()
export class ElasticsearchTransport implements OnModuleDestroy {
  private client: Client
  private buffer: any[] = []
  private flushTimer: NodeJS.Timeout
  private readonly batchSize: number
  private readonly flushInterval: number
  private readonly indexName: string

  constructor(elasticsearchUrl: string, indexName = "freightflow-logs", batchSize = 100, flushInterval = 5000) {
    this.client = new Client({ node: elasticsearchUrl })
    this.indexName = indexName
    this.batchSize = batchSize
    this.flushInterval = flushInterval
    this.startFlushTimer()
    this.ensureIndexExists()
  }

  async log(entry: LogEntry): Promise<void> {
    const document = this.createDocument(entry)
    this.buffer.push(document)

    if (this.buffer.length >= this.batchSize) {
      await this.flush()
    }
  }

  private createDocument(entry: LogEntry): any {
    return {
      "@timestamp": new Date().toISOString(),
      level: entry.level,
      message: entry.message,
      context: entry.context || {},
      error: entry.error
        ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          }
        : undefined,
      duration: entry.duration,
      tags: entry.tags || [],
      sensitive: entry.sensitive || false,
      hostname: os.hostname(),
      processId: process.pid,
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "1.0.0",
      application: "freightflow",
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    }
  }

  private async ensureIndexExists(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName })

      if (!exists) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                "@timestamp": { type: "date" },
                level: { type: "keyword" },
                message: { type: "text" },
                "context.userId": { type: "keyword" },
                "context.requestId": { type: "keyword" },
                "context.traceId": { type: "keyword" },
                "context.module": { type: "keyword" },
                "context.component": { type: "keyword" },
                hostname: { type: "keyword" },
                environment: { type: "keyword" },
                version: { type: "keyword" },
                application: { type: "keyword" },
                duration: { type: "integer" },
                tags: { type: "keyword" },
                sensitive: { type: "boolean" },
              },
            },
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1,
              "index.lifecycle.name": "freightflow-logs-policy",
              "index.lifecycle.rollover_alias": "freightflow-logs",
            },
          },
        })
      }
    } catch (error) {
      console.error("Failed to ensure Elasticsearch index exists:", error)
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      if (this.buffer.length > 0) {
        await this.flush()
      }
    }, this.flushInterval)
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return
    }

    const documentsToIndex = [...this.buffer]
    this.buffer = []

    try {
      const body = documentsToIndex.flatMap((doc) => [{ index: { _index: this.indexName } }, doc])

      await this.client.bulk({ body })
    } catch (error) {
      console.error("Failed to index logs to Elasticsearch:", error)
      // Re-add failed documents to buffer for retry
      this.buffer.unshift(...documentsToIndex)
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    await this.flush()
    await this.client.close()
  }

  async search(query: any): Promise<any> {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: query,
      })
      return response.body
    } catch (error) {
      console.error("Elasticsearch search failed:", error)
      throw error
    }
  }

  async createDashboard(): Promise<void> {
    // Create Kibana dashboard for log visualization
    const dashboardConfig = {
      version: "7.10.0",
      objects: [
        {
          id: "freightflow-logs-overview",
          type: "dashboard",
          attributes: {
            title: "FreightFlow Logs Overview",
            description: "Overview of FreightFlow application logs",
            panelsJSON: JSON.stringify([
              {
                gridData: { x: 0, y: 0, w: 24, h: 15 },
                panelIndex: "1",
                embeddableConfig: {},
                panelRefName: "panel_1",
              },
            ]),
            timeRestore: false,
            version: 1,
          },
        },
      ],
    }

    // This would typically be sent to Kibana's saved objects API
    console.log("Dashboard configuration created:", dashboardConfig)
  }
}
