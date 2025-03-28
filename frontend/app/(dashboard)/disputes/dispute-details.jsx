"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Link,
  Paperclip,
  RefreshCw,
  Send,
  Truck,
  User,
} from "lucide-react";
import DisputeTimeline from "@/components/disputes/dispute-timeline";
import DisputeComments from "@/components/disputes/dispute-comments";
import DisputeAttachments from "@/components/disputes/dispute-attachments";
import DisputeResolution from "@/components/disputes/dispute-resolution";

export default function DisputeDetails({ dispute, onUpdateDispute, onClose }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");

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
          <Badge className="bg-red-100 text-red-800 border-red-200">
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Low Priority
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
            Damage Claim
          </Badge>
        );
      case "billing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Billing Dispute
          </Badge>
        );
      case "delay":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Delay Claim
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
            Routing Issue
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
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = (newStatus) => {
    const updatedDispute = {
      ...dispute,
      status: newStatus,
      timeline: [
        ...dispute.timeline,
        {
          id: `event-${Date.now()}`,
          type: "status_change",
          date: new Date().toISOString(),
          user: "Current User", // In a real app, this would be the current user
          description: `Status changed from '${dispute.status}' to '${newStatus}'`,
        },
      ],
    };
    onUpdateDispute(updatedDispute);
  };

  const handlePriorityChange = (newPriority) => {
    const updatedDispute = {
      ...dispute,
      priority: newPriority,
      timeline: [
        ...dispute.timeline,
        {
          id: `event-${Date.now()}`,
          type: "priority_change",
          date: new Date().toISOString(),
          user: "Current User", // In a real app, this would be the current user
          description: `Priority changed from '${dispute.priority}' to '${newPriority}'`,
        },
      ],
    };
    onUpdateDispute(updatedDispute);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updatedDispute = {
      ...dispute,
      comments: [
        ...dispute.comments,
        {
          id: `comment-${Date.now()}`,
          user: {
            id: "current-user",
            name: "Current User", // In a real app, this would be the current user
            avatar: "/placeholder.svg?height=40&width=40",
          },
          date: new Date().toISOString(),
          text: newComment,
        },
      ],
      timeline: [
        ...dispute.timeline,
        {
          id: `event-${Date.now()}`,
          type: "comment",
          date: new Date().toISOString(),
          user: "Current User", // In a real app, this would be the current user
          description: "Added a comment",
        },
      ],
    };

    onUpdateDispute(updatedDispute);
    setNewComment("");
  };

  const handleResolveDispute = (resolution) => {
    const updatedDispute = {
      ...dispute,
      status: "resolved",
      resolution: {
        ...resolution,
        date: new Date().toISOString(),
        resolvedBy: "Current User", // In a real app, this would be the current user
      },
      timeline: [
        ...dispute.timeline,
        {
          id: `event-${Date.now()}`,
          type: "resolution",
          date: new Date().toISOString(),
          user: "Current User", // In a real app, this would be the current user
          description: `Dispute resolved with ${resolution.type}`,
        },
      ],
    };

    onUpdateDispute(updatedDispute);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg font-medium">
              Dispute Details
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="pb-3">
            <div className="space-y-6">
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{dispute.title}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-subText">
                      <span>{dispute.id}</span>
                      <span>•</span>
                      <span>Created on {formatDate(dispute.dateCreated)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getTypeBadge(dispute.type)}
                    {getStatusBadge(dispute.status)}
                    {getPriorityBadge(dispute.priority)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-subText">
                      Customer Information
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <User className="h-5 w-5 text-subText" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {dispute.customer.name}
                        </div>
                        <div className="text-sm text-subText">
                          {dispute.customer.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-subText">
                      Shipment Details
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <Truck className="h-5 w-5 text-subText" />
                      </div>
                      <div>
                        <div className="font-medium">{dispute.shipment.id}</div>
                        <div className="text-sm text-subText">
                          {dispute.shipment.origin} →{" "}
                          {dispute.shipment.destination}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-subText">
                      Assigned To
                    </h3>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={dispute.assignedTo.avatar}
                          alt={dispute.assignedTo.name}
                        />
                        <AvatarFallback>
                          {dispute.assignedTo.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {dispute.assignedTo.name}
                        </div>
                        <div className="text-sm text-subText">
                          {dispute.assignedTo.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-sm text-subText mb-2">
                    Description
                  </h3>
                  <div className="bg-muted p-4 rounded-md">
                    <p>{dispute.description}</p>
                  </div>
                </div>

                {dispute.amount.disputed > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-sm text-subText mb-2">
                      Disputed Amount
                    </h3>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="text-xl font-bold">
                        {dispute.amount.currency}{" "}
                        {dispute.amount.disputed.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-subText">
                      Created By
                    </h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={dispute.createdBy.avatar}
                          alt={dispute.createdBy.name}
                        />
                        <AvatarFallback>
                          {dispute.createdBy.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{dispute.createdBy.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-subText">
                      Last Updated
                    </h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-subText" />
                      <span>{formatDateTime(dispute.dateUpdated)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-subText">
                      Due Date
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-subText" />
                      <span>{formatDate(dispute.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {dispute.status !== "resolved" && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <User className="mr-2 h-4 w-4" />
                          Reassign
                        </Button>
                        <Button variant="outline" size="sm">
                          <Link className="mr-2 h-4 w-4" />
                          Link Shipment
                        </Button>
                        <Button variant="outline" size="sm">
                          <Paperclip className="mr-2 h-4 w-4" />
                          Add Attachment
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {dispute.status === "open" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange("pending")}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Mark as Pending
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setActiveTab("resolution")}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Resolve Dispute
                        </Button>
                      </>
                    )}

                    {dispute.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange("open")}
                        >
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Reopen
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setActiveTab("resolution")}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Resolve Dispute
                        </Button>
                      </>
                    )}

                    {dispute.status === "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange("open")}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reopen Dispute
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Priority</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={
                        dispute.priority === "low" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePriorityChange("low")}
                    >
                      Low
                    </Button>
                    <Button
                      variant={
                        dispute.priority === "medium" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePriorityChange("medium")}
                    >
                      Medium
                    </Button>
                    <Button
                      variant={
                        dispute.priority === "high" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePriorityChange("high")}
                    >
                      High
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardContent className="pt-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments ({dispute.comments.length})
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  Attachments ({dispute.attachments.length})
                </TabsTrigger>
                <TabsTrigger value="resolution">Resolution</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <DisputeTimeline timeline={dispute.timeline} />
              </TabsContent>

              <TabsContent value="comments">
                <DisputeComments
                  comments={dispute.comments}
                  newComment={newComment}
                  onNewCommentChange={setNewComment}
                  onAddComment={handleAddComment}
                />
              </TabsContent>

              <TabsContent value="attachments">
                <DisputeAttachments attachments={dispute.attachments} />
              </TabsContent>

              <TabsContent value="resolution">
                <DisputeResolution
                  dispute={dispute}
                  onResolve={handleResolveDispute}
                />
              </TabsContent>
            </Tabs>
          </CardContent>

          {activeTab === "comments" && (
            <CardFooter className="border-t pt-6">
              <div className="flex w-full gap-2">
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  className="self-end"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
}
