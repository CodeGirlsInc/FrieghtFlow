import { GoodsStatus } from "../entities/goods-item.entity";

export class UpdateGoodsItemDto {
  quantity?: number;
  status?: GoodsStatus;
  description?: string;
  warehouseId?: string;
  shipmentId?: string;
}
