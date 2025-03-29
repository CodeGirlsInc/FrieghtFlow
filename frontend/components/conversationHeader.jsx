import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Phone, Video, Search, Info, ArrowLeft, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function ConversationHeader({ 
  conversation, 
  onBack,
  onSearchMessages,
  isMobile
}) {
  const [showInfo, setShowInfo] = useState(false)
  
  if (!conversation) return null
  
  return (
    <div className="border-b p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar>
          <AvatarImage src={conversation.avatar} alt={conversation.name} />
          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{conversation.name}</h2>
            {conversation.type === "group" && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {conversation.participants?.length || 0} members
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {conversation.online ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                <span>Offline</span>
              </>
            )}
            
            {conversation.typing && (
              <span className="ml-2 text-primary">typing...</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" onClick={() => onSearchMessages("")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search in conversation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Video call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Sheet open={showInfo} onOpenChange={setShowInfo}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Conversation Info</SheetTitle>
            </SheetHeader>
            
            <div className="py-6 flex flex-col items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={conversation.avatar} alt={conversation.name} />
                <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <h3 className="mt-4 font-bold text-lg">{conversation.name}</h3>
              
              {conversation.type === "direct" ? (
                <div className="text-sm text-muted-foreground mt-1">
                  {conversation.online ? "Online" : "Offline"}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">
                  {conversation.participants?.length || 0} members
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
              </div>
            </div>
            
            {conversation.type === "group" && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Members</h4>
                <div className="space-y-3">
                  {conversation.participants?.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h4 className="font-medium mb-2">Options</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Search in conversation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  {conversation.type === "direct" ? "Create group with this contact" : "Add members"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Pin conversation</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Archive conversation</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
