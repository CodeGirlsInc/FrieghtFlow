// logging.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: () => uuidv4(),
        customProps: (req) => ({
          requestId: req.id,
          timestamp: new Date().toISOString(),
          route: req.url,
          user: req.user || null,
        }),
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined // Pipe to Logtail/LogDNA here
            : {
                target: 'pino-pretty',
                options: {
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              },
      },
    }),
  ],
})
export class LoggingModule {}
