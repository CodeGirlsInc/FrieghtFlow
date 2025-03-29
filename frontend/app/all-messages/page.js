"use client"

import { useState, useEffect } from "react"
import MessagingLayout from "@/components/messaging/messaging-layout"
import ConversationsList from "@/components/messaging/conversations-list"
import ConversationHeader from "@/components/messaging/conversation-header"
import MessageThread from "@/components/messaging/message-thread"
import MessageComposer from "@/components/messaging/message-composer"
import ContactsPanel from "@/components/messaging/contacts-panel"
import SearchMessages from "@/components/messaging/search-messages"
import EmptyState from "@/components/messaging/empty-state"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { MessageSquare, Users, Star, Archive, Clock, Filter, Plus } from 'lucide-react'

// Mock data for conversations
const mockConversations = [
  {
    id: "conv-001",
    type: "direct",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: {
      id: "msg-123",
      content: "I've updated the delivery schedule for the Chicago shipment. Can you review it?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      sender: "Sarah Johnson",
      status: "read"
    },
    unread: 0,
    online: true,
    pinned: true,
    typing: false
  },
  {
    id: "conv-002",
    type: "group",
    name: "Dispatch Team",
    avatar: "/placeholder.svg?height=40&width=40",
    participants: [
      { id: "user-001", name: "You" },
      { id: "user-002", name: "Mike Chen" },
      { id: "user-003", name: "Priya Patel" },
      { id: "user-004", name: "Carlos Rodriguez" }
    ],
    lastMessage: {
      id: "msg-456",
      content: "We need to reassign the routes for tomorrow due to the weather forecast.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      sender: "Mike Chen",
      status: "read"
    },
    unread: 2,
    pinned: true,
    typing: true,
    typingUser: "Priya Patel"
  },
  {
    id: "conv-003",
    type: "direct",
    name: "Robert Williams",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: {
      id: "msg-789",
      content: "The client approved the expedited shipping quote. Let's proceed with the arrangement.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      sender: "You",
      status: "delivered"
    },
    unread: 0,
    online: false,
    pinned: false,
    typing: false
  },
  {
    id: "conv-004",
    type: "group",
    name: "Northeast Region",
    avatar: "/placeholder.svg?height=40&width=40",
    participants: [
      { id: "user-001", name: "You" },
      { id: "user-005", name: "Jennifer Lee" },
      { id: "user-006", name: "David Smith" },
      { id: "user-007", name: "Emma Wilson" },
      { id: "user-008", name: "James Brown" }
    ],
    lastMessage: {
      id: "msg-101",
      content: "The new customs clearance procedure is now in effect. Please review the documentation.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      sender: "Jennifer Lee",
      status: "read"
    },
    unread: 0,
    pinned: false,
    typing: false
  },
  {
    id: "conv-005",
    type: "direct",
    name: "Lisa Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: {
      id: "msg-102",
      content: "I've shared the warehouse inventory report with you.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      sender: "Lisa Martinez",
      status: "read"
    },
    unread: 0,
    online: true,
    pinned: false,
    typing: false
  },
  {
    id: "conv-006",
    type: "direct",
    name: "Thomas Anderson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: {
      id: "msg-103",
      content: "Can we discuss the fuel surcharge adjustments for the Q3 contracts?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      sender: "Thomas Anderson",
      status: "read"
    },
    unread: 0,
    online: false,
    pinned: false,
    typing: false
  },
  {
    id: "conv-007",
    type: "group",
    name: "Tech Support",
    avatar: "/placeholder.svg?height=40&width=40",
    participants: [
      { id: "user-001", name: "You" },
      { id: "user-009", name: "Alex Johnson" },
      { id: "user-010", name: "Samantha Williams" }
    ],
    lastMessage: {
      id: "msg-104",
      content: "The tracking system update will be deployed tonight. Expect 30 minutes of downtime.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      sender: "Alex Johnson",
      status: "read"
    },
    unread: 0,
    pinned: false,
    typing: false
  },
  {
    id: "conv-008",
    type: "direct",
    name: "Maria Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: {
      id: "msg-105",
      content: "The client meeting is confirmed for Thursday at 2 PM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      sender: "You",
      status: "read"
    },
    unread: 0,
    online: false,
    pinned: false,
    typing: false
  },
  {
    id: "conv-009",
    type: "group",
    name: "Operations Team",
    avatar: "/placeholder.svg?height=40&width=40",
    participants: [
      { id: "user-001", name: "You" },
      { id: "user-011", name: "Kevin Zhang" },
      { id: "user-012", name: "Rachel Green" },
      { id: "user-013", name: "Daniel Kim" },
      { id: "user-014", name: "Olivia Brown" }
    ],
    lastMessage: {
      id: "msg-106",
      content: "Monthly operations review meeting scheduled for Monday 10 AM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      sender: "Kevin Zhang",
      status: "read"
    },
    unread: 0,
    pinned: false,
    typing: false
  },
  {
    id: "conv-010",
    type: "direct",
    name: "John Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: {
      id: "msg-107",
      content: "The new route optimization algorithm is showing promising results.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      sender: "John Smith",
      status: "read"
    },
    unread: 0,
    online: true,
    pinned: false,
    typing: false
  }
];

// Mock data for messages in a conversation
const generateMockMessages = (conversationId) => {
  // Different message sets based on conversation ID
  if (conversationId === "conv-001") {
    return [
      {
        id: "msg-001",
        content: "Hi Sarah, do you have the latest update on the Chicago shipment?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-002",
        content: "Yes, I've been working on it this morning. The carrier confirmed they can accommodate our schedule.",
        timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
        sender: {
          id: "user-002",
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [{ emoji: "👍", users: ["You"] }]
      },
      {
        id: "msg-003",
        content: "Great! What about the special handling requirements for the fragile items?",
        timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-004",
        content: "I've included those details in the shipping instructions. The carrier has acknowledged and will provide the necessary equipment.",
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        sender: {
          id: "user-002",
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-005",
        content: "Perfect. And the estimated delivery time?",
        timestamp: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-006",
        content: "They're estimating delivery between 2-4 PM on Thursday. I've requested real-time tracking updates.",
        timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
        sender: {
          id: "user-002",
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [{ emoji: "🙌", users: ["You"] }]
      },
      {
        id: "msg-007",
        content: "That works perfectly with the client's schedule. They'll have staff available for receiving.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-008",
        content: "I've also prepared a contingency plan in case of any delays due to the forecasted weather conditions.",
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        sender: {
          id: "user-002",
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [{ emoji: "👏", users: ["You"] }]
      },
      {
        id: "msg-009",
        content: "That's excellent foresight. Can you share the contingency plan with me?",
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-010",
        content: "Sure, I'll send it right over. It includes alternative routing and a backup carrier if needed.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        sender: {
          id: "user-002",
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-011",
        content: "Here's the contingency plan document:",
        timestamp: new Date(Date.now() - 1000 * 60 * 14), // 14 minutes ago
        sender: {
          id: "user-002",
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [],
        attachments: [
          {
            id: "file-001",
            name: "Chicago_Shipment_Contingency_Plan.pdf",
            size: "2.4 MB",
            type: "pdf",
            url: "#"
          }
        ]
      },
      {
        id: "msg-012",
        content: "Thanks, Sarah. This looks very thorough. I appreciate your attention to detail.",
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-123",
        content: "I've updated the delivery schedule for the Chicago shipment. Can you review it?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        sender: {
          id: "user-002",
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [],
        attachments: [
          {
            id: "file-002",
            name: "Updated_Chicago_Delivery_Schedule.xlsx",
            size: "1.8 MB",
            type: "excel",
            url: "#"
          }
        ]
      }
    ];
  } else if (conversationId === "conv-002") {
    return [
      {
        id: "msg-201",
        content: "Good morning team. We need to discuss the routes for tomorrow.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        sender: {
          id: "user-003",
          name: "Mike Chen",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-202",
        content: "I've been checking the weather forecast. There's a storm system moving through the midwest.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9), // 1.9 hours ago
        sender: {
          id: "user-003",
          name: "Mike Chen",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-203",
        content: "How severe is it expected to be? Will it affect our northern routes?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8), // 1.8 hours ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-204",
        content: "The forecast shows heavy rain and strong winds, particularly in these areas:",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.7), // 1.7 hours ago
        sender: {
          id: "user-003",
          name: "Mike Chen",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [],
        attachments: [
          {
            id: "file-003",
            name: "Weather_Forecast_Map.jpg",
            size: "1.2 MB",
            type: "image",
            url: "/placeholder.svg?height=300&width=400"
          }
        ]
      },
      {
        id: "msg-205",
        content: "I've already started contacting drivers on routes 12, 15, and 23 to warn them.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.6), // 1.6 hours ago
        sender: {
          id: "user-004",
          name: "Priya Patel",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [{ emoji: "👍", users: ["Mike Chen", "You"] }]
      },
      {
        id: "msg-206",
        content: "Good initiative, Priya. Let's look at alternative routes for the most affected areas.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-207",
        content: "I can help with rerouting. Which shipments are time-sensitive?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4), // 1.4 hours ago
        sender: {
          id: "user-005",
          name: "Carlos Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-208",
        content: "The medical supplies for St. Luke's Hospital and the perishable goods for FreshMart are our priorities.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.3), // 1.3 hours ago
        sender: {
          id: "user-003",
          name: "Mike Chen",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-209",
        content: "I'll work on alternative routes for those shipments right away.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.2), // 1.2 hours ago
        sender: {
          id: "user-005",
          name: "Carlos Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [{ emoji: "🙏", users: ["Mike Chen"] }]
      },
      {
        id: "msg-210",
        content: "Should we notify the clients about potential delays?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        sender: {
          id: "user-004",
          name: "Priya Patel",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      },
      {
        id: "msg-211",
        content: "Yes, let's be proactive. I'll prepare a communication template we can use.",
        timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [{ emoji: "👍", users: ["Priya Patel", "Mike Chen", "Carlos Rodriguez"] }]
      },
      {
        id: "msg-212",
        content: "Here's a draft of the client communication:",
        timestamp: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
        sender: {
          id: "user-001",
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [],
        attachments: [
          {
            id: "file-004",
            name: "Weather_Delay_Client_Communication.docx",
            size: "28 KB",
            type: "word",
            url: "#"
          }
        ]
      },
      {
        id: "msg-213",
        content: "This looks good. I've made a few small edits to include estimated new delivery times.",
        timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
        sender: {
          id: "user-003",
          name: "Mike Chen",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [],
        attachments: [
          {
            id: "file-005",
            name: "Weather_Delay_Client_Communication_Revised.docx",
            size: "30 KB",
            type: "word",
            url: "#"
          }
        ]
      },
      {
        id: "msg-456",
        content: "We need to reassign the routes for tomorrow due to the weather forecast.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        sender: {
          id: "user-003",
          name: "Mike Chen",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: []
      }
    ];
  } else {
    // Default messages for other conversations
    return [
      {
        id: `msg-${conversationId}-1`,
        content: "This is the beginning of your conversation.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        sender: {
          id: "system",
          name: "System",
          avatar: "/placeholder.svg?height=40&width=40"
        },
        status: "read",
        reactions: [],
        system: true
      }
    ];
  }
};

// Mock data for contacts
const mockContacts = [
  {
    id: "contact-001",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Logistics Coordinator",
    department: "Operations",
    online: true,
    email: "sarah.johnson@freightflow.com",
    phone: "+1 (555) 123-4567"
  },
  {
    id: "contact-002",
    name: "Mike Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Dispatch Manager",
    department: "Operations",
    online: true,
    email: "mike.chen@freightflow.com",
    phone: "+1 (555) 234-5678"
  },
  {
    id: "contact-003",
    name: "Priya Patel",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Route Planner",
    department: "Operations",
    online: false,
    email: "priya.patel@freightflow.com",
    phone: "+1 (555) 345-6789"
  },
  {
    id: "contact-004",
    name: "Carlos Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Fleet Manager",
    department: "Operations",
    online: true,
    email: "carlos.rodriguez@freightflow.com",
    phone: "+1 (555) 456-7890"
  },
  {
    id: "contact-005",
    name: "Jennifer Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Regional Director",
    department: "Management",
    online: false,
    email: "jennifer.lee@freightflow.com",
    phone: "+1 (555) 567-8901"
  },
  {
    id: "contact-006",
    name: "David Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Customs Specialist",
    department: "Compliance",
    online: true,
    email: "david.smith@freightflow.com",
    phone: "+1 (555) 678-9012"
  },
  {
    id: "contact-007",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Account Manager",
    department: "Sales",
    online: true,
    email: "emma.wilson@freightflow.com",
    phone: "+1 (555) 789-0123"
  },
  {
    id: "contact-008",
    name: "James Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Safety Officer",
    department: "Compliance",
    online: false,
    email: "james.brown@freightflow.com",
    phone: "+1 (555) 890-1234"
  },
  {
    id: "contact-009",
    name: "Lisa Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Warehouse Supervisor",
    department: "Operations",
    online: true,
    email: "lisa.martinez@freightflow.com",
    phone: "+1 (555) 901-2345"
  },
  {
    id: "contact-010",
    name: "Thomas Anderson",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Finance Manager",
    department: "Finance",
    online: false,
    email: "thomas.anderson@freightflow.com",
    phone: "+1 (555) 012-3456"
  },
  {
    id: "contact-011",
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "IT Support Specialist",
    department: "IT",
    online: true,
    email: "alex.johnson@freightflow.com",
    phone: "+1 (555) 123-4567"
  },
  {
    id: "contact-012",
    name: "Samantha Williams",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Systems Administrator",
    department: "IT",
    online: false,
    email: "samantha.williams@freightflow.com",
    phone: "+1 (555) 234-5678"
  }
];

export default function MessagingPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showContactsPanel, setShowContactsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSearchMessages, setShowSearchMessages] = useState(false);
  const { toast } = useToast();
  const isMobile = useMobile();
  
  // Filter conversations based on active filter and search query
  const filteredConversations = conversations.filter(conversation => {
    // Apply filter
    if (activeFilter === "unread" && conversation.unread === 0) return false;
    if (activeFilter === "starred" && !conversation.pinned) return false;
    if (activeFilter === "archived") return false; // We don't have archived conversations in our mock data
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return conversation.name.toLowerCase().includes(query) || 
             (conversation.lastMessage && conversation.lastMessage.content.toLowerCase().includes(query));
    }
    
    return true;
  });
  
  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const conversationMessages = generateMockMessages(selectedConversation.id);
      setMessages(conversationMessages);
      
      // Mark conversation as read when selected
      if (selectedConversation.unread > 0) {
        const updatedConversations = conversations.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, unread: 0 } 
            : conv
        );
        setConversations(updatedConversations);
        
        // Update the selected conversation reference
        setSelectedConversation({ ...selectedConversation, unread: 0 });
      }
    }
  }, [selectedConversation]);
  
  // Handle sending a new message
  const handleSendMessage = (content, attachments = []) => {
    if (!selectedConversation) return;
    
    // Create new message
    const newMessage = {
      id: `msg-new-${Date.now()}`,
      content,
      timestamp: new Date(),
      sender: {
        id: "user-001",
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      status: "sent",
      reactions: [],
      attachments
    };
    
    // Add message to the conversation
    setMessages([...messages, newMessage]);
    
    // Update last message in conversations list
    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            lastMessage: {
              id: newMessage.id,
              content: newMessage.content,
              timestamp: newMessage.timestamp,
              sender: "You",
              status: "sent"
            },
            typing: false
          } 
        : conv
    );
    
    setConversations(updatedConversations);
    
    // Simulate message delivery after a short delay
    setTimeout(() => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "delivered" } 
            : msg
        )
      );
    }, 1000);
    
    // Simulate message read after a longer delay
    setTimeout(() => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "read" } 
            : msg
        )
      );
    }, 2000);
    
    // Show toast notification
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
      duration: 3000
    });
  };
  
  // Handle starting a new conversation
  const handleStartConversation = (contact) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => 
      conv.type === "direct" && conv.name === contact.name
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv);
      setShowContactsPanel(false);
      return;
    }
    
    // Create new conversation
    const newConversation = {
      id: `conv-new-${Date.now()}`,
      type: "direct",
      name: contact.name,
      avatar: contact.avatar,
      lastMessage: null,
      unread: 0,
      online: contact.online,
      pinned: false,
      typing: false
    };
    
    // Add to conversations list
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setSelectedConversation(newConversation);
    setShowContactsPanel(false);
    
    // Show toast notification
    toast({
      title: "Conversation started",
      description: `You've started a conversation with ${contact.name}.`,
      duration: 3000
    });
  };
  
  // Handle pinning/unpinning a conversation
  const handlePinConversation = (conversationId) => {
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, pinned: !conv.pinned } 
        : conv
    );
    
    setConversations(updatedConversations);
    
    // Update selected conversation if it's the one being pinned/unpinned
    if (selectedConversation && selectedConversation.id === conversationId) {
      setSelectedConversation({
        ...selectedConversation,
        pinned: !selectedConversation.pinned
      });
    }
    
    // Show toast notification
    const conversation = conversations.find(conv => conv.id === conversationId);
    toast({
      title: conversation.pinned ? "Conversation unpinned" : "Conversation pinned",
      description: conversation.pinned 
        ? `${conversation.name} has been unpinned from the top.` 
        : `${conversation.name} has been pinned to the top.`,
      duration: 3000
    });
  };
  
  // Handle adding a reaction to a message
  const handleAddReaction = (messageId, emoji) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        // Check if user already reacted with this emoji
        const existingReactionIndex = msg.reactions.findIndex(
          reaction => reaction.emoji === emoji && reaction.users.includes("You")
        );
        
        if (existingReactionIndex >= 0) {
          // Remove user from the reaction
          const updatedReactions = [...msg.reactions];
          const reaction = updatedReactions[existingReactionIndex];
          
          if (reaction.users.length === 1) {
            // Remove the entire reaction if user is the only one
            updatedReactions.splice(existingReactionIndex, 1);
          } else {
            // Remove user from the reaction users
            updatedReactions[existingReactionIndex] = {
              ...reaction,
              users: reaction.users.filter(user => user !== "You")
            };
          }
          
          return { ...msg, reactions: updatedReactions };
        } else {
          // Add new reaction or add user to existing one
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          
          if (existingReaction) {
            // Add user to existing reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: [...r.users, "You"] } 
                  : r
              )
            };
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, users: ["You"] }]
            };
          }
        }
      }
      return msg;
    });
    
    setMessages(updatedMessages);
  };
  
  // Handle searching messages
  const handleSearchMessages = (query) => {
    // In a real app, this would search through messages
    console.log("Searching messages for:", query);
    setShowSearchMessages(true);
  };
  
  // Handle back button in mobile view
  const handleBackToList = () => {
    setSelectedConversation(null);
  };
  
  return (
    <MessagingLayout>
      {/* Left sidebar - Conversations list */}
      <div className={`border-r ${isMobile && selectedConversation ? 'hidden' : 'block'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSearchMessages(true)}
              >
                <Filter className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowContactsPanel(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Tabs 
              defaultValue="all" 
              className="w-full"
              value={activeFilter}
              onValueChange={setActiveFilter}
            >
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  All
                </TabsTrigger>
                <TabsTrigger value="unread">
                  <Clock className="h-4 w-4 mr-2" />
                  Unread
                </TabsTrigger>
                <TabsTrigger value="starred">
                  <Star className="h-4 w-4 mr-2" />
                  Starred
                </TabsTrigger>
                <TabsTrigger value="archived">
                  <Archive className="h-4 w-4 mr-2" />
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <SearchMessages 
            onSearch={setSearchQuery} 
            placeholder="Search conversations..."
          />
        </div>
        
        <ConversationsList 
          conversations={filteredConversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={setSelectedConversation}
          onPinConversation={handlePinConversation}
        />
      </div>
      
      {/* Main content - Messages */}
      <div className={`flex-1 flex flex-col ${isMobile && !selectedConversation ? 'hidden' : 'block'}`}>
        {selectedConversation ? (
          <>
            <ConversationHeader 
              conversation={selectedConversation}
              onBack={handleBackToList}
              onSearchMessages={handleSearchMessages}
              isMobile={isMobile}
            />
            
            <MessageThread 
              messages={messages}
              onAddReaction={handleAddReaction}
            />
            
            <MessageComposer onSendMessage={handleSendMessage} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
      
      {/* Contacts panel (shown when creating a new conversation) */}
      {showContactsPanel && (
        <ContactsPanel 
          contacts={mockContacts}
          onSelectContact={handleStartConversation}
          onClose={() => setShowContactsPanel(false)}
        />
      )}
      
      {/* Search messages panel */}
      {showSearchMessages && (
        <SearchMessages 
          onSearch={handleSearchMessages}
          onClose={() => setShowSearchMessages(false)}
          isFullPanel={true}
          conversation={selectedConversation}
        />
      )}
    </MessagingLayout>
  );
}
