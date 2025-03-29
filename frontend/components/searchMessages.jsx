import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Search, Calendar, ArrowLeft, Filter } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export default function SearchMessages({ 
  onSearch, 
  onClose, 
  placeholder = "Search...",
  isFullPanel = false,
  conversation = null
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [showFilters, setShowFilters] = useState(false)
  
  // Mock search results
  const mockSearchResults = [
    {
      id: "result-001",
      content: "I've updated the delivery schedule for the Chicago shipment. Can you review it?",
      sender: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      conversationName: "Sarah Johnson",
      conversationId: "conv-001"
    },
    {
      id: "result-002",
      content: "The carrier confirmed they can accommodate our schedule.",
      sender: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      conversationName: "Sarah Johnson",
      conversationId: "conv-001"
    },
    {
      id: "result-003",
      content: "We need to reassign the routes for tomorrow due to the weather forecast.",
      sender: {
        name: "Mike Chen",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      conversationName: "Dispatch Team",
      conversationId: "conv-002"
    }
  ]
  
  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  // Format date for display
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
        month: 'short',
        day: 'numeric'
      })
    }
  }
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }
  
  // Handle search submission
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
 }   
)