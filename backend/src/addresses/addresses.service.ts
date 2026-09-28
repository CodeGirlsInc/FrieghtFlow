import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepo.create({ ...dto, userId });
    if (!dto.isDefault) {
      return this.addressRepo.save(address);
    }
    return this.withUserDefaultLock(userId, async (manager) => {
      await manager.update(Address, { userId }, { isDefault: false });
      return manager.save(address);
    });
  }

  findAll(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({ where: { id } });
    if (!address) throw new NotFoundException(`Address ${id} not found`);
    if (address.userId !== userId) throw new ForbiddenException();
    return address;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    // Ownership is checked before any default is cleared, so a user can never
    // clear their own defaults by patching somebody else's address.
    const address = await this.findOne(id, userId);

    if (!dto.isDefault) {
      Object.assign(address, dto);
      return this.addressRepo.save(address);
    }

    // Re-asserting the flag on the address that is already the default is a
    // no-op: clearing and re-setting the same row would only take the lock and
    // write for nothing.
    if (address.isDefault) {
      Object.assign(address, dto);
      return this.addressRepo.save(address);
    }

    return this.withUserDefaultLock(userId, async (manager) => {
      await manager.update(Address, { userId }, { isDefault: false });
      Object.assign(address, dto);
      return manager.save(address);
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressRepo.remove(address);
  }

  /**
   * Clears the user's other defaults and applies `setDefault` as the new
   * default, atomically and serialized per user.
   *
   * A plain transaction is not enough on its own: under READ COMMITTED two
   * concurrent requests both read, both clear, and both set, which leaves two
   * defaults behind. The `pg_advisory_xact_lock` — the same idiom
   * WebhooksService uses to serialize its count+insert check — makes the
   * second request wait for the first to commit, so it observes the cleared
   * state and exactly one default survives. The lock is released with the
   * transaction (xact-scoped), including on rollback.
   *
   * All writes go through the transaction manager: writing through the
   * injected repository would silently escape the transaction (and the lock).
   */
  private async withUserDefaultLock<T>(
    userId: string,
    setDefault: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.addressRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      // Namespaced key so this lock cannot collide with another feature's
      // advisory lock on the same user (hashtext of a bare userId would).
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `address:default:${userId}`,
      ]);
      const result = await setDefault(manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
