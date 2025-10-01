import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common";
import { GoodsTrackingService } from "./goods-tracking.service";
import { CreateGoodsItemDto } from "./dto/create-goods-item.dto";
import { UpdateGoodsItemDto } from "./dto/update-goods-item.dto";
import { GoodsStatus } from "./entities/goods-item.entity";

@Controller("goods-tracking")
export class GoodsTrackingController {
  constructor(private readonly goodsService: GoodsTrackingService) {}

  @Post()
  create(@Body() createDto: CreateGoodsItemDto) {
    return this.goodsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.goodsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.goodsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: UpdateGoodsItemDto) {
    return this.goodsService.update(id, updateDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.goodsService.remove(id);
  }

  @Get("status/:status")
  findByStatus(@Param("status") status: GoodsStatus) {
    return this.goodsService.findByStatus(status);
  }
}
