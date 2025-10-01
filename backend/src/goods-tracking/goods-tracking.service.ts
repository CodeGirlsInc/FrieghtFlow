import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GoodsItem, GoodsStatus } from "./entities/goods-item.entity";
import { CreateGoodsItemDto } from "./dto/create-goods-item.dto";
import { UpdateGoodsItemDto } from "./dto/update-goods-item.dto";
import { Warehouse } from "../warehouse/entities/warehouse.entity";
import { Shipment } from "../shipment/shipment.entity";

@Injectable()
export class GoodsTrackingService {
  constructor(
    @InjectRepository(GoodsItem)
    private readonly goodsRepo: Repository<GoodsItem>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>
  ) {}

  async create(createDto: CreateGoodsItemDto): Promise<GoodsItem> {
    const goods = this.goodsRepo.create(createDto);
    if (createDto.warehouseId) {
      const warehouse = await this.warehouseRepo.findOne({ where: { id: createDto.warehouseId } });
      if (!warehouse) throw new NotFoundException('Warehouse not found');
      goods.warehouse = warehouse;
    }
    if (createDto.shipmentId) {
      const shipment = await this.shipmentRepo.findOne({ where: { id: createDto.shipmentId } });
      if (!shipment) throw new NotFoundException('Shipment not found');
      goods.shipment = shipment;
    }
    return this.goodsRepo.save(goods);
  }

  async findAll(): Promise<GoodsItem[]> {
    return this.goodsRepo.find({ relations: ["warehouse", "shipment"] });
  }

  async findOne(id: string): Promise<GoodsItem> {
    const item = await this.goodsRepo.findOne({ where: { id }, relations: ["warehouse", "shipment"] });
    if (!item) throw new NotFoundException("Goods item not found");
    return item;
  }

  async update(id: string, updateDto: UpdateGoodsItemDto): Promise<GoodsItem> {
    const item = await this.findOne(id);
    Object.assign(item, updateDto);
    if (updateDto.warehouseId) {
      const warehouse = await this.warehouseRepo.findOne({ where: { id: updateDto.warehouseId } });
      if (!warehouse) throw new NotFoundException('Warehouse not found');
      item.warehouse = warehouse;
    }
    if (updateDto.shipmentId) {
      const shipment = await this.shipmentRepo.findOne({ where: { id: updateDto.shipmentId } });
      if (!shipment) throw new NotFoundException('Shipment not found');
      item.shipment = shipment;
    }
    return this.goodsRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.goodsRepo.remove(item);
  }

  async findByStatus(status: GoodsStatus): Promise<GoodsItem[]> {
    return this.goodsRepo.find({ where: { status }, relations: ["warehouse", "shipment"] });
  }
}
