"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  FileUp,
  Paperclip,
  Search,
  Truck,
  User,
} from "lucide-react";

export default function CreateDisputeForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    priority: "medium",
    customer: {
      id: "",
      name: "",
      email: "",
    },
    shipment: {
      id: "",
      origin: "",
      destination: "",
      date: "",
    },
    amount: {
      disputed: 0,
      currency: "USD",
    },
    description: "",
    createdBy: {
      id: "current-user",
      name: "Current User", // In a real app, this would be the current user
      email: "user@freightflow.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    assignedTo: {
      id: "user-101",
      name: "Jessica Williams",
      email: "jessica@freightflow.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  });

  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [shipmentSearchQuery, setShipmentSearchQuery] = useState("");
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [isSearchingShipment, setIsSearchingShipment] = useState(false);

  // Mock data for customer search
  const mockCustomers = [
    {
      id: "cust-123",
      name: "Fashion Forward Ltd.",
      email: "logistics@fashionforward.com",
    },
    {
      id: "cust-234",
      name: "MediSupply Inc.",
      email: "orders@medisupply.com",
    },
    {
      id: "cust-345",
      name: "Organic Foods Co.",
      email: "shipping@organicfoods.com",
    },
    {
      id: "cust-456",
      name: "Tech Innovate Inc.",
      email: "accounts@techinnovate.com",
    },
    {
      id: "cust-789",
      name: "Acme Corporation",
      email: "shipping@acmecorp.com",
    },
  ];

  // Mock data for shipment search
  const mockShipments = [
    {
      id: "SH78923",
      origin: "Los Angeles, CA",
      destination: "Chicago, IL",
      date: "2023-03-10T08:00:00Z",
    },
    {
      id: "SH79045",
      origin: "Seattle, WA",
      destination: "Boston, MA",
      date: "2023-03-05T09:30:00Z",
    },
    {
      id: "SH80157",
      origin: "New York, NY",
      destination: "Miami, FL",
      date: "2023-02-28T10:00:00Z",
    },
    {
      id: "SH81492",
      origin: "Dallas, TX",
      destination: "Phoenix, AZ",
      date: "2023-03-15T11:30:00Z",
    },
    {
      id: "SH82015",
      origin: "Portland, OR",
      destination: "San Francisco, CA",
      date: "2023-03-20T09:45:00Z",
    },
  ];

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value,
      },
    });
  };

  const handleCustomerSelect = (customer) => {
    setFormData({
      ...formData,
      customer,
    });
    setIsSearchingCustomer(false);
    setCustomerSearchQuery("");
  };

  const handleShipmentSelect = (shipment) => {
    setFormData({
      ...formData,
      shipment,
    });
    setIsSearchingShipment(false);
    setShipmentSearchQuery("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const filteredShipments = mockShipments.filter(
    (shipment) =>
      shipment.id.toLowerCase().includes(shipmentSearchQuery.toLowerCase()) ||
      shipment.origin
        .toLowerCase()
        .includes(shipmentSearchQuery.toLowerCase()) ||
      shipment.destination
        .toLowerCase()
        .includes(shipmentSearchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Dispute Title</Label>
          <Input
            id="title"
            placeholder="Enter a descriptive title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Dispute Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
              required
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="damage">Damage Claim</SelectItem>
                <SelectItem value="billing">Billing Dispute</SelectItem>
                <SelectItem value="delay">Delay Claim</SelectItem>
                <SelectItem value="missing">Missing Items</SelectItem>
                <SelectItem value="routing">Routing Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Customer Information</h3>

        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
              <Input
                placeholder="Search for a customer..."
                className="pl-9"
                value={customerSearchQuery}
                onChange={(e) => {
                  setCustomerSearchQuery(e.target.value);
                  setIsSearchingCustomer(true);
                }}
                onFocus={() => setIsSearchingCustomer(true)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSearchingCustomer(!isSearchingCustomer)}
            >
              <User className="h-4 w-4" />
            </Button>
          </div>

          {isSearchingCustomer && customerSearchQuery && (
            <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-[200px] overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-subText">{customer.email}</div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-subText">
                  No customers found
                </div>
              )}
            </div>
          )}
        </div>

        {formData.customer.id && (
          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-center gap-3">
              <div className="bg-background p-2 rounded-md">
                <User className="h-5 w-5 text-subText" />
              </div>
              <div>
                <div className="font-medium">{formData.customer.name}</div>
                <div className="text-sm text-subText">
                  {formData.customer.email}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Shipment Information</h3>

        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
              <Input
                placeholder="Search for a shipment..."
                className="pl-9"
                value={shipmentSearchQuery}
                onChange={(e) => {
                  setShipmentSearchQuery(e.target.value);
                  setIsSearchingShipment(true);
                }}
                onFocus={() => setIsSearchingShipment(true)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSearchingShipment(!isSearchingShipment)}
            >
              <Truck className="h-4 w-4" />
            </Button>
          </div>

          {isSearchingShipment && shipmentSearchQuery && (
            <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-[200px] overflow-y-auto">
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleShipmentSelect(shipment)}
                  >
                    <div className="font-medium">{shipment.id}</div>
                    <div className="text-sm text-subText">
                      {shipment.origin} → {shipment.destination}
                    </div>
                    <div className="text-xs text-subText">
                      {formatDate(shipment.date)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-subText">
                  No shipments found
                </div>
              )}
            </div>
          )}
        </div>

        {formData.shipment.id && (
          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-center gap-3">
              <div className="bg-background p-2 rounded-md">
                <Truck className="h-5 w-5 text-subText" />
              </div>
              <div>
                <div className="font-medium">{formData.shipment.id}</div>
                <div className="text-sm text-subText">
                  {formData.shipment.origin} → {formData.shipment.destination}
                </div>
                <div className="text-sm text-subText">
                  Shipped on {formatDate(formData.shipment.date)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Disputed Amount (Optional)</Label>
          <div className="flex gap-2">
            <Select
              value={formData.amount.currency}
              onValueChange={(value) =>
                handleNestedChange("amount", "currency", value)
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount.disputed}
              onChange={(e) =>
                handleNestedChange(
                  "amount",
                  "disputed",
                  Number.parseFloat(e.target.value) || 0
                )
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
            <Input
              id="dueDate"
              type="date"
              className="pl-9"
              value={new Date(formData.dueDate).toISOString().split("T")[0]}
              onChange={(e) =>
                handleChange("dueDate", new Date(e.target.value).toISOString())
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Provide a detailed description of the dispute..."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          required
        />
      </div>

      <div className="bg-muted p-4 rounded-md">
        <div className="flex items-center gap-3">
          <Paperclip className="h-5 w-5 text-subText" />
          <div className="flex-1">
            <h4 className="font-medium">Attachments</h4>
            <p className="text-sm text-subText">
              Add supporting documents, photos, or other evidence
            </p>
          </div>
          <Button type="button" variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Note</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Creating a dispute will notify the assigned team member and the
              customer. Please ensure all information is accurate before
              submitting.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Dispute</Button>
      </div>
    </form>
  );
}
