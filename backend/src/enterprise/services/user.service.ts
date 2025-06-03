import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import type { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import type { User, UserRole } from "../entities/user.entity"
import type { CreateUserDto } from "../dto/create-user.dto"

@Injectable()
export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new ConflictException("User with this email already exists")
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })

    return await this.userRepository.save(user)
  }

  async findAll(organizationId?: string): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.organization", "organization")
      .leftJoinAndSelect("user.department", "department")

    if (organizationId) {
      query.where("user.organizationId = :organizationId", { organizationId })
    }

    return await query.getMany()
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["organization", "department", "assignedShipments"],
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return user
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ["organization", "department"],
    })
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findOne(id)
    user.role = role
    return await this.userRepository.save(user)
  }

  async assignToDepartment(userId: string, departmentId: string): Promise<User> {
    const user = await this.findOne(userId)
    user.departmentId = departmentId
    return await this.userRepository.save(user)
  }

  async getUsersByRole(organizationId: string, role: UserRole): Promise<User[]> {
    return await this.userRepository.find({
      where: { organizationId, role },
      relations: ["department"],
    })
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id)
    user.isActive = false
    return await this.userRepository.save(user)
  }
}
