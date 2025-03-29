import { useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Check, CheckCheck, Clock, Reply, Forward, Copy, Smile, FileText, ImageIcon, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function MessageThread({ messages, onAddReaction }) {
  const messagesEndRef = useRef(null)
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  // Format date for date separators
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    }
  }
  
  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {}
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return Object.entries(groups).map(([date, messages]) => ({
      date: new Date(date),
      messages
    }))
  }
  
  // Get message status icon
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-primary" />
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />
    }
  }
  
  // Render file attachment
  const renderAttachment = (attachment) => {
    switch (attachment.type) {
      case "image":
        return (
          <div className="mt-2 rounded-md overflow-hidden border">
            <img 
              src={attachment.url || "/placeholder.svg?height=200&width=300"} 
              alt={attachment.name}
              className="max-w-xs object-cover"
            />
            <div className="p-2 bg-muted flex items-center justify-between">
              <div className="text-xs truncate">{attachment.name}</div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )
      case "pdf":
        return (
          <div className="mt-2 p-3 rounded-md border flex items-center gap-3 bg-muted/50 max-w-xs">
            <div className="bg-red-100 p-2 rounded-md">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{attachment.name}</div>
              <div className="text-xs text-muted-foreground">{attachment.size}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )
      case "excel":
        return (
          <div className="mt-2 p-3 rounded-md border flex items-center gap-3 bg-muted/50 max-w-xs">
            <div className="bg-green-100 p-2 rounded-md">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{attachment.name}</div>
              <div className="text-xs text-muted-foreground">{attachment.size}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )
      case "word":
        return (
          <div className="mt-2 p-3 rounded-md border flex items-center gap-3 bg-muted/50 max-w-xs">
            <div className="bg-blue-100 p-2 rounded-md">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{attachment.name}</div>
              <div className="text-xs text-muted-foreground">{attachment.size}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )
      default:
        return (
          <div className="mt-2 p-3 rounded-md border flex items-center gap-3 bg-muted/50 max-w-xs">
            <div className="bg-gray-100 p-2 rounded-md">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{attachment.name}</div>
              <div className="text-xs text-muted-foreground">{attachment.size}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )
    }
  }
  
  // Common emoji reactions
  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "👏", "🙌", "🔥"]
  
  // Group messages by date
  const messageGroups = groupMessagesByDate(messages)
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-background">
              {formatDate(group.date)}
            </Badge>
          </div>
          
          {group.messages.map((message, messageIndex) => {
            const isCurrentUser = message.sender?.id === "user-001" || message.sender === "You"
            const isSystem = message.system
            
            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-muted px-3 py-1.5 rounded-full text-xs text-muted-foreground">
                    {message.content}
                  </div>
                </div>
              )
            }
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div>
                    {!isCurrentUser && (
                      <div className="text-sm font-medium mb-1">{message.sender.name}</div>
                    )}
                    
                    <div className="flex items-end gap-2">
                      <div 
                        className={`rounded-lg p-3 ${
                          isCurrentUser 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id}>
                                {renderAttachment(attachment)}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.reactions.map((reaction, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="bg-background text-xs py-0 h-5"
                                onClick={() => onAddReaction(message.id, reaction.emoji)}
                              >
                                {reaction.emoji} {reaction.users.length}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        {isCurrentUser && getMessageStatusIcon(message.status)}
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className={`absolute ${isCurrentUser ? "right-full mr-1" : "left-full ml-1"} top-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <div className="flex items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align={isCurrentUser ? "end" : "start"}>
                          <div className="flex gap-1">
                            {commonEmojis.map((emoji) => (
                              <Button 
                                key={emoji} 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => onAddReaction(message.id, emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Reply className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Forward className="h-4 w-4 mr-2" />
                            Forward
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy text
                          </DropdownMenuItem>
                          {isCurrentUser && (
                            <DropdownMenuItem className="text-destructive">
                              Delete message
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  )
}
