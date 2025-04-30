import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './createuser.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
