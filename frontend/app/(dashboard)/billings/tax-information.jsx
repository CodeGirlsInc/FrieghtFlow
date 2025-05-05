"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Download,
  FileText,
  HelpCircle,
  Upload,
} from "lucide-react";

// Mock data for tax documents
const mockTaxDocuments = [
  {
    id: "tax-1",
    name: "W-9 Form",
    year: "2023",
    dateUploaded: "2023-01-15",
    status: "verified",
  },
  {
    id: "tax-2",
    name: "VAT Registration Certificate",
    year: "2023",
    dateUploaded: "2023-01-15",
    status: "verified",
  },
  {
    id: "tax-3",
    name: "1099-K Form",
    year: "2022",
    dateUploaded: "2022-02-10",
    status: "verified",
  },
];

export default function TaxInformation({ billingData, updateBillingData }) {
  const [taxDocuments, setTaxDocuments] = useState(mockTaxDocuments);
  const [isEditingTaxId, setIsEditingTaxId] = useState(false);
  const [taxId, setTaxId] = useState(billingData.taxId);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleSaveTaxId = () => {
    updateBillingData({ taxId });
    setIsEditingTaxId(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Tax Information</h3>
        <p className="text-sm text-subText mt-1">
          Manage your tax information and documents for billing purposes.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Tax ID / VAT Number</h4>
              <p className="text-sm text-subText mt-1">
                Used for tax exemptions and reporting purposes.
              </p>
            </div>

            {isEditingTaxId ? (
              <div className="flex items-center gap-2">
                <Input
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-[200px]"
                />
                <Button size="sm" onClick={handleSaveTaxId}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTaxId(billingData.taxId);
                    setIsEditingTaxId(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium">{billingData.taxId}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingTaxId(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Tax Documents</h3>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Tax Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <select
                    id="documentType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="w9">W-9 Form</option>
                    <option value="w8ben">W-8BEN Form</option>
                    <option value="vat">VAT Registration Certificate</option>
                    <option value="1099k">1099-K Form</option>
                    <option value="other">Other Tax Document</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxYear">Tax Year</Label>
                  <select
                    id="taxYear"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentFile">File</Label>
                  <Input id="documentFile" type="file" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentNotes">Notes (Optional)</Label>
                  <textarea
                    id="documentNotes"
                    placeholder="Add any additional information about this document"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-subText" />
                      <span>{document.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{document.year}</TableCell>
                  <TableCell>{formatDate(document.dateUploaded)}</TableCell>
                  <TableCell>{getStatusBadge(document.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tax Settings</h3>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Tax Exemption Status</h4>
                <p className="text-sm text-subText mt-1">
                  Your account is currently set up for standard taxation.
                </p>
              </div>
              <Button variant="outline">Request Tax Exemption</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Annual Tax Summary</h4>
                <p className="text-sm text-subText mt-1">
                  Download your annual tax summary for your records.
                </p>
              </div>
              <div className="flex gap-2">
                <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-sm text-subText">
        <HelpCircle className="h-4 w-4" />
        <p>
          Have questions about taxes?{" "}
          <Button variant="link" className="h-auto p-0">
            Contact our support team
          </Button>
        </p>
      </div>
    </div>
  );
}
