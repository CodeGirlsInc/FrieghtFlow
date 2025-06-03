import { PartialType } from "@nestjs/mapped-types"
import { CreateBusinessProfileDto } from "./create-business-profile.dto"

export class UpdateBusinessProfileDto extends PartialType(CreateBusinessProfileDto) {}
