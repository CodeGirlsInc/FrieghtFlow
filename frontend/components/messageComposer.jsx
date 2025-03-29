import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Smile, Paperclip, ImageIcon, Mic, Send, X, FileText, Film } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function MessageComposer({ onSendMessage }) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false)
  const fileInputRef = useRef(null)
  
  // Common emojis for quick access
  const commonEmojis = [
    "😊", "😂", "👍", "❤️", "🙏", "👏", "🔥", "✅",
    "⚠️", "❓", "📊", "🚚", "📦", "🗓️", "💰", "📈"
  ]
  
  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value)
  }
  
  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Create attachment objects
    const newAttachments = files.map(file => ({
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.type)
    }))
    
    setAttachments([...attachments, ...newAttachments])
    setShowAttachmentOptions(false)
  }
  
  // Get file type for icon display
  const getFileType = (mimeType) => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.includes("pdf")) return "pdf"
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "excel"
    if (mimeType.includes("document") || mimeType.includes("word")) return "word"
    if (mimeType.includes("video")) return "video"
    return "file"
  }
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }
  
  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id))
  }
  
  // Handle send message
  const handleSendMessage = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments)
      setMessage("")
      setAttachments([])
    }
  }
  
  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  // Render attachment preview
  const renderAttachmentPreview = (attachment) => {
    switch (attachment.type) {
      case "image":
        return (
          <div className="relative group">
            <img 
              src={URL.createObjectURL(attachment.file) || "/placeholder.svg"} 
              alt={attachment.name}
              className="h-16 w-16 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case "pdf":
        return (
          <div className="relative group bg-red-100 h-16 w-16 rounded-md flex items-center justify-center">
            <FileText className="h-8 w-8 text-red-600" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case "excel":
        return (
          <div className="relative group bg-green-100 h-16 w-16 rounded-md flex items-center justify-center">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case "word":
        return (
          <div className="relative group bg-blue-100 h-16 w-16 rounded-md flex items-center justify-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case "video":
        return (
          <div className="relative group bg-purple-100 h-16 w-16 rounded-md flex items-center justify-center">
            <Film className="h-8 w-8 text-purple-600" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      default:
        return (
          <div className="relative group bg-gray-100 h-16 w-16 rounded-md flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-600" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
    }
  }
  
  return (
    <div className="border-t p-3">
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div key={attachment.id}>
              {renderAttachmentPreview(attachment)}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyPress}
            className="min-h-[60px] resize-none pr-10"
          />
          
          <div className="absolute right-3 bottom-3">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="grid grid-cols-8 gap-1">
                  {commonEmojis.map((emoji) => (
                    <Button 
                      key={emoji} 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Popover open={showAttachmentOptions} onOpenChange={setShowAttachmentOptions}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          fileInputRef.current.accept = "image/*"
                          fileInputRef.current.click()
                        }}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          fileInputRef.current.accept = ".pdf,.doc,.docx,.xls,.xlsx"
                          fileInputRef.current.click()
                        }}
                      >
                        <FileText className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Document</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          fileInputRef.current.accept = "video/*"
                          fileInputRef.current.click()
                        }}
                      >
                        <Film className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Video</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </PopoverContent>
          </Popover>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect}
            multiple
          />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Mic className={`h-5 w-5 ${isRecording ? "text-red-500" : ""}`} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Voice Message</DialogTitle>
              </DialogHeader>
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="mb-2">Recording voice message...</p>
                  <div className="flex justify-center">
                    <div className="audio-visualizer">
                      <div className="bar"></div>
                      <div className="bar"></div>
                      <div className="bar"></div>
                      <div className="bar"></div>
                      <div className="bar"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Send</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() && attachments.length === 0}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        .audio-visualizer {
          display: flex;
          align-items: center;
          height: 30px;
          gap: 3px;
        }
        
        .bar {
          width: 4px;
          background-color: hsl(var(--primary));
          border-radius: 3px;
          animation: sound 1.5s infinite ease-in-out;
        }
        
        .bar:nth-child(1) {
          height: 10px;
          animation-delay: 0.1s;
        }
        
        .bar:nth-child(2) {
          height: 20px;
          animation-delay: 0.2s;
        }
        
        .bar:nth-child(3) {
          height: 30px;
          animation-delay: 0.3s;
        }
        
        .bar:nth-child(4) {
          height: 20px;
          animation-delay: 0.4s;
        }
        
        .bar:nth-child(5) {
          height: 10px;
          animation-delay: 0.5s;
        }
        
        @keyframes sound {
          0% {
            transform: scaleY(0.8);
          }
          50% {
            transform: scaleY(1.5);
          }
          100% {
            transform: scaleY(0.8);
          }
        }
      `}</style>
    </div>
  )
}
