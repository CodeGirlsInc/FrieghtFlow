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
  Printer,
  Search,
  SortAsc,
} from "lucide-react";

// Mock data for invoices
const mockInvoices = [
  {
    id: "INV-2023-056",
    date: "2023-03-15",
    amount: "$499.00",
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    description: "Enterprise Plan - Monthly Subscription",
  },
  {
    id: "INV-2023-043",
    date: "2023-02-15",
    amount: "$499.00",
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    description: "Enterprise Plan - Monthly Subscription",
  },
  {
    id: "INV-2023-029",
    date: "2023-01-15",
    amount: "$499.00",
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    description: "Enterprise Plan - Monthly Subscription",
  },
  {
    id: "INV-2022-112",
    date: "2022-12-15",
    amount: "$499.00",
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    description: "Enterprise Plan - Monthly Subscription",
  },
  {
    id: "INV-2022-098",
    date: "2022-11-15",
    amount: "$499.00",
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    description: "Enterprise Plan - Monthly Subscription",
  },
  {
    id: "INV-2022-084",
    date: "2022-10-15",
    amount: "$499.00",
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    description: "Enterprise Plan - Monthly Subscription",
  },
  {
    id: "INV-2022-070",
    date: "2022-09-15",
    amount: "$499.00",
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    description: "Enterprise Plan - Monthly Subscription",
  },
  {
    id: "INV-2022-056",
    date: "2022-08-15",
    amount: "$499.00",
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    description: "Enterprise Plan - Monthly Subscription",
  },
];

export default function InvoiceHistory({ limit }) {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const displayedInvoices = limit ? invoices.slice(0, limit) : invoices;

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Failed
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-medium">
                Invoice History
              </CardTitle>
              {limit && (
                <CardDescription>
                  Showing {limit} of {invoices.length} recent invoices
                </CardDescription>
              )}
            </div>

            {!limit && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
                  <Input
                    type="search"
                    placeholder="Search invoices..."
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
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Payment Method
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {invoice.paymentMethod}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {invoice.amount}
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
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Invoice</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download PDF</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            <span>Print Invoice</span>
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
                View All Invoices
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedInvoice && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Global Logistics Inc.</h3>
                  <p className="text-sm text-subText">123 Shipping Lane</p>
                  <p className="text-sm text-subText">Cargo City, FL 33101</p>
                  <p className="text-sm text-subText">United States</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">INVOICE</h3>
                  <p className="text-sm">{selectedInvoice.id}</p>
                  <p className="text-sm text-subText">
                    Date: {formatDate(selectedInvoice.date)}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
              </div>

              <div className="border-t border-b py-4">
                <h4 className="font-medium mb-2">Invoice Details</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{selectedInvoice.description}</TableCell>
                      <TableCell className="text-right">
                        {selectedInvoice.amount}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {selectedInvoice.amount}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium mb-2">Payment Information</h4>
                  <p className="text-sm">
                    Payment Method: {selectedInvoice.paymentMethod}
                  </p>
                  <p className="text-sm">
                    Payment Date: {formatDate(selectedInvoice.date)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <p className="text-sm">billing@globallogistics.com</p>
                  <p className="text-sm">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
