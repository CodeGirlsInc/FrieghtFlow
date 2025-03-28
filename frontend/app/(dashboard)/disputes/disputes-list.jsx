"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DisputesList({
  disputes,
  onSelectDispute,
  selectedDisputeId,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(disputes.length / itemsPerPage);

  const paginatedDisputes = disputes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">Open</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Resolved
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Low
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "damage":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Damage
          </Badge>
        );
      case "billing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Billing
          </Badge>
        );
      case "delay":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Delay
          </Badge>
        );
      case "missing":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Missing Items
          </Badge>
        );
      case "routing":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
            Routing
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Other
          </Badge>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Customer</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Priority</TableHead>
              <TableHead className="hidden md:table-cell">
                Assigned To
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDisputes.length > 0 ? (
              paginatedDisputes.map((dispute) => (
                <TableRow
                  key={dispute.id}
                  className={`cursor-pointer ${
                    selectedDisputeId === dispute.id ? "bg-muted/50" : ""
                  }`}
                  onClick={() => onSelectDispute(dispute)}
                >
                  <TableCell className="font-medium">{dispute.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{dispute.title}</div>
                    <div className="text-sm text-subText md:hidden">
                      {dispute.customer.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {dispute.customer.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getTypeBadge(dispute.type)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(dispute.dateCreated)}
                  </TableCell>
                  <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getPriorityBadge(dispute.priority)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={dispute.assignedTo.avatar}
                          alt={dispute.assignedTo.name}
                        />
                        <AvatarFallback>
                          {dispute.assignedTo.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{dispute.assignedTo.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDispute(dispute);
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No disputes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {disputes.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-subText">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, disputes.length)}
            </span>{" "}
            of <span className="font-medium">{disputes.length}</span> disputes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
