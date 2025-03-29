import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Star, StarOff, Archive, Trash2, Volume2, VolumeX, Users, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ConversationsList({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation,
  onPinConversation
}) {
  const [hoveredConversation, setHoveredConversation] = useState(null)
  
  // Format timestamp to relative time (e.g., "2h ago", "Just now")
  const formatRelativeTime = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return days === 1 ? "Yesterday" : `${days}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return "Just now"
    }
  }
  
  // Truncate message content if it's too long
  const truncateMessage = (message, maxLength = 60) => {
    if (!message) return ""
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }
  
  // Sort conversations: pinned first, then by last message timestamp
  const sortedConversations = [...conversations].sort((a, b) => {
    // Pinned conversations first
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    
    // Then sort by last message timestamp (newest first)
    if (a.lastMessage && b.lastMessage) {
      return b.lastMessage.timestamp - a.lastMessage.timestamp
    }
    
    return 0
  })
  
  return (
    <div className="overflow-y-auto h-[calc(100vh-12rem)]">
      {sortedConversations.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No conversations found
        </div>
      ) : (
        <ul className="divide-y">
          {sortedConversations.map((conversation) => (
            <li 
              key={conversation.id}
              className={`relative hover:bg-muted/50 transition-colors ${
                selectedConversationId === conversation.id ? "bg-muted" : ""
              }`}
              onMouseEnter={() => setHoveredConversation(conversation.id)}
              onMouseLeave={() => setHoveredConversation(null)}
            >
              <button
                className="w-full text-left p-3 focus:outline-none"
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    {conversation.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                    )}
                    
                    {conversation.type === "group" && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-primary text-white flex items-center justify-center rounded-full text-[10px]">
                        <Users className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate pr-2">
                        {conversation.name}
                        {conversation.pinned && (
                          <Star className="h-3 w-3 text-yellow-500 inline ml-1" />
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(conversation.lastMessage.timestamp)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm text-muted-foreground truncate">
                        {conversation.typing ? (
                          <span className="text-primary flex items-center">
                            <span className="mr-1">{conversation.typingUser || "Someone"}</span>
                            <span className="typing-indicator">
                              <span className="dot"></span>
                              <span className="dot"></span>
                              <span className="dot"></span>
                            </span>
                          </span>
                        ) : (
                          conversation.lastMessage ? (
                            <span>
                              {conversation.lastMessage.sender === "You" && "You: "}
                              {truncateMessage(conversation.lastMessage.content)}
                            </span>
                          ) : (
                            <span className="italic">No messages yet</span>
                          )
                        )}
                      </div>
                      
                      {conversation.unread > 0 && (
                        <Badge className="ml-2">{conversation.unread}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
              
              {hoveredConversation === conversation.id && (
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPinConversation(conversation.id)}>
                        {conversation.pinned ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Unpin conversation
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Pin conversation
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {conversation.muted ? (
                          <>
                            <Volume2 className="h-4 w-4 mr-2" />
                            Unmute notifications
                          </>
                        ) : (
                          <>
                            <VolumeX className="h-4 w-4 mr-2" />
                            Mute notifications
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Clock className="h-4 w-4 mr-2" />
                        Snooze conversation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      
      <style jsx>{`
        .typing-indicator {
          display: inline-flex;
          align-items: center;
        }
        
        .dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: currentColor;
          margin: 0 1px;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  )
}
