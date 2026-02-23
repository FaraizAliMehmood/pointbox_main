import { Star, Zap, ShoppingBag, CreditCard, Calendar, Trophy } from "lucide-react";

export const BenefitsBanner = () => {
  const benefits = [
    { icon: Star, title: "Earn Points", description: "Get 1 point for every $1 spent" },
    { icon: Zap, title: "Instant Rewards", description: "Redeem points anytime, anywhere" },
    { icon: ShoppingBag, title: "Exclusive Deals", description: "Members-only discounts & offers" },
    { icon: CreditCard, title: "Easy Redemption", description: "Use points like cash at checkout" },
    { icon: Calendar, title: "Birthday Bonus", description: "Special gift on your birthday" },
    { icon: Trophy, title: "VIP Access", description: "Early access to sales & products" }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4" />
            <span className="text-sm">Member Benefits</span>
          </div>
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">Why Join Our Loyalty Program?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enjoy incredible benefits designed to reward your loyalty and enhance your shopping experience
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
