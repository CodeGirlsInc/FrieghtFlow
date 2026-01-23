export class ProcessPaymentDto {
  freightJobId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  estimatedCost: number;
  paymentMethod: string;
  freightJobAssigned: boolean;
}
