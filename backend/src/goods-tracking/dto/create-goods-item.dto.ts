import { GoodsStatus } from "../entities/goods-item.entity";

export class CreateGoodsItemDto {
  uniqueIdentifier: string;
  quantity: number;
  status?: GoodsStatus;
  description?: string;
  warehouseId?: string;
  shipmentId?: string;
}
