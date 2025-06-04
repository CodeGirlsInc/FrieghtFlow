import { Injectable, type NestMiddleware } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"
import * as bodyParser from "body-parser"

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    bodyParser.raw({ type: "application/json" })(req, res, next)
  }
}
