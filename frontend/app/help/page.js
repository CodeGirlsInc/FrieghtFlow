"use client"

import { useState } from "react"
import HelpHeader from "@/components/help/help-header"
import HelpCategories from "@/components/help/help-categories"
import SearchResults from "@/components/help/search-results"
import PopularArticles from "@/components/help/popular-articles"
import ContactSupport from "@/components/help/contact-support"
import VideoTutorials from "@/components/help/video-tutorials"
import FAQ from "@/components/help/faq"
import TicketStatus from "@/components/help/ticket-status"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HelpHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="space-y-8">
          {searchQuery ? (
            <SearchResults query={searchQuery} />
          ) : selectedCategory ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <SearchResults category={selectedCategory} />
              </div>
              <div className="space-y-6">
                <ContactSupport />
                <TicketStatus />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <HelpCategories onCategorySelect={setSelectedCategory} />
                <PopularArticles />
                <FAQ />
              </div>
              <div className="space-y-6">
                <ContactSupport />
                <VideoTutorials />
                <TicketStatus />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
