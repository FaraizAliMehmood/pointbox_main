import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, UserPlus, Link2, Gift, Sparkles, CheckCircle2, ArrowRight, Smartphone, Scan, User, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string[];
  visual?: "qr" | "phone" | "account" | "link";
}

const steps: Step[] = [
  { id: 1, title: "Scan Brand QR Code", description: "Visit any participating brand and scan their unique QR code using your smartphone camera or the PointsBox app", icon: QrCode, visual: "qr", details: ["QR codes are available at brand locations", "Each brand has a unique QR code", "Scanning takes just a few seconds"] },
  { id: 2, title: "Create Your Account", description: "If you're new, sign up for free in seconds. Existing members can simply log in to their account", icon: UserPlus, visual: "phone", details: ["Quick registration with email or phone", "No credit card required", "Free membership forever"] },
  { id: 3, title: "Account Gets Linked", description: "Your account is automatically linked to the brand you scanned. You'll start earning points immediately with every purchase", icon: Link2, visual: "link", details: ["Automatic linking after scan", "Multiple brands can be linked", "Earn points from all linked brands"] },
  { id: 4, title: "Start Earning & Redeeming", description: "Shop with linked brands, earn points automatically, and redeem them for exclusive rewards, discounts, and perks", icon: Gift, visual: "account", details: ["Points credited within 24-48 hours", "Redeem anytime from your account", "Unlock better rewards as you level up"] }
];

export function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 min-h-screen">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm text-white">Simple & Easy</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">How It Works</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Join the PointsBox loyalty program in just 4 simple steps and start earning rewards from day one
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <motion.button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
                  isActive ? "bg-white/30 backdrop-blur-sm text-white shadow-lg border-2 border-white" : "bg-white/10 backdrop-blur-sm text-purple-100 hover:bg-white/20 border-2 border-white/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? "bg-white" : "bg-white/20"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-purple-700" : "text-white"}`} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-purple-200 mb-0.5">Step {step.id}</div>
                  <div className="font-semibold text-sm">{step.title}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div key={activeStep} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                {steps[activeStep - 1].visual === "qr" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl mb-4 shadow-xl">
                        <QrCode className="w-12 h-12 text-purple-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Brand QR Code</h3>
                      <p className="text-purple-200">Scan this at any participating brand location</p>
                    </div>
                    <div className="bg-white rounded-2xl p-8 flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-1">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div key={i} className={`w-6 h-6 rounded ${Math.random() > 0.5 ? "bg-purple-700" : "bg-purple-100"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 justify-center">
                      <Smartphone className="w-8 h-8 text-white/50" />
                      <ArrowRight className="w-6 h-6 text-yellow-300" />
                      <Scan className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                {steps[activeStep - 1].visual === "phone" && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl mb-4 shadow-xl">
                        <Smartphone className="w-12 h-12 text-purple-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Quick Registration</h3>
                      <p className="text-purple-200">Sign up in seconds, no credit card needed</p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xs mx-auto">
                      <div className="space-y-4">
                        <div className="text-center">
                          <User className="w-12 h-12 text-purple-700 mx-auto mb-3" />
                          <h4 className="font-bold text-gray-900 mb-1">Create Account</h4>
                        </div>
                        <div className="space-y-3">
                          <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" disabled />
                          <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" disabled />
                          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold">Sign Up Free</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {steps[activeStep - 1].visual === "link" && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl mb-4 shadow-xl">
                        <Link2 className="w-12 h-12 text-purple-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Automatic Linking</h3>
                      <p className="text-purple-200">Your account is instantly connected to the brand</p>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                          </div>
                          <ArrowRight className="w-6 h-6 text-purple-300" />
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <Award className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Your Account</h4>
                        <p className="text-sm text-gray-600">Linked to Brand</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-white">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-sm">Account successfully linked!</span>
                      </div>
                    </div>
                  </div>
                )}
                {steps[activeStep - 1].visual === "account" && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl mb-4 shadow-xl">
                        <Gift className="w-12 h-12 text-purple-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Earn & Redeem Points</h3>
                      <p className="text-purple-200">Track your points and rewards in your dashboard</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-2xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Points Balance</span>
                          <span className="text-2xl font-bold text-purple-700">2,450</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 w-3/4 rounded-full"></div>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-700 mb-1">5</div>
                              <div className="text-xs text-gray-600">Linked Brands</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-700 mb-1">Gold</div>
                              <div className="text-xs text-gray-600">Current Tier</div>
                            </div>
                          </div>
                        </div>
                        <Link to="/signup">
                          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold">Browse Rewards</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div key={`content-${activeStep}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {(() => {
                    const Icon = steps[activeStep - 1].icon;
                    return <Icon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <div>
                  <div className="text-sm text-purple-200 mb-1">Step {activeStep} of {steps.length}</div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-white">{steps[activeStep - 1].title}</h2>
                </div>
              </div>
              <p className="text-xl text-purple-100 leading-relaxed">{steps[activeStep - 1].description}</p>
              <div className="space-y-3 pt-4">
                {steps[activeStep - 1].details.map((detail, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="text-purple-100">{detail}</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-6">
                <Button onClick={() => setActiveStep(Math.max(1, activeStep - 1))} disabled={activeStep === 1} variant="outline" className="border-white/30 text-purple-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </Button>
                {activeStep === steps.length ? (
                  <Link to="/signup">
                    <Button className="bg-white text-purple-700 hover:bg-purple-50 gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={() => setActiveStep(activeStep + 1)} className="bg-white text-purple-700 hover:bg-purple-50 gap-2">
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            { icon: QrCode, title: "Instant Setup", description: "Scan and link in seconds" },
            { icon: Gift, title: "Earn Points", description: "Automatic point tracking" },
            { icon: Award, title: "Redeem Rewards", description: "Exclusive member benefits" }
          ].map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-purple-200 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
            Join thousands of members already earning rewards. Scan a brand's QR code today and start your journey to amazing rewards!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 gap-2">
                Join Free Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/30 text-purple-700 hover:bg-white">
              Download App
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
