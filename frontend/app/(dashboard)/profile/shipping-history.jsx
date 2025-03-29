"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  SortAsc,
} from "lucide-react";

// Mock data for shipping history
const mockShipments = [
  {
    id: "SH-78945",
    origin: "Miami, FL",
    destination: "New York, NY",
    carrier: "FastFreight Inc.",
    status: "Delivered",
    date: "2023-03-15",
    value: "$2,450",
    trackingNumber: "TRK-123456789",
  },
  {
    id: "SH-78946",
    origin: "Los Angeles, CA",
    destination: "Chicago, IL",
    carrier: "Global Logistics",
    status: "In Transit",
    date: "2023-03-18",
    value: "$3,200",
    trackingNumber: "TRK-987654321",
  },
  {
    id: "SH-78947",
    origin: "Seattle, WA",
    destination: "Boston, MA",
    carrier: "OceanWay Shipping",
    status: "Processing",
    date: "2023-03-20",
    value: "$1,800",
    trackingNumber: "TRK-456789123",
  },
  {
    id: "SH-78948",
    origin: "Houston, TX",
    destination: "Atlanta, GA",
    carrier: "FastFreight Inc.",
    status: "Delivered",
    date: "2023-03-10",
    value: "$950",
    trackingNumber: "TRK-789123456",
  },
  {
    id: "SH-78949",
    origin: "San Francisco, CA",
    destination: "Denver, CO",
    carrier: "Mountain Express",
    status: "Delayed",
    date: "2023-03-12",
    value: "$1,650",
    trackingNumber: "TRK-321654987",
  },
  {
    id: "SH-78950",
    origin: "Portland, OR",
    destination: "Phoenix, AZ",
    carrier: "Desert Routes",
    status: "Delivered",
    date: "2023-03-05",
    value: "$2,100",
    trackingNumber: "TRK-654987321",
  },
  {
    id: "SH-78951",
    origin: "Miami, FL",
    destination: "San Diego, CA",
    carrier: "CoastalShip",
    status: "In Transit",
    date: "2023-03-22",
    value: "$4,300",
    trackingNumber: "TRK-852963741",
  },
  {
    id: "SH-78952",
    origin: "Dallas, TX",
    destination: "Minneapolis, MN",
    carrier: "Central Freight",
    status: "Processing",
    date: "2023-03-23",
    value: "$1,950",
    trackingNumber: "TRK-147258369",
  },
];

export default function ShippingHistory({ limit }) {
  const [shipments, setShipments] = useState(mockShipments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const displayedShipments = limit ? shipments.slice(0, limit) : shipments;

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Delayed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-medium">
                Shipping History
              </CardTitle>
              {limit && (
                <CardDescription>
                  Showing {limit} of {shipments.length} recent shipments
                </CardDescription>
              )}
            </div>

            {!limit && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
                  <Input
                    type="search"
                    placeholder="Search shipments..."
                    className="pl-9 w-full md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <SortAsc className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead className="hidden md:table-cell">Origin</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Destination
                  </TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.id}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {shipment.origin}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {shipment.destination}
                    </TableCell>
                    <TableCell>{shipment.carrier}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {shipment.date}
                    </TableCell>
                    <TableCell className="text-right">
                      {shipment.value}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(shipment)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download Invoice</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-subText">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">8</span> of{" "}
                <span className="font-medium">24</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {limit && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm">
                View All Shipments
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedShipment && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Shipment Details - {selectedShipment.id}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-subText">Origin</h3>
                  <p>{selectedShipment.origin}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-subText">
                    Destination
                  </h3>
                  <p>{selectedShipment.destination}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-subText">Carrier</h3>
                  <p>{selectedShipment.carrier}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-subText">Status</h3>
                  <Badge className={getStatusColor(selectedShipment.status)}>
                    {selectedShipment.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-subText">Date</h3>
                  <p>{selectedShipment.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-subText">Value</h3>
                  <p>{selectedShipment.value}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-subText">
                    Tracking Number
                  </h3>
                  <p>{selectedShipment.trackingNumber}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Download Invoice</Button>
              <Button>Track Shipment</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
