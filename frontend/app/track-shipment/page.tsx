"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, MapPin, CheckCircle, Clock, Search } from "lucide-react"

interface TrackingStep {
  id: string
  title: string
  description: string
  timestamp: string
  status: "completed" | "current" | "pending"
  location?: string
}

interface ShipmentData {
  trackingId: string
  status: "in-transit" | "out-for-delivery" | "delivered"
  estimatedDelivery: string
  currentLocation: string
  steps: TrackingStep[]
}

// Mock data for demonstration
const mockShipmentData: ShipmentData = {
  trackingId: "TRK123456789",
  status: "out-for-delivery",
  estimatedDelivery: "Today by 6:00 PM",
  currentLocation: "Local Distribution Center",
  steps: [
    {
      id: "1",
      title: "Order Placed",
      description: "Your order has been confirmed and is being prepared",
      timestamp: "Dec 10, 2024 at 2:30 PM",
      status: "completed",
      location: "Warehouse - New York",
    },
    {
      id: "2",
      title: "In Transit",
      description: "Package is on its way to the destination",
      timestamp: "Dec 11, 2024 at 8:15 AM",
      status: "completed",
      location: "Distribution Center - Chicago",
    },{
      id: "3",
      title: "Out for Delivery",
      description: "Package is out for delivery and will arrive soon",
      timestamp: "Dec 12, 2024 at 9:00 AM",
      status: "current",
      location: "Local Distribution Center",
    },
    {
      id: "4",
      title: "Delivered",
      description: "Package has been successfully delivered",
      timestamp: "Expected today by 6:00 PM",
      status: "pending",
    },
  ],
}

export default function TrackShipmentPage() {
  const [trackingId, setTrackingId] = useState("")
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      if (trackingId.toLowerCase().includes("trk")) {
        setShipmentData(mockShipmentData)
      } else {
        setError("Tracking ID not found. Please check and try again.")
        setShipmentData(null)
      }
      setIsLoading(false)
    }, 1000)
  }
