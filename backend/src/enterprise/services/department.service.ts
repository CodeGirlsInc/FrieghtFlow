import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Department } from "../entities/department.entity"
import type { CreateDepartmentDto } from "../dto/create-department.dto"

@Injectable()
export class DepartmentService {
  constructor(private departmentRepository: Repository<Department>) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(createDepartmentDto)
    return await this.departmentRepository.save(department)
  }

  async findAll(organizationId?: string): Promise<Department[]> {
    const query = this.departmentRepository
      .createQueryBuilder("department")
      .leftJoinAndSelect("department.organization", "organization")
      .leftJoinAndSelect("department.users", "users")
      .leftJoinAndSelect("department.shipments", "shipments")

    if (organizationId) {
      query.where("department.organizationId = :organizationId", { organizationId })
    }

    return await query.getMany()
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ["organization", "users", "shipments"],
    })

    if (!department) {
      throw new NotFoundException("Department not found")
    }

    return department
  }

  async update(id: string, updateData: Partial<CreateDepartmentDto>): Promise<Department> {
    const department = await this.findOne(id)
    Object.assign(department, updateData)
    return await this.departmentRepository.save(department)
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id)
    await this.departmentRepository.remove(department)
  }
}
