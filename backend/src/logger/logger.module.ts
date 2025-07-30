import { Module, Global } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LoggerService } from "./services/logger.service"
import { MetricsService } from "./services/metrics.service"
import { LogFormatter } from "./formatters/log.formatter"
import { DatabaseTransport } from "./transports/database.transport"
import { ElasticsearchTransport } from "./transports/elasticsearch.transport"
import { LoggerController } from "./controllers/logger.controller"
import { LogEntity } from "./entities/log.entity"
import loggerConfig from "./config/logger.config"

@Global()
@Module({
  imports: [ConfigModule.forFeature(loggerConfig), TypeOrmModule.forFeature([LogEntity])],
  providers: [
    LoggerService,
    MetricsService,
    LogFormatter,
    {
      provide: DatabaseTransport,
      useFactory: (logRepository) => {
        return new DatabaseTransport(logRepository)
      },
      inject: ["LogEntityRepository"],
    },
    {
      provide: ElasticsearchTransport,
      useFactory: () => {
        const elasticsearchUrl = process.env.ELASTICSEARCH_URL || "http://localhost:9200"
        return new ElasticsearchTransport(elasticsearchUrl)
      },
    },
    {
      provide: "LogEntityRepository",
      useFactory: (dataSource) => {
        return dataSource.getRepository(LogEntity)
      },
      inject: ["DataSource"],
    },
  ],
  controllers: [LoggerController],
  exports: [LoggerService, MetricsService, LogFormatter],
})
export class LoggerModule {}
