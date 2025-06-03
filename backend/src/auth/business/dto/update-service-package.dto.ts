import { PartialType } from "@nestjs/mapped-types"
import { CreateServicePackageDto } from "./create-service-package.dto"

export class UpdateServicePackageDto extends PartialType(CreateServicePackageDto) {}
