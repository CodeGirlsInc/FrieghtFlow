import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule } from "@nestjs/config"

// Entities
import { Organization } from "./entities/organization.entity"
import { User } from "./entities/user.entity"
import { Department } from "./entities/department.entity"
import { LogisticsRoute } from "./entities/logistics-route.entity"
import { Shipment } from "./entities/shipment.entity"

// Services
import { OrganizationService } from "./services/organization.service"
import { UserService } from "./services/user.service"
import { DepartmentService } from "./services/department.service"
import { LogisticsRouteService } from "./services/logistics-route.service"
import { ShipmentService } from "./services/shipment.service"

// Controllers
import { OrganizationController } from "./controllers/organization.controller"
import { UserController } from "./controllers/user.controller"
import { DepartmentController } from "./controllers/department.controller"
import { LogisticsRouteController } from "./controllers/logistics-route.controller"
import { ShipmentController } from "./controllers/shipment.controller"

// Guards
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { RolesGuard } from "./guards/roles.guard"

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Organization, User, Department, LogisticsRoute, Shipment]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "24h" },
    }),
  ],
  controllers: [
    OrganizationController,
    UserController,
    DepartmentController,
    LogisticsRouteController,
    ShipmentController,
  ],
  providers: [
    OrganizationService,
    UserService,
    DepartmentService,
    LogisticsRouteService,
    ShipmentService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [OrganizationService, UserService, DepartmentService, LogisticsRouteService, ShipmentService],
})
export class EnterpriseModule {}
