import { useState, useEffect } from "react";
import { HelpCircle, ChevronDown, Sparkles, Gift, Award, Star, TrendingUp, Clock, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { customerApi } from "@/services/api";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "general" | "points" | "rewards" | "tiers" | "account";
  icon?: React.ComponentType<{ className?: string }>;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  general: Sparkles,
  points: TrendingUp,
  rewards: Gift,
  tiers: Award,
  account: Star,
};

const categories = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "general", label: "General", icon: Sparkles },
  { id: "points", label: "Points", icon: TrendingUp },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "tiers", label: "Tiers", icon: Award },
  { id: "account", label: "Account", icon: Star }
];

export function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getWebFAQs();
        if (response.success && response.data) {
          const mappedFAQs: FAQ[] = response.data
            .filter((faq: { isActive?: boolean }) => faq.isActive !== false)
            .map((faq: { _id?: string; id?: string; question: string; answer: string; category?: string }) => {
              const category = (faq.category || 'general') as string;
              const Icon = categoryIcons[category] || HelpCircle;
              return {
                id: faq._id || faq.id || '',
                question: faq.question,
                answer: faq.answer,
                category: category as FAQ["category"],
                icon: Icon,
              };
            });
          setFaqs(mappedFAQs);
          if (mappedFAQs.length > 0) setOpenFAQ(mappedFAQs[0].id);
        } else {
          setError(response.message || 'Failed to load FAQs');
        }
      } catch (err: unknown) {
        console.error('Error fetching FAQs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load FAQs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const filteredFAQs = selectedCategory === "all"
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 min-h-screen">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <HelpCircle className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Frequently Asked Questions</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">How Can We Help?</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Find answers to common questions about our loyalty program, points, rewards, and more
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  const filtered = category.id === "all" ? faqs : faqs.filter(faq => faq.category === category.id);
                  setOpenFAQ(filtered.length > 0 ? filtered[0].id : null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  selectedCategory === category.id
                    ? "bg-white/30 backdrop-blur-sm text-white shadow-lg"
                    : "bg-white/10 backdrop-blur-sm text-purple-100 hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
              <p className="text-white text-lg">Loading FAQs...</p>
            </motion.div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">Error loading FAQs</p>
              <p className="text-purple-200 text-sm">{error}</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredFAQs.map((faq, index) => {
                const Icon = faq.icon || HelpCircle;
                const isOpen = openFAQ === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left group"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-white flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pl-20">
                            <p className="text-purple-100 leading-relaxed">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {!loading && !error && filteredFAQs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <HelpCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-xl text-white mb-2">No questions found</p>
              <p className="text-purple-200">Try selecting a different category</p>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-xl font-semibold mb-1">Still have questions?</h3>
                <p className="text-purple-200 text-sm">Our support team is here to help you 24/7</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-purple-700 hover:bg-purple-50 rounded-xl font-medium transition-colors"
            >
              Email Support
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Active Members", value: "500K+", icon: Star },
            { label: "Points Earned", value: "2M+", icon: TrendingUp },
            { label: "Partner Brands", value: "50+", icon: Gift },
            { label: "Support Response", value: "< 24hrs", icon: Clock }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Icon className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-purple-200">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
