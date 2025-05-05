import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Search, Users, Star, Phone, Mail } from 'lucide-react'

export default function ContactsPanel({ contacts, onSelectContact, onClose }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  // Filter contacts based on search query and active tab
  const filteredContacts = contacts.filter(contact => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.title.toLowerCase().includes(query) ||
        contact.department.toLowerCase().includes(query)
      )
    }
    
    // Apply tab filter
    if (activeTab === "online" && !contact.online) return false
    if (activeTab === "favorites") return false // We don't have favorites in our mock data
    
    return true
  })
  
  // Group contacts by department
  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const department = contact.department
    if (!groups[department]) {
      groups[department] = []
    }
    groups[department].push(contact)
    return groups
  }, {})
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">New Conversation</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search contacts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          className="flex-1 flex flex-col"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="px-4 pt-2">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">
                <Users className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="online">
                <Badge className="h-2 w-2 bg-green-500 mr-2" />
                Online
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="flex-1 overflow-y-auto p-4">
            {Object.keys(groupedContacts).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No contacts found
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedContacts).map(([department, departmentContacts]) => (
                  <div key={department}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{department}</h3>
                    <div className="space-y-2">
                      {departmentContacts.map((contact) => (
                        <button
                          key={contact.id}
                          className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                          onClick={() => onSelectContact(contact)}
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={contact.avatar} alt={contact.name} />
                              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            
                            {contact.online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground truncate">{contact.title}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="online" className="flex-1 overflow-y-auto p-4">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No online contacts found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                    onClick={() => onSelectContact(contact)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{contact.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-8 text-muted-foreground">
              No favorite contacts yet
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
