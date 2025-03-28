"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import DisputesHeader from "@/components/disputes/disputes-header";
import DisputesList from "@/components/disputes/disputes-list";
import DisputeDetails from "@/components/disputes/dispute-details";
import DisputeStats from "@/components/disputes/dispute-stats";
import DisputeFilters from "@/components/disputes/dispute-filters";
import CreateDisputeForm from "@/components/disputes/create-dispute-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for disputes
const mockDisputes = [
  {
    id: "DSP-2023-1001",
    title: "Damaged Cargo - Shipment #SH78923",
    type: "damage",
    status: "open",
    priority: "high",
    dateCreated: "2023-03-15T10:30:00Z",
    dateUpdated: "2023-03-18T14:22:00Z",
    dueDate: "2023-04-15T23:59:59Z",
    createdBy: {
      id: "user-123",
      name: "Alex Thompson",
      email: "alex@globallogistics.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    assignedTo: {
      id: "user-456",
      name: "Sarah Johnson",
      email: "sarah@freightflow.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    customer: {
      id: "cust-789",
      name: "Acme Corporation",
      email: "shipping@acmecorp.com",
    },
    shipment: {
      id: "SH78923",
      origin: "Los Angeles, CA",
      destination: "Chicago, IL",
      date: "2023-03-10T08:00:00Z",
    },
    amount: {
      disputed: 2500.0,
      currency: "USD",
    },
    description:
      "Three pallets of electronics were damaged during transit. Water damage visible on outer packaging. Contents affected include 24 laptop computers and 15 tablet devices.",
    timeline: [
      {
        id: "event-1",
        type: "created",
        date: "2023-03-15T10:30:00Z",
        user: "Alex Thompson",
        description: "Dispute created",
      },
      {
        id: "event-2",
        type: "assigned",
        date: "2023-03-15T11:45:00Z",
        user: "System",
        description: "Assigned to Sarah Johnson",
      },
      {
        id: "event-3",
        type: "comment",
        date: "2023-03-16T09:15:00Z",
        user: "Sarah Johnson",
        description: "Requested additional photos of damaged items",
      },
      {
        id: "event-4",
        type: "attachment",
        date: "2023-03-17T14:30:00Z",
        user: "Alex Thompson",
        description: "Uploaded 5 photos of damaged items",
      },
      {
        id: "event-5",
        type: "status_change",
        date: "2023-03-18T14:22:00Z",
        user: "Sarah Johnson",
        description: "Status changed from 'New' to 'Under Investigation'",
      },
    ],
    comments: [
      {
        id: "comment-1",
        user: {
          id: "user-123",
          name: "Alex Thompson",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-16T09:00:00Z",
        text: "The damage appears to have occurred during the Chicago leg of the journey. Weather conditions were rainy that day.",
      },
      {
        id: "comment-2",
        user: {
          id: "user-456",
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-16T09:15:00Z",
        text: "Could you please provide additional photos of the damaged items? We need close-ups of the affected electronics.",
      },
      {
        id: "comment-3",
        user: {
          id: "user-123",
          name: "Alex Thompson",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-17T14:25:00Z",
        text: "I've uploaded 5 additional photos showing the water damage to the laptops and tablets. You can see the moisture damage on the circuit boards.",
      },
    ],
    attachments: [
      {
        id: "file-1",
        name: "Damage_Report.pdf",
        size: 1240000,
        type: "application/pdf",
        uploadedBy: "Alex Thompson",
        date: "2023-03-15T10:35:00Z",
        url: "#",
      },
      {
        id: "file-2",
        name: "Invoice_SH78923.pdf",
        size: 890000,
        type: "application/pdf",
        uploadedBy: "Alex Thompson",
        date: "2023-03-15T10:36:00Z",
        url: "#",
      },
      {
        id: "file-3",
        name: "Damaged_Cargo_1.jpg",
        size: 2500000,
        type: "image/jpeg",
        uploadedBy: "Alex Thompson",
        date: "2023-03-15T10:40:00Z",
        url: "#",
      },
      {
        id: "file-4",
        name: "Damaged_Cargo_2.jpg",
        size: 2300000,
        type: "image/jpeg",
        uploadedBy: "Alex Thompson",
        date: "2023-03-15T10:41:00Z",
        url: "#",
      },
      {
        id: "file-5",
        name: "Damaged_Electronics_1.jpg",
        size: 3100000,
        type: "image/jpeg",
        uploadedBy: "Alex Thompson",
        date: "2023-03-17T14:30:00Z",
        url: "#",
      },
      {
        id: "file-6",
        name: "Damaged_Electronics_2.jpg",
        size: 2900000,
        type: "image/jpeg",
        uploadedBy: "Alex Thompson",
        date: "2023-03-17T14:31:00Z",
        url: "#",
      },
    ],
  },
  {
    id: "DSP-2023-1002",
    title: "Billing Discrepancy - Invoice #INV-2023-056",
    type: "billing",
    status: "pending",
    priority: "medium",
    dateCreated: "2023-03-20T15:45:00Z",
    dateUpdated: "2023-03-22T11:30:00Z",
    dueDate: "2023-04-20T23:59:59Z",
    createdBy: {
      id: "user-789",
      name: "Michael Chen",
      email: "michael@techinnovate.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    assignedTo: {
      id: "user-101",
      name: "Jessica Williams",
      email: "jessica@freightflow.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    customer: {
      id: "cust-456",
      name: "Tech Innovate Inc.",
      email: "accounts@techinnovate.com",
    },
    shipment: {
      id: "SH79045",
      origin: "Seattle, WA",
      destination: "Boston, MA",
      date: "2023-03-05T09:30:00Z",
    },
    amount: {
      disputed: 750.0,
      currency: "USD",
    },
    description:
      "Invoice #INV-2023-056 includes charges for expedited shipping that was not requested. Standard shipping was the selected option at checkout.",
    timeline: [
      {
        id: "event-1",
        type: "created",
        date: "2023-03-20T15:45:00Z",
        user: "Michael Chen",
        description: "Dispute created",
      },
      {
        id: "event-2",
        type: "assigned",
        date: "2023-03-20T16:30:00Z",
        user: "System",
        description: "Assigned to Jessica Williams",
      },
      {
        id: "event-3",
        type: "comment",
        date: "2023-03-21T10:15:00Z",
        user: "Jessica Williams",
        description: "Requested order confirmation details",
      },
      {
        id: "event-4",
        type: "attachment",
        date: "2023-03-21T14:20:00Z",
        user: "Michael Chen",
        description: "Uploaded order confirmation",
      },
      {
        id: "event-5",
        type: "status_change",
        date: "2023-03-22T11:30:00Z",
        user: "Jessica Williams",
        description: "Status changed from 'New' to 'Under Review'",
      },
    ],
    comments: [
      {
        id: "comment-1",
        user: {
          id: "user-789",
          name: "Michael Chen",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-20T15:50:00Z",
        text: "We were charged for expedited shipping ($750) but we selected standard shipping during checkout. Please review and adjust the invoice accordingly.",
      },
      {
        id: "comment-2",
        user: {
          id: "user-101",
          name: "Jessica Williams",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-21T10:15:00Z",
        text: "Thank you for bringing this to our attention. Could you please provide a copy of your order confirmation showing the selected shipping method?",
      },
      {
        id: "comment-3",
        user: {
          id: "user-789",
          name: "Michael Chen",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-21T14:15:00Z",
        text: "I've attached the order confirmation email which shows standard shipping was selected.",
      },
    ],
    attachments: [
      {
        id: "file-1",
        name: "Invoice_INV-2023-056.pdf",
        size: 950000,
        type: "application/pdf",
        uploadedBy: "Michael Chen",
        date: "2023-03-20T15:47:00Z",
        url: "#",
      },
      {
        id: "file-2",
        name: "Order_Confirmation.pdf",
        size: 780000,
        type: "application/pdf",
        uploadedBy: "Michael Chen",
        date: "2023-03-21T14:20:00Z",
        url: "#",
      },
    ],
  },
  {
    id: "DSP-2023-1003",
    title: "Delayed Delivery - Shipment #SH80157",
    type: "delay",
    status: "resolved",
    priority: "low",
    dateCreated: "2023-03-05T08:20:00Z",
    dateUpdated: "2023-03-12T16:45:00Z",
    dueDate: "2023-04-05T23:59:59Z",
    createdBy: {
      id: "user-202",
      name: "Emily Rodriguez",
      email: "emily@fashionforward.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    assignedTo: {
      id: "user-303",
      name: "David Kim",
      email: "david@freightflow.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    customer: {
      id: "cust-123",
      name: "Fashion Forward Ltd.",
      email: "logistics@fashionforward.com",
    },
    shipment: {
      id: "SH80157",
      origin: "New York, NY",
      destination: "Miami, FL",
      date: "2023-02-28T10:00:00Z",
    },
    amount: {
      disputed: 0,
      currency: "USD",
    },
    description:
      "Shipment was delivered 3 days later than the guaranteed delivery date. This caused delays in our seasonal product launch.",
    resolution: {
      date: "2023-03-12T16:45:00Z",
      type: "credit",
      amount: 350.0,
      description: "Partial refund issued as compensation for the delay",
      resolvedBy: "David Kim",
    },
    timeline: [
      {
        id: "event-1",
        type: "created",
        date: "2023-03-05T08:20:00Z",
        user: "Emily Rodriguez",
        description: "Dispute created",
      },
      {
        id: "event-2",
        type: "assigned",
        date: "2023-03-05T09:15:00Z",
        user: "System",
        description: "Assigned to David Kim",
      },
      {
        id: "event-3",
        type: "comment",
        date: "2023-03-06T11:30:00Z",
        user: "David Kim",
        description: "Investigating the cause of delay",
      },
      {
        id: "event-4",
        type: "status_change",
        date: "2023-03-10T14:20:00Z",
        user: "David Kim",
        description:
          "Status changed from 'Under Investigation' to 'Resolution Proposed'",
      },
      {
        id: "event-5",
        type: "resolution",
        date: "2023-03-12T16:45:00Z",
        user: "David Kim",
        description: "Dispute resolved with partial refund",
      },
    ],
    comments: [
      {
        id: "comment-1",
        user: {
          id: "user-202",
          name: "Emily Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-05T08:25:00Z",
        text: "Our shipment was guaranteed for delivery on March 1st but wasn't delivered until March 4th. This delayed our product launch and caused customer disappointment.",
      },
      {
        id: "comment-2",
        user: {
          id: "user-303",
          name: "David Kim",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-06T11:30:00Z",
        text: "I'm investigating the cause of the delay. Our records show severe weather conditions in the southeastern region during that time period which affected multiple shipments.",
      },
      {
        id: "comment-3",
        user: {
          id: "user-202",
          name: "Emily Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-07T09:45:00Z",
        text: "We understand weather can be a factor, but we paid for guaranteed delivery. We'd like some compensation for the inconvenience caused.",
      },
      {
        id: "comment-4",
        user: {
          id: "user-303",
          name: "David Kim",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-10T14:15:00Z",
        text: "After reviewing your case, I'd like to offer a partial refund of $350 as compensation for the delay. While our guarantee does have exceptions for severe weather, we value your business and want to make this right.",
      },
      {
        id: "comment-5",
        user: {
          id: "user-202",
          name: "Emily Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-12T10:30:00Z",
        text: "Thank you for the offer. We accept the partial refund as resolution for this issue.",
      },
    ],
    attachments: [
      {
        id: "file-1",
        name: "Delivery_Confirmation.pdf",
        size: 1050000,
        type: "application/pdf",
        uploadedBy: "Emily Rodriguez",
        date: "2023-03-05T08:22:00Z",
        url: "#",
      },
      {
        id: "file-2",
        name: "Original_Order_Details.pdf",
        size: 920000,
        type: "application/pdf",
        uploadedBy: "Emily Rodriguez",
        date: "2023-03-05T08:23:00Z",
        url: "#",
      },
      {
        id: "file-3",
        name: "Weather_Report.pdf",
        size: 1850000,
        type: "application/pdf",
        uploadedBy: "David Kim",
        date: "2023-03-06T11:35:00Z",
        url: "#",
      },
    ],
  },
  {
    id: "DSP-2023-1004",
    title: "Missing Items - Shipment #SH81492",
    type: "missing",
    status: "open",
    priority: "high",
    dateCreated: "2023-03-18T13:10:00Z",
    dateUpdated: "2023-03-19T09:25:00Z",
    dueDate: "2023-04-18T23:59:59Z",
    createdBy: {
      id: "user-404",
      name: "Robert Wilson",
      email: "robert@medisupply.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    assignedTo: {
      id: "user-505",
      name: "Lisa Martinez",
      email: "lisa@freightflow.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    customer: {
      id: "cust-234",
      name: "MediSupply Inc.",
      email: "orders@medisupply.com",
    },
    shipment: {
      id: "SH81492",
      origin: "Dallas, TX",
      destination: "Phoenix, AZ",
      date: "2023-03-15T11:30:00Z",
    },
    amount: {
      disputed: 3200.0,
      currency: "USD",
    },
    description:
      "Shipment arrived with one pallet missing. The missing pallet contained medical supplies valued at $3,200.",
    timeline: [
      {
        id: "event-1",
        type: "created",
        date: "2023-03-18T13:10:00Z",
        user: "Robert Wilson",
        description: "Dispute created",
      },
      {
        id: "event-2",
        type: "assigned",
        date: "2023-03-18T14:05:00Z",
        user: "System",
        description: "Assigned to Lisa Martinez",
      },
      {
        id: "event-3",
        type: "comment",
        date: "2023-03-19T09:25:00Z",
        user: "Lisa Martinez",
        description: "Requested inventory list and shipping manifest",
      },
    ],
    comments: [
      {
        id: "comment-1",
        user: {
          id: "user-404",
          name: "Robert Wilson",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-18T13:15:00Z",
        text: "We received our shipment today but one pallet is missing. The shipment should have contained 4 pallets but only 3 were delivered. The missing pallet contains critical medical supplies that we need urgently.",
      },
      {
        id: "comment-2",
        user: {
          id: "user-505",
          name: "Lisa Martinez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-19T09:25:00Z",
        text: "I'm sorry to hear about the missing pallet. Could you please provide a detailed inventory list of what was on the missing pallet and a copy of the shipping manifest showing 4 pallets were supposed to be delivered?",
      },
    ],
    attachments: [
      {
        id: "file-1",
        name: "Delivery_Receipt.pdf",
        size: 980000,
        type: "application/pdf",
        uploadedBy: "Robert Wilson",
        date: "2023-03-18T13:12:00Z",
        url: "#",
      },
      {
        id: "file-2",
        name: "Packing_List.pdf",
        size: 1120000,
        type: "application/pdf",
        uploadedBy: "Robert Wilson",
        date: "2023-03-18T13:13:00Z",
        url: "#",
      },
      {
        id: "file-3",
        name: "Photo_Delivered_Pallets.jpg",
        size: 3500000,
        type: "image/jpeg",
        uploadedBy: "Robert Wilson",
        date: "2023-03-18T13:14:00Z",
        url: "#",
      },
    ],
  },
  {
    id: "DSP-2023-1005",
    title: "Incorrect Routing - Shipment #SH82015",
    type: "routing",
    status: "pending",
    priority: "medium",
    dateCreated: "2023-03-22T10:05:00Z",
    dateUpdated: "2023-03-23T15:40:00Z",
    dueDate: "2023-04-22T23:59:59Z",
    createdBy: {
      id: "user-606",
      name: "Jennifer Lee",
      email: "jennifer@organicfoods.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    assignedTo: {
      id: "user-707",
      name: "Thomas Brown",
      email: "thomas@freightflow.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    customer: {
      id: "cust-345",
      name: "Organic Foods Co.",
      email: "shipping@organicfoods.com",
    },
    shipment: {
      id: "SH82015",
      origin: "Portland, OR",
      destination: "San Francisco, CA",
      date: "2023-03-20T09:45:00Z",
    },
    amount: {
      disputed: 1200.0,
      currency: "USD",
    },
    description:
      "Shipment was incorrectly routed through Salt Lake City, adding 2 days to delivery time. This caused spoilage of perishable organic produce.",
    timeline: [
      {
        id: "event-1",
        type: "created",
        date: "2023-03-22T10:05:00Z",
        user: "Jennifer Lee",
        description: "Dispute created",
      },
      {
        id: "event-2",
        type: "assigned",
        date: "2023-03-22T11:30:00Z",
        user: "System",
        description: "Assigned to Thomas Brown",
      },
      {
        id: "event-3",
        type: "comment",
        date: "2023-03-23T09:15:00Z",
        user: "Thomas Brown",
        description: "Investigating routing issue",
      },
      {
        id: "event-4",
        type: "status_change",
        date: "2023-03-23T15:40:00Z",
        user: "Thomas Brown",
        description: "Status changed from 'New' to 'Under Investigation'",
      },
    ],
    comments: [
      {
        id: "comment-1",
        user: {
          id: "user-606",
          name: "Jennifer Lee",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-22T10:10:00Z",
        text: "Our shipment of organic produce was supposed to go directly from Portland to San Francisco, but it was routed through Salt Lake City. This added 2 days to the transit time, causing approximately 30% of our produce to spoil. We're seeking compensation for the lost product value of $1,200.",
      },
      {
        id: "comment-2",
        user: {
          id: "user-707",
          name: "Thomas Brown",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-23T09:15:00Z",
        text: "I'm investigating why your shipment was routed through Salt Lake City. Our records show this was not the planned route. I'll check with our operations team to determine what happened and get back to you as soon as possible.",
      },
      {
        id: "comment-3",
        user: {
          id: "user-606",
          name: "Jennifer Lee",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        date: "2023-03-23T11:20:00Z",
        text: "Thank you for looking into this. I've attached photos of the spoiled produce and our inventory loss report.",
      },
    ],
    attachments: [
      {
        id: "file-1",
        name: "Original_Routing_Plan.pdf",
        size: 1050000,
        type: "application/pdf",
        uploadedBy: "Jennifer Lee",
        date: "2023-03-22T10:07:00Z",
        url: "#",
      },
      {
        id: "file-2",
        name: "Tracking_History.pdf",
        size: 890000,
        type: "application/pdf",
        uploadedBy: "Jennifer Lee",
        date: "2023-03-22T10:08:00Z",
        url: "#",
      },
      {
        id: "file-3",
        name: "Spoiled_Produce_1.jpg",
        size: 2800000,
        type: "image/jpeg",
        uploadedBy: "Jennifer Lee",
        date: "2023-03-23T11:18:00Z",
        url: "#",
      },
      {
        id: "file-4",
        name: "Spoiled_Produce_2.jpg",
        size: 2600000,
        type: "image/jpeg",
        uploadedBy: "Jennifer Lee",
        date: "2023-03-23T11:19:00Z",
        url: "#",
      },
      {
        id: "file-5",
        name: "Inventory_Loss_Report.pdf",
        size: 1350000,
        type: "application/pdf",
        uploadedBy: "Jennifer Lee",
        date: "2023-03-23T11:20:00Z",
        url: "#",
      },
    ],
  },
];

export default function DisputesPage() {
  const [disputes, setDisputes] = useState(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: [],
    type: [],
    priority: [],
    dateRange: null,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Filter disputes based on active filters and search query
  const filteredDisputes = disputes.filter((dispute) => {
    // Filter by status
    if (
      activeFilters.status.length > 0 &&
      !activeFilters.status.includes(dispute.status)
    ) {
      return false;
    }

    // Filter by type
    if (
      activeFilters.type.length > 0 &&
      !activeFilters.type.includes(dispute.type)
    ) {
      return false;
    }

    // Filter by priority
    if (
      activeFilters.priority.length > 0 &&
      !activeFilters.priority.includes(dispute.priority)
    ) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        dispute.id.toLowerCase().includes(query) ||
        dispute.title.toLowerCase().includes(query) ||
        dispute.description.toLowerCase().includes(query) ||
        dispute.customer.name.toLowerCase().includes(query) ||
        dispute.shipment.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate dispute statistics
  const stats = {
    total: disputes.length,
    open: disputes.filter((d) => d.status === "open").length,
    pending: disputes.filter((d) => d.status === "pending").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
    highPriority: disputes.filter((d) => d.priority === "high").length,
    averageResolutionTime: "4.5 days", // This would be calculated from actual data
  };

  const handleDisputeSelect = (dispute) => {
    setSelectedDispute(dispute);
  };

  const handleCreateDispute = (newDispute) => {
    // In a real app, this would make an API call
    const disputeWithId = {
      ...newDispute,
      id: `DSP-2023-${1006 + disputes.length}`,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      status: "open",
      timeline: [
        {
          id: `event-${Date.now()}`,
          type: "created",
          date: new Date().toISOString(),
          user: newDispute.createdBy.name,
          description: "Dispute created",
        },
      ],
      comments: [],
      attachments: [],
    };

    setDisputes([disputeWithId, ...disputes]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateDispute = (updatedDispute) => {
    // In a real app, this would make an API call
    setDisputes(
      disputes.map((d) =>
        d.id === updatedDispute.id
          ? { ...updatedDispute, dateUpdated: new Date().toISOString() }
          : d
      )
    );
    setSelectedDispute(updatedDispute);
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <DisputesHeader
        stats={stats}
        onSearch={handleSearchChange}
        onCreateDispute={() => setIsCreateDialogOpen(true)}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <DisputeFilters
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
          <div className="mt-6">
            <DisputeStats stats={stats} />
          </div>
        </div>

        <div className="md:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All Disputes</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <DisputesList
                  disputes={filteredDisputes}
                  onSelectDispute={handleDisputeSelect}
                  selectedDisputeId={selectedDispute?.id}
                />
              </Card>
            </TabsContent>

            <TabsContent value="open">
              <Card>
                <DisputesList
                  disputes={filteredDisputes.filter((d) => d.status === "open")}
                  onSelectDispute={handleDisputeSelect}
                  selectedDisputeId={selectedDispute?.id}
                />
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card>
                <DisputesList
                  disputes={filteredDisputes.filter(
                    (d) => d.status === "pending"
                  )}
                  onSelectDispute={handleDisputeSelect}
                  selectedDisputeId={selectedDispute?.id}
                />
              </Card>
            </TabsContent>

            <TabsContent value="resolved">
              <Card>
                <DisputesList
                  disputes={filteredDisputes.filter(
                    (d) => d.status === "resolved"
                  )}
                  onSelectDispute={handleDisputeSelect}
                  selectedDisputeId={selectedDispute?.id}
                />
              </Card>
            </TabsContent>
          </Tabs>

          {selectedDispute && (
            <div className="mt-6">
              <DisputeDetails
                dispute={selectedDispute}
                onUpdateDispute={handleUpdateDispute}
                onClose={() => setSelectedDispute(null)}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Dispute</DialogTitle>
          </DialogHeader>
          <CreateDisputeForm
            onSubmit={handleCreateDispute}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
