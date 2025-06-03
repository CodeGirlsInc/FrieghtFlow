import { PartialType, OmitType } from "@nestjs/mapped-types"
import { CreateShipperDto } from "./create-shipper.dto"

export class UpdateShipperDto extends PartialType(OmitType(CreateShipperDto, ["email", "password"] as const)) {}
