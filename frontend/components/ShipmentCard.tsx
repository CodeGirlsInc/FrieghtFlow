import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { Shipment } from '@/lib/api/shipment';

interface ShipmentCardProps {
    shipment: Shipment;
}

export function ShipmentCard({ shipment }: ShipmentCardProps) {
    const getStatusColor = (status: Shipment['status']) => {
        switch (status) {
            case 'in_transit': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-amber-100 text-amber-800';
            case 'delivered': return 'bg-teal-100 text-teal-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{shipment.trackingNumber}</p>
                        <p className="text-xs text-gray-500">{shipment.origin} → {shipment.destination}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Badge className={`${getStatusColor(shipment.status)} border-none`} variant="outline">
                        {formatStatus(shipment.status)}
                    </Badge>
                    <span className="text-xs text-gray-400">{new Date(shipment.date).toLocaleDateString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}
