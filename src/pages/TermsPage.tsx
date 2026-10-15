import { useState, useEffect } from "react";
import { FileText, Shield, Gift, CreditCard, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { customerApi } from "@/services/api";

const getIconForSection = (section: string) => {
  const sectionLower = section?.toLowerCase() || '';
  if (sectionLower.includes('privacy')) return Shield;
  if (sectionLower.includes('points') || sectionLower.includes('reward')) return Gift;
  if (sectionLower.includes('payment') || sectionLower.includes('redemption') || sectionLower.includes('refund')) return CreditCard;
  if (sectionLower.includes('warning') || sectionLower.includes('prohibited') || sectionLower.includes('termination') || sectionLower.includes('disclaimer')) return AlertTriangle;
  if (sectionLower.includes('acceptance') || sectionLower.includes('agreement')) return CheckCircle;
  return FileText;
};

interface TermsSection {
  _id: string;
  title: string;
  content: string;
  section: string;
  isActive: boolean;
  createdAt: string;
}

export function TermsPage() {
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getWebTerms();
        if (response.success && response.data) {
          const activeTerms = response.data
            .filter((term: TermsSection) => term.isActive !== false)
            .sort((a: TermsSection, b: TermsSection) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          setSections(activeTerms);
          if (activeTerms.length > 0) {
            setLastUpdated(new Date(activeTerms[0].createdAt));
          }
        } else {
          setError('Failed to load terms and conditions');
        }
      } catch (err: unknown) {
        console.error('Error fetching terms:', err);
        setError(err instanceof Error ? err.message : 'Failed to load terms and conditions');
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 min-h-screen">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <FileText className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Legal Information</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">Terms and Conditions</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Please read these terms carefully before using our service. By using PointsBox, you agree to be bound by these terms.
            </p>
            {lastUpdated && (
              <p className="text-sm text-purple-200 mt-4">
                Last updated: {lastUpdated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="ml-3 text-white text-lg">Loading terms and conditions...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl border border-red-300/30 p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-200 mx-auto mb-4" />
            <p className="text-red-100 text-lg">{error}</p>
            <p className="text-red-200 text-sm mt-2">Please try refreshing the page.</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-2xl border border-yellow-300/30 p-8 text-center">
            <FileText className="w-12 h-12 text-yellow-200 mx-auto mb-4" />
            <p className="text-yellow-100 text-lg">No terms and conditions available at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = getIconForSection(section.section);
              return (
                <motion.div
                  key={section._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white flex-1">{section.title}</h2>
                  </div>
                  <div className="pl-16">
                    <p className="text-purple-100 leading-relaxed whitespace-pre-line">{section.content}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-yellow-300/30 p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-400/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl mb-2">Important Notice</h3>
              <p className="text-purple-100 leading-relaxed">
                By continuing to use PointsBox, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of the Service immediately.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-8 text-center"
        >
          <p className="text-purple-200 mb-4">
            Questions about these terms?{" "}
            <Link to="/contact" className="text-white hover:text-yellow-300 underline transition-colors">
              Contact us
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
