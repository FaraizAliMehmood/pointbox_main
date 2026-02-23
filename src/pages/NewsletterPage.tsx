import { useState, useEffect } from "react";
import { Newspaper, Loader2, AlertCircle, ExternalLink, Calendar, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { customerApi } from "@/services/api";

interface Newsletter {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getWebNewsletters();
        if (response.success && response.data) {
          const mappedNewsletters: Newsletter[] = response.data
            .filter((n: { isActive?: boolean }) => n.isActive !== false)
            .map((n: { _id?: string; id?: string; title?: string; imageUrl?: string; description?: string; isActive?: boolean; createdAt?: string }) => ({
              id: n._id || n.id || '',
              title: n.title || 'Untitled Newsletter',
              imageUrl: n.imageUrl || '',
              description: n.description || '',
              isActive: n.isActive !== false,
              createdAt: n.createdAt || new Date().toISOString(),
            }))
            .sort((a: Newsletter, b: Newsletter) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNewsletters(mappedNewsletters);
        } else {
          setError(response.message || 'Failed to load newsletters');
        }
      } catch (err: unknown) {
        console.error('Error fetching newsletters:', err);
        setError(err instanceof Error ? err.message : 'Failed to load newsletters. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, []);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Unknown date';
    }
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
              <Newspaper className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Newsletters & Updates</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">Stay in the Loop</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Discover our latest news, updates, and exclusive offers delivered straight to your inbox
            </p>
          </motion.div>
        </div>

        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
            <p className="text-white text-lg">Loading newsletters...</p>
          </motion.div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">Error loading newsletters</p>
            <p className="text-purple-200 text-sm">{error}</p>
          </motion.div>
        ) : newsletters.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Newspaper className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-xl text-white mb-2">No newsletters available</p>
            <p className="text-purple-200">Check back soon for the latest updates!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {newsletters.map((newsletter, index) => (
                <motion.div
                  key={newsletter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all cursor-pointer group"
                  onClick={() => setSelectedNewsletter(newsletter)}
                >
                  <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
                    {imageErrors[newsletter.id] ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-white/50" />
                      </div>
                    ) : newsletter.imageUrl ? (
                      <img
                        src={newsletter.imageUrl}
                        alt={newsletter.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={() => handleImageError(newsletter.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-yellow-200 transition-colors line-clamp-2">{newsletter.title}</h3>
                      <ExternalLink className="w-5 h-5 text-white/50 group-hover:text-white flex-shrink-0 mt-1 transition-colors" />
                    </div>
                    {newsletter.description && (
                      <p className="text-purple-100 text-sm mb-4 line-clamp-3">{newsletter.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-purple-200 text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(newsletter.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {selectedNewsletter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedNewsletter(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-64 md:h-96 overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
                  {imageErrors[selectedNewsletter.id] ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-white/50" />
                    </div>
                  ) : selectedNewsletter.imageUrl ? (
                    <img
                      src={selectedNewsletter.imageUrl}
                      alt={selectedNewsletter.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(selectedNewsletter.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedNewsletter(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 text-purple-600 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedNewsletter.createdAt)}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{selectedNewsletter.title}</h2>
                  {selectedNewsletter.description && (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedNewsletter.description}</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
