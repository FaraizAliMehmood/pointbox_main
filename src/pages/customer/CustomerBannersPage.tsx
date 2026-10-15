import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Megaphone, Calendar, Gift } from 'lucide-react';
import { customerApi } from '@/services/api';

interface Banner {
  id: string;
  title: string;
  description: string;
  image?: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export function CustomerBannersPage() {
  const { t } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getBanners();
        
        if (response.success && response.data) {
          // Helper function to parse date strings that might be incomplete
          const parseDate = (dateString: string | undefined, fallback: string) => {
            if (!dateString) return fallback;
            
            // Format like "2025-11-19T09:16" - add seconds and timezone (UTC)
            if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
              return `${dateString}:00.000Z`;
            }
            // Format like "2025-11-19T09:16:00" - add milliseconds and timezone
            if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
              return `${dateString}.000Z`;
            }
            // If already has timezone info, return as is
            if (dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 10)) {
              return dateString;
            }
            
            return dateString;
          };

          // Map API response to component's Banner interface
          const mappedBanners: Banner[] = response.data.map((apiBanner: any) => {
            const startDate = parseDate(apiBanner.startDate, apiBanner.createdAt || new Date().toISOString());
            const endDate = parseDate(apiBanner.endDate, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

            return {
              id: apiBanner._id,
              title: apiBanner.title,
              description: apiBanner.description || '',
              image: apiBanner.imageUrl || apiBanner.image,
              startDate,
              endDate,
              active: apiBanner.isActive || false,
            };
          });
          
          setBanners(mappedBanners);
        } else {
          setError(response.message || 'Failed to load banners');
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError(err instanceof Error ? err.message : 'Failed to load banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('banners.title')}</h1>
        <p className="text-white/80">{t('banners.activePromotions')}</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading banners...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      )}

      {/* Banners Display */}
      {!loading && !error && (
        <>
          {banners.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">{t('banners.noBanners')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <Gift className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                        <Megaphone className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{banner.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{banner.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(banner.startDate).toLocaleDateString()} -{' '}
                          {new Date(banner.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Featured Banner */}
      {!loading && !error && banners.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{banners[0]?.title}</h2>
              <p className="text-white/80">{banners[0]?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Calendar className="w-4 h-4" />
            <span>
              Valid until {new Date(banners[0]?.endDate || '').toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
