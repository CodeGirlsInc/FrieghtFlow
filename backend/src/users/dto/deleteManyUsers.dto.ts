import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteManyUsersDto {
  @ApiProperty({
    type: 'array',
    required: true,
    items: {
      type: 'string',
    },
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  id: string[];
}
