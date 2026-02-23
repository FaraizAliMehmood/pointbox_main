import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gift, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpecialEventBanner {
  _id?: string;
  id?: string;
  badge?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  type?: string;
  link?: string;
  productUrl?: string;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
}

export function PromoBanner() {
  const [banners, setBanners] = useState<SpecialEventBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState<Record<string, Countdown>>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const BASEURL = import.meta.env.VITE_CUSTOMER_API_URL || import.meta.env.VITE_API_URL || "https://api.pointbox.me/api/customer";
        const apiUrl = `${BASEURL}/web/banners`;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setBanners([]);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const allBanners = data.data || data.banners || data || [];

        if (Array.isArray(allBanners) && allBanners.length > 0) {
          const specialEvents = allBanners.filter((banner: { type?: string; isActive?: boolean }) =>
            banner.type === 'special_event' && banner.isActive !== false
          );
          if (specialEvents.length > 0) {
            setBanners(specialEvents);
          }
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (!banners || banners.length === 0) return;

    const parseDate = (dateString: string | undefined) => {
      if (!dateString) return null;
      if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(`${dateString}:00.000Z`);
      }
      if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
        return new Date(`${dateString}.000Z`);
      }
      return new Date(dateString);
    };

    const updateCountdowns = () => {
      const newCountdowns: Record<string, Countdown> = {};
      banners.forEach((banner) => {
        if (!banner.endDate) return;
        const bannerId = banner._id || banner.id || '';
        const endDate = parseDate(banner.endDate);
        if (!endDate) return;
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          newCountdowns[bannerId] = { days, hours, minutes };
        } else {
          newCountdowns[bannerId] = { days: 0, hours: 0, minutes: 0 };
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading || !banners || banners.length === 0) return null;

  const currentBanner = banners[currentSlide];
  const bannerId = currentBanner._id || currentBanner.id || '';
  const bannerImage = currentBanner.imageUrl || currentBanner.image || 'https://images.unsplash.com/photo-1719706654529-ca7e2ce5a2bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzYzMjIxNTM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
  const badgeText = currentBanner.badge || 'Limited Time Offer';
  const countdown = countdowns[bannerId] || { days: 0, hours: 0, minutes: 0 };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl w-full">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-yellow-300 rounded-full blur-3xl"></div>
          </div>
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div className="p-8 lg:p-12 space-y-6">
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
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">{badgeText}</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl text-white">{currentBanner.title}</h2>
                  <p className="text-lg lg:text-xl text-purple-100">
                    {currentBanner.description || 'Join now and earn amazing rewards!'}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    {currentBanner.productUrl && (
                      <Button
                        onClick={() => window.open(currentBanner.productUrl)}
                        size="lg"
                        className="bg-white text-purple-700 hover:bg-gray-100"
                      >
                        <Gift className="w-5 h-5 mr-2" />
                        Claim the offer
                      </Button>
                    )}
                  </div>
                  {currentBanner.endDate && (
                    <div className="flex gap-4 pt-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[80px]">
                        <div className="text-3xl text-white">{String(countdown.days).padStart(2, '0')}</div>
                        <div className="text-sm text-purple-200">Days</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[80px]">
                        <div className="text-3xl text-white">{String(countdown.hours).padStart(2, '0')}</div>
                        <div className="text-sm text-purple-200">Hours</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[80px]">
                        <div className="text-3xl text-white">{String(countdown.minutes).padStart(2, '0')}</div>
                        <div className="text-sm text-purple-200">Minutes</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              {banners.length > 1 && (
                <div className="flex items-center gap-4 pt-4">
                  <button onClick={prevSlide} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex gap-2">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                  <button onClick={nextSlide} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}
            </div>
            <div className="relative h-full min-h-[300px] lg:min-h-[400px] xl:min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-full"
                >
                  <img
                    src={bannerImage}
                    alt={currentBanner.title}
                    className="absolute inset-0 w-full h-full object-cover lg:rounded-r-3xl"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
