import { useState, useEffect } from "react";
import { Sparkles, Gift, Award, Trophy, Star, Heart, ChevronLeft, ChevronRight, Apple } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  image: string;
  badgeIcon: typeof Sparkles;
}

const getBadgeIcon = (badgeText: string = '') => {
  const lowerBadge = badgeText.toLowerCase();
  if (lowerBadge.includes('gift') || lowerBadge.includes('reward')) return Gift;
  if (lowerBadge.includes('award') || lowerBadge.includes('achievement')) return Award;
  if (lowerBadge.includes('trophy') || lowerBadge.includes('winner')) return Trophy;
  if (lowerBadge.includes('star') || lowerBadge.includes('featured')) return Star;
  if (lowerBadge.includes('heart') || lowerBadge.includes('favorite')) return Heart;
  return Sparkles;
};

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const BASEURL = import.meta.env.VITE_CUSTOMER_API_URL || import.meta.env.VITE_API_URL || "https://api.pointbox.me/api/customer";
        const apiUrl = `${BASEURL}/web/banners`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const banners = data.data || data.banners || data || [];

        if (Array.isArray(banners) && banners.length > 0) {
          const mappedSlides: Slide[] = banners
            .filter((banner: { isActive?: boolean; type?: string }) => {
              const isActive = banner.isActive !== false;
              const isRegular = banner.type === 'regular';
              const isNotSpecialEvent = banner.type !== 'special_event';
              return isActive && isRegular && isNotSpecialEvent;
            })
            .map((banner: { badge?: string; title?: string; description?: string; imageUrl?: string; image?: string }) => ({
              badge: banner.badge || 'New',
              title: banner.title || '',
              description: banner.description || '',
              imageUrl: banner.imageUrl || banner.image || '',
              image: banner.imageUrl || banner.image || '',
              badgeIcon: getBadgeIcon(banner.badge),
            }));

          setSlides(mappedSlides);
        } else {
          setSlides([]);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading && slides.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-white text-center">
            <p>Loading banners...</p>
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <BadgeIcon className="w-4 h-4" />
                  <span className="text-sm">{slide.badge}</span>
                </div>
                <h1 className="text-5xl lg:text-6xl tracking-tight">{slide.title}</h1>
                <p className="text-xl text-purple-100">{slide.description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="https://apps.apple.com/us/app/pointbox-me/id6757129758"
                className="inline-flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-colors"
              >
                <Apple className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg leading-tight">App Store</div>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=app.pointbox.android&pli=1"
                className="inline-flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-lg leading-tight">Google Play</div>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={prevSlide}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-yellow-300" />
                  <div className="text-3xl">500K+</div>
                </div>
                <div className="text-sm text-purple-200">Active Members</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-yellow-300" />
                  <div className="text-3xl">$2M+</div>
                </div>
                <div className="text-sm text-purple-200">Rewards Given</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <div className="text-3xl">98%</div>
                </div>
                <div className="text-sm text-purple-200">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-3xl transform rotate-3"></div>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
