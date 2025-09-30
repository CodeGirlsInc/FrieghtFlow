import { Injectable } from '@nestjs/common';
import { CreateEmissionDto } from './dto/create-emission.dto';
import { UpdateEmissionDto } from './dto/update-emission.dto';

@Injectable()
export class EmissionService {
  create(createEmissionDto: CreateEmissionDto) {
    return 'This action adds a new emission';
  }

  findAll() {
    return `This action returns all emission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} emission`;
  }

  update(id: number, updateEmissionDto: UpdateEmissionDto) {
    return `This action updates a #${id} emission`;
  }

  remove(id: number) {
    return `This action removes a #${id} emission`;
  }
}
