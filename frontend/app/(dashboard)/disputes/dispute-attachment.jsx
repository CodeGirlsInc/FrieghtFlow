"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Eye,
  File,
  FileText,
  ImageIcon,
  MoreHorizontal,
  Paperclip,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
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

export default function DisputeAttachments({ attachments }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Attachments</h3>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>

      {attachments.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden md:table-cell">
                  Uploaded By
                </TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attachments.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{getFileIcon(file.type)}</TableCell>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {file.uploadedBy}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(file.date)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatFileSize(file.size)}
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
                        {file.type.startsWith("image/") && (
                          <DropdownMenuItem onClick={() => handlePreview(file)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Preview</span>
                          </DropdownMenuItem>
                        )}
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Paperclip className="h-6 w-6 text-subText" />
          </div>
          <h3 className="font-medium mb-2">No attachments yet</h3>
          <p className="text-sm text-subText mb-4">
            Upload files related to this dispute
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Files
          </Button>
        </div>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        {selectedFile && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedFile.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-4">
              <img
                src={
                  selectedFile.url || "/placeholder.svg?height=400&width=600"
                }
                alt={selectedFile.name}
                className="max-h-[500px] object-contain"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
