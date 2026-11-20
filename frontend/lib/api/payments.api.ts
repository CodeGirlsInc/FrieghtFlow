import { apiClient } from './client';
import { Payment, PaymentStatus } from '../../types/payment.types';

export const paymentApi = {
  getByShipmentId(shipmentId: string): Promise<Payment | null> {
    return apiClient<{ payment: Payment | null }>(
      `/shipments/${shipmentId}/payment`,
    ).then((data) => data.payment);
  },
};
