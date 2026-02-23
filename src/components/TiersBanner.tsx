import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircleStar } from 'lucide-react';

export function TiersBanner() {
  const tiers = [
    {
      name: "Silver",
      color: "from-gray-400 to-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      requirement: "0 - 999 points",
      benefits: [
        "Earn 1 point per $1",
        "Birthday reward",
        "Exclusive member offers",
        "Free shipping on orders $50+"
      ]
    },
    {
      name: "Gold",
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      requirement: "1,000 - 4,999 points",
      featured: true,
      benefits: [
        "Earn 1.5 points per $1",
        "Birthday reward + bonus",
        "Early access to sales",
        "Free shipping on all orders",
        "Priority customer support"
      ]
    },
    {
      name: "Platinum",
      color: "from-purple-600 to-indigo-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      requirement: "5,000+ points",
      benefits: [
        "Earn 2 points per $1",
        "Premium birthday gift",
        "VIP early access",
        "Free express shipping",
        "Dedicated concierge",
        "Exclusive events"
      ]
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">Loyalty Tiers & Rewards</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The more you shop, the more you earn. Progress through our tiers and unlock better rewards
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-3xl border-2 ${tier.borderColor} ${tier.bgColor} p-8 ${
                tier.featured ? 'md:scale-105 shadow-2xl' : 'shadow-lg'
              } transition-all duration-300 hover:shadow-2xl`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                </div>
              )}
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${tier.color} rounded-2xl mb-6`}>
                <CircleStar size={36} />
              </div>
              <h3 className="text-3xl text-gray-900 mb-2">{tier.name}</h3>
              <p className="text-gray-600 mb-6 pb-6 border-b border-gray-200">{tier.requirement}</p>
              <div className="space-y-4 mb-8">
                {tier.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 bg-gradient-to-br ${tier.color} rounded-full flex items-center justify-center mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button
                className={`w-full ${
                  tier.featured
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
