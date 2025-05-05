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
  Bookmark,
  BookmarkPlus,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Info,
  MapPin,
  Package,
  Share2,
  Shield,
  Star,
  Truck,
  User,
  Check,
} from "lucide-react";

export default function JobDetails({ job, onApply, onSave, onClose }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const getJobTypeBadge = (type) => {
    switch (type) {
      case "long-haul":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Long Haul
          </Badge>
        );
      case "local":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Local
          </Badge>
        );
      case "regional":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Regional
          </Badge>
        );
      case "expedited":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Expedited
          </Badge>
        );
      case "specialized":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Specialized
          </Badge>
        );
      case "drayage":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
            Drayage
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Critical
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            High Urgency
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Medium Urgency
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Low Urgency
          </Badge>
        );
      default:
        return null;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateEarnings = () => {
    // Simple calculation for demonstration
    // In a real app, this would be more sophisticated
    const basePay = job.compensation.amount;
    const fuelCost = Math.round(job.distance * 0.35); // Estimated fuel cost at $0.35/mile
    const expenses = Math.round(job.distance * 0.15); // Other expenses at $0.15/mile

    return {
      basePay,
      fuelCost,
      expenses,
      netEarnings: basePay - fuelCost - expenses,
    };
  };

  const earnings = calculateEarnings();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg font-medium">Job Details</CardTitle>
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
                    <h2 className="text-xl font-bold">{job.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={job.company.logo}
                          alt={job.company.name}
                        />
                        <AvatarFallback>
                          {job.company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-subText">{job.company.name}</span>
                      {job.company.verified && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getJobTypeBadge(job.type)}
                    {job.urgency && getUrgencyBadge(job.urgency)}
                    {job.applied && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Applied
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-subText">
                      Route Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-md mt-1">
                          <MapPin className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <div className="font-medium">Pickup Location</div>
                          <div className="text-sm">
                            {job.locations.pickup.address}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-md mt-1">
                          <MapPin className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium">Delivery Location</div>
                          <div className="text-sm">
                            {job.locations.delivery.address}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Distance:</span>
                        <span>{job.distance} miles</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-subText">
                      Equipment & Cargo
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-md mt-1">
                          <Truck className="h-4 w-4 text-subText" />
                        </div>
                        <div>
                          <div className="font-medium">Required Equipment</div>
                          <div className="text-sm">
                            {job.equipment.type.charAt(0).toUpperCase() +
                              job.equipment.type.slice(1)}
                            {job.equipment.size && ` (${job.equipment.size})`}
                          </div>
                          {job.equipment.requirements &&
                            job.equipment.requirements.length > 0 && (
                              <div className="text-sm text-subText mt-1">
                                {job.equipment.requirements.join(", ")}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-md mt-1">
                          <Package className="h-4 w-4 text-subText" />
                        </div>
                        <div>
                          <div className="font-medium">Cargo Details</div>
                          <div className="text-sm">{job.cargo.type}</div>
                          <div className="text-sm text-subText mt-1">
                            Weight: {job.cargo.weight.toLocaleString()} lbs
                            {job.cargo.dimensions &&
                              ` • Dimensions: ${job.cargo.dimensions}`}
                            {job.cargo.hazardous && ` • Hazardous Material`}
                            {job.cargo.temperature &&
                              ` • Temp: ${job.cargo.temperature}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-subText">
                      Schedule & Compensation
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-md mt-1">
                          <Calendar className="h-4 w-4 text-subText" />
                        </div>
                        <div>
                          <div className="font-medium">Pickup Date</div>
                          <div className="text-sm">
                            {formatDate(job.startDate)}
                          </div>
                          {job.endDate && (
                            <div className="text-sm text-subText mt-1">
                              Delivery by {formatDate(job.endDate)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-md mt-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium">Compensation</div>
                          <div className="text-lg font-bold">
                            {formatCurrency(job.compensation.amount)}
                          </div>
                          <div className="text-sm text-subText mt-1">
                            {job.compensation.type === "fixed"
                              ? "Fixed Rate"
                              : "Per Mile"}{" "}
                            • Payment Terms: {job.compensation.paymentTerms}
                            {job.compensation.fuelSurcharge &&
                              " • Fuel Surcharge Included"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-sm text-subText mb-2">
                    Job Description
                  </h3>
                  <div className="bg-muted p-4 rounded-md">
                    <p>{job.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-subText">Posted</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-subText" />
                      <span>{formatDate(job.datePosted)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-subText">
                      Application Deadline
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-subText" />
                      <span>{formatDate(job.deadline)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-subText">
                      Applications
                    </h3>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-subText" />
                      <span>{job.applicationCount} applicants</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={job.company.logo}
                      alt={job.company.name}
                    />
                    <AvatarFallback>
                      {job.company.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{job.company.name}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{job.company.rating}/5</span>
                      <span className="text-subText">
                        ({job.company.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onSave}>
                    {job.saved ? (
                      <>
                        <Bookmark className="mr-2 h-4 w-4 text-primary" />
                        Saved
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="mr-2 h-4 w-4" />
                        Save Job
                      </>
                    )}
                  </Button>

                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>

                  {!job.applied ? (
                    <Button size="sm" onClick={onApply}>
                      <Truck className="mr-2 h-4 w-4" />
                      Apply Now
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      <Check className="mr-2 h-4 w-4" />
                      Applied
                    </Button>
                  )}
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
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="earnings">Earnings Calculator</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Route Details</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-subText">
                              Total Distance:
                            </span>
                            <span className="font-medium">
                              {job.distance} miles
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-subText">
                              Estimated Driving Time:
                            </span>
                            <span className="font-medium">
                              {Math.ceil(job.distance / 55)} hours
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-subText">Pickup Window:</span>
                            <span className="font-medium">
                              {formatDate(job.startDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-subText">
                              Delivery Window:
                            </span>
                            <span className="font-medium">
                              {formatDate(job.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Payment Details</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-subText">
                              Payment Amount:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(job.compensation.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-subText">Payment Type:</span>
                            <span className="font-medium">
                              {job.compensation.type === "fixed"
                                ? "Fixed Rate"
                                : "Per Mile"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-subText">Payment Terms:</span>
                            <span className="font-medium">
                              {job.compensation.paymentTerms}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-subText">
                              Fuel Surcharge:
                            </span>
                            <span className="font-medium">
                              {job.compensation.fuelSurcharge
                                ? "Included"
                                : "Not Included"}
                            </span>
                          </div>
                          {job.compensation.detention && (
                            <div className="flex justify-between">
                              <span className="text-subText">
                                Detention Pay:
                              </span>
                              <span className="font-medium">
                                {job.compensation.detention}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">About the Company</h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={job.company.logo}
                          alt={job.company.name}
                        />
                        <AvatarFallback>
                          {job.company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-lg">
                          {job.company.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">
                            {job.company.rating}/5
                          </span>
                          <span className="text-subText">
                            ({job.company.reviewCount} reviews)
                          </span>
                          {job.company.verified && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                              <Shield className="mr-1 h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-subText">
                      {job.company.name} is a trusted partner in the freight
                      industry with a strong reputation for fair treatment of
                      independent carriers. They offer consistent loads and
                      timely payments.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="requirements">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Driver Requirements</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-subText">
                              Experience Required:
                            </span>
                            <span className="font-medium">
                              {job.requirements.experience} year
                              {job.requirements.experience !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {job.requirements.certifications &&
                            job.requirements.certifications.length > 0 && (
                              <div>
                                <span className="text-subText">
                                  Required Certifications:
                                </span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {job.requirements.certifications.map(
                                    (cert, index) => (
                                      <Badge key={index} variant="outline">
                                        {cert}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Equipment Requirements</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="space-y-3">
                          <div>
                            <span className="text-subText">
                              Required Equipment:
                            </span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {job.requirements.equipment.map(
                                (equip, index) => (
                                  <Badge key={index} variant="outline">
                                    {equip}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Insurance Requirements</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="space-y-3">
                        <div>
                          <span className="text-subText">
                            Required Insurance:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {job.requirements.insurance.map((ins, index) => (
                              <Badge key={index} variant="outline">
                                {ins}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          Important Note
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          All required certifications and insurance documents
                          must be valid and up-to-date at the time of
                          application. You will be asked to provide proof during
                          the application process.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="earnings">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Earnings Breakdown</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-subText">Base Pay:</span>
                            <span className="font-medium">
                              {formatCurrency(earnings.basePay)}
                            </span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Estimated Fuel Cost:</span>
                            <span>-{formatCurrency(earnings.fuelCost)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Estimated Expenses:</span>
                            <span>-{formatCurrency(earnings.expenses)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Estimated Net Earnings:</span>
                            <span>{formatCurrency(earnings.netEarnings)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-subText">
                            <span>Per Mile Rate:</span>
                            <span>
                              $
                              {(earnings.netEarnings / job.distance).toFixed(2)}
                              /mile
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-subText">
                        * This is an estimate based on average operational
                        costs. Your actual earnings may vary based on your
                        specific expenses and circumstances.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Additional Earnings Potential
                      </h3>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="space-y-3">
                          {job.compensation.detention && (
                            <div className="flex justify-between">
                              <span className="text-subText">
                                Detention Pay:
                              </span>
                              <span className="font-medium">
                                {job.compensation.detention}
                              </span>
                            </div>
                          )}
                          {job.compensation.fuelSurcharge && (
                            <div className="flex justify-between">
                              <span className="text-subText">
                                Fuel Surcharge:
                              </span>
                              <span className="font-medium">Included</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-subText">Payment Terms:</span>
                            <span className="font-medium">
                              {job.compensation.paymentTerms}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                        <div className="flex gap-3">
                          <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800">
                              Earnings Tip
                            </h4>
                            <p className="text-sm text-green-700 mt-1">
                              This job offers a competitive rate of $
                              {(earnings.netEarnings / job.distance).toFixed(2)}
                              /mile, which is above the national average for
                              this type of haul.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="border-t pt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>

            {!job.applied ? (
              <Button onClick={onApply}>
                <Truck className="mr-2 h-4 w-4" />
                Apply Now
              </Button>
            ) : (
              <Button variant="secondary" disabled>
                <Check className="mr-2 h-4 w-4" />
                Applied
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
