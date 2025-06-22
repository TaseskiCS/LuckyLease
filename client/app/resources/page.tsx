"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Shield, DollarSign, CheckCircle, AlertTriangle, Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const resources = [
  {
    id: "safety",
    title: "Safety First",
    icon: Shield,
    description: "Essential safety tips for viewing properties and meeting landlords",
    items: [
      "Always meet in public places first",
      "Bring a friend when viewing properties",
      "Never send money before seeing the property in person",
      "Trust your instincts - if something feels wrong, it probably is",
      "Take photos of any damages before moving in",
    ],
  },
  {
    id: "legal",
    title: "Know Your Rights",
    icon: BookOpen,
    description: "Understanding tenant rights and lease agreements",
    items: [
      "Read the entire lease agreement before signing",
      "Understand your state's tenant rights and landlord obligations",
      "Know the difference between a lease and month-to-month rental",
      "Learn about proper eviction procedures",
      "Know when rent increases are legal",
    ],
  },
  {
    id: "budget",
    title: "Budget Smart",
    icon: DollarSign,
    description: "Financial planning and budgeting for housing costs",
    items: [
      "Follow the 30% rule: housing shouldn't exceed 30% of income",
      "Factor in utilities, internet, and parking costs",
      "Budget for move-in costs: first month, last month, security deposit",
      "Save for unexpected expenses and repairs",
      "Research neighborhood costs for groceries and transportation",
    ],
  },
  {
    id: "checklist",
    title: "Move-in Checklist",
    icon: CheckCircle,
    description: "Essential items to check before signing a lease",
    items: [
      "Test all appliances, lights, and outlets",
      "Inspect for pests, mold, or water damage",
      "Test heating and air conditioning systems",
      "Check all locks and security features",
      "Document any existing damages with photos",
    ],
  },
]

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("safety")
  const activeResource = resources.find((r) => r.id === activeTab)

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-light text-gray-900 mb-6">Student Housing Resources</h1>
            <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
              Everything you need to know about finding and securing student housing safely
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Minimal Tab Navigation */}
        <div className="flex justify-center mb-16">
          <div className="flex space-x-1">
            {resources.map((resource) => (
              <button
                key={resource.id}
                onClick={() => setActiveTab(resource.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 ${
                  activeTab === resource.id
                    ? "bg-green-700 text-white"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <resource.icon className="w-4 h-4" />
                <span className="font-medium">{resource.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clean Content */}
        {activeResource && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <activeResource.icon className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-3xl font-light text-gray-900 mb-4">{activeResource.title}</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">{activeResource.description}</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-3">
                {activeResource.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed text-lg font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Minimal CTA */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Ready to find your perfect place?</h2>
            <p className="text-lg text-gray-500 font-light mb-8">
              Use these resources to navigate your housing search with confidence
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/listings/browse">
                <Button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full">
                  <Home className="w-4 h-4 mr-2" />
                  Browse Listings
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-full"
                >
                  Get Help
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Subtle Disclaimer */}
          <div className="inline-flex items-center space-x-3 text-amber-600 bg-amber-50 px-6 py-4 rounded-full border border-amber-100">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">
              This information is for educational purposes only and does not constitute legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 