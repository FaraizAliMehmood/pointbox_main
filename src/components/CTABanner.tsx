import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTABanner() {
  const navigate = useNavigate();

  return (
    <div className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
          </div>
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-full min-h-[400px] lg:min-h-[500px] order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1759563874663-5e59a4bbb7b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGNsdXNpdmUlMjBsdXh1cnl8ZW58MXx8fHwxNzYzMjIxNTM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Exclusive luxury rewards"
                className="absolute inset-0 w-full h-full object-cover lg:rounded-l-3xl"
              />
            </div>
            <div className="p-12 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Join Today</span>
              </div>
              <h2 className="text-4xl lg:text-5xl text-white">
                Ready to Start Earning Rewards?
              </h2>
              <p className="text-xl text-white/90">
                Sign up now and get instant access to exclusive benefits, special offers, and earn points on every purchase. It's completely free!
              </p>
              <div className="space-y-3">
                {[
                  "Start earning rewards immediately",
                  "No hidden fees or charges",
                  "Cancel anytime"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button onClick={() => navigate("/signup")} size="lg" className="bg-white text-orange-600 hover:bg-gray-100 gap-2">
                  Join the Program
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button onClick={() => navigate("/faqs")} size="lg" variant="outline" className="border-white text-black hover:bg-white">
                  View FAQs
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white text-lg">Already a member?</h4>
              <p className="text-purple-200 text-sm">Sign in to view your points balance</p>
            </div>
          </div>
          <Button onClick={() => navigate("/login")} variant="outline" className="border-white text-purple-600 hover:bg-white hover:text-purple-600">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
