import { type PipeTransform, Injectable, BadRequestException } from "@nestjs/common"
import { validate as isUUID } from "uuid"

@Injectable()
export class ParseOptionalUUIDPipe implements PipeTransform<string, string | undefined> {
  transform(value: string): string | undefined {
    if (!value) {
      return undefined
    }

    if (!isUUID(value)) {
      throw new BadRequestException("Invalid UUID format")
    }

    return value
  }
}
