import { Injectable } from '@nestjs/common';
import { CreateFleetDto } from './dto/create-carrier.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';

@Injectable()
export class FleetService {
  create(createFleetDto: CreateFleetDto) {
    return 'This action adds a new fleet';
  }

  findAll() {
    return `This action returns all fleet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fleet`;
  }

  update(id: number, updateFleetDto: UpdateFleetDto) {
    return `This action updates a #${id} fleet`;
  }

  remove(id: number) {
    return `This action removes a #${id} fleet`;
  }
}
