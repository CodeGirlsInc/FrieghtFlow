import { PartialType } from "@nestjs/mapped-types"
import { CreateCargoMovementDto } from "./create-cargo-movement.dto"

export class UpdateCargoMovementDto extends PartialType(CreateCargoMovementDto) {}
