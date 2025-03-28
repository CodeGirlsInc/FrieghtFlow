import { Injectable } from '@nestjs/common';
import { UpdateAdminDto } from '../dtos/update-Admin.dto';
import { CreateAdminDto } from '../dtos/create-Admin.dto';

@Injectable()
export class AdminService {
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds and create a new admin';
  }

  findAll() {
    return `This action returns all created admin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin with its id`;
  }

  update(id: number, updateadminDto: UpdateAdminDto) {
    return `This action updates an #${id} existing admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
