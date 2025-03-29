"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Check,
  Download,
  Eye,
  File,
  FileCog,
  FileText,
  MoreHorizontal,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

// Mock data for documents
const mockDocuments = [
  {
    id: "doc-1",
    name: "Business License.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadDate: "2023-01-15",
    status: "verified",
    category: "legal",
  },
  {
    id: "doc-2",
    name: "Insurance Certificate.pdf",
    type: "PDF",
    size: "1.8 MB",
    uploadDate: "2023-02-10",
    status: "verified",
    category: "insurance",
  },
  {
    id: "doc-3",
    name: "Shipping Contract Template.docx",
    type: "DOCX",
    size: "350 KB",
    uploadDate: "2023-02-22",
    status: "pending",
    category: "contracts",
  },
  {
    id: "doc-4",
    name: "Customs Declaration Form.pdf",
    type: "PDF",
    size: "1.2 MB",
    uploadDate: "2023-03-05",
    status: "verified",
    category: "customs",
  },
  {
    id: "doc-5",
    name: "Carrier Agreement.pdf",
    type: "PDF",
    size: "3.1 MB",
    uploadDate: "2023-03-12",
    status: "rejected",
    category: "contracts",
  },
  {
    id: "doc-6",
    name: "Tax Exemption Certificate.pdf",
    type: "PDF",
    size: "900 KB",
    uploadDate: "2023-03-18",
    status: "verified",
    category: "legal",
  },
];

export default function DocumentsSection() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredDocuments =
    activeTab === "all"
      ? documents
      : documents.filter((doc) => doc.category === activeTab);

  const getDocumentIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "DOCX":
        return <FileCog className="h-8 w-8 text-blue-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="mr-1 h-3 w-3" /> Verified
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="customs">Customs</TabsTrigger>
          </TabsList>
        </Tabs>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="documentName">Document Name</Label>
                <Input id="documentName" placeholder="Enter document name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentCategory">Category</Label>
                <select
                  id="documentCategory"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="legal">Legal</option>
                  <option value="insurance">Insurance</option>
                  <option value="contracts">Contracts</option>
                  <option value="customs">Customs</option>
                  <option value="other">Other</option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  {getDocumentIcon(document.type)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-medium mt-3 truncate" title={document.name}>
                  {document.name}
                </h3>
                <div className="flex items-center justify-between mt-2 text-sm text-subText">
                  <span>{document.size}</span>
                  <span>{document.uploadDate}</span>
                </div>
              </div>
              <div className="border-t p-3 bg-inputBackground flex items-center justify-between">
                {getStatusBadge(document.status)}
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card
          className="border-dashed flex items-center justify-center h-[200px] cursor-pointer"
          onClick={() => setIsUploadDialogOpen(true)}
        >
          <div className="flex flex-col items-center text-subText">
            <Plus className="h-8 w-8 mb-2" />
            <span className="font-medium">Upload New Document</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
