import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RouteOptimizerController } from "./controllers/route-optimizer.controller"
import { RouteOptimizerService } from "./services/route-optimizer.service"
import { RouteStorageService } from "./services/route-storage.service"
import { MapDataService } from "./services/map-data.service"
import { Route } from "./entities/route.entity"
import { RouteCalculation } from "./entities/route-calculation.entity"
import { MapNode } from "./entities/map-node.entity"
import { MapEdge } from "./entities/map-edge.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Route, RouteCalculation, MapNode, MapEdge])],
  controllers: [RouteOptimizerController],
  providers: [RouteOptimizerService, RouteStorageService, MapDataService],
  exports: [RouteOptimizerService, RouteStorageService, MapDataService],
})
export class RouteOptimizerModule {}
