"use client";

import React, { useEffect, useState } from 'react';
import { shipmentApi, Shipment, UserRole } from '@/lib/api/shipment';
import { MetricCard } from '@/components/MetricCard';
import { ShipmentCard } from '@/components/ShipmentCard';
import { Map, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const [role] = useState<UserRole>('shipper'); // Mock user role
    const [activeCount, setActiveCount] = useState<number | null>(null);
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [completedCount, setCompletedCount] = useState<number | null>(null);
    const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [active, pending, completed, recent] = await Promise.all([
                    shipmentApi.list({ status: 'in_transit', limit: undefined }),
                    shipmentApi.list({ status: 'pending', limit: undefined }),
                    shipmentApi.list({ status: 'completed', limit: undefined }),
                    shipmentApi.list({ limit: 4 })
                ]);

                // Using length of the results to simulate count
                setActiveCount(active.length);
                setPendingCount(pending.length);
                setCompletedCount(completed.length);
                setRecentShipments(recent);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                // Fallback or error state could be handled here
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const metricLabels = {
        active: role === 'carrier' ? 'Active Jobs' : 'Active Shipments',
        pending: role === 'carrier' ? 'Awaiting Pickup' : 'Awaiting Carrier'
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back. Here's what's happening today.
                    </p>
                </div>
                <div>
                    {role === 'shipper' ? (
                        <Button>+ New Shipment</Button>
                    ) : (
                        <Button variant="default">Browse Marketplace</Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    title={metricLabels.active}
                    value={isLoading ? null : activeCount}
                    icon={Map}
                />
                <MetricCard
                    title={metricLabels.pending}
                    value={isLoading ? null : pendingCount}
                    icon={Clock}
                />
                <MetricCard
                    title="Completed Shipments"
                    value={isLoading ? null : completedCount}
                    icon={CheckCircle}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Recent Shipments</h2>
                    <Button variant="link" className="px-0">View all &rarr;</Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-gray-50/50">
                        Loading recent shipments...
                    </div>
                ) : recentShipments.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {recentShipments.map(shipment => (
                            <ShipmentCard key={shipment.id} shipment={shipment} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border rounded-lg bg-gray-50/50">
                        <h3 className="text-lg font-medium">No Recent Shipments</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                            {role === 'shipper' ? "You don't have any recent shipments." : "You haven't taken any jobs recently."}
                        </p>
                        {role === 'shipper' ? (
                            <Button>Create your first shipment</Button>
                        ) : (
                            <Button>Open Marketplace</Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
