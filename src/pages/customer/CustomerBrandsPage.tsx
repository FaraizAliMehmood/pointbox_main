import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Store, Link as LinkIcon, Check, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { customerApi } from '@/services/api';

interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  companyLogo?: string;
  category: string;
  linked: boolean;
}

export function CustomerBrandsPage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLinked, setFilterLinked] = useState<'all' | 'linked' | 'unlinked'>('all');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getBrands();
        console.log(response);
        if (response.success && response.data) {
          // Map API response to component's Brand interface
          const mappedBrands: Brand[] = response.data.map((apiBrand: any) => ({
            id: apiBrand._id,
            name: apiBrand.companyName,
            description: apiBrand.address || apiBrand.country || 'Partner brand',
            logo: apiBrand.logo || apiBrand.companyLogo || '',
            companyLogo: apiBrand.companyLogo || apiBrand.logo || '',
            category: apiBrand.country || 'General',
            linked: user?.linkedBrands?.includes(apiBrand._id) || false,
          }));
          
          setBrands(mappedBrands);
          setFilteredBrands(mappedBrands);
        } else {
          setError(response.message || 'Failed to load brands');
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(err instanceof Error ? err.message : 'Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [user]);

  useEffect(() => {
    let filtered = brands;

    // Filter by linked status
    if (filterLinked === 'linked') {
      filtered = filtered.filter((b) => b.linked);
    } else if (filterLinked === 'unlinked') {
      filtered = filtered.filter((b) => !b.linked);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBrands(filtered);
  }, [searchTerm, filterLinked, brands]);

  const handleLinkBrand = async (brandId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      // Store current points before linking to preserve them
      const currentPoints = user.points || 0;
      const response = await customerApi.linkBrand(brandId);
      
      if (response.success && response.data) {
        // Determine points value: use API response if valid, otherwise preserve current points
        let pointsToSet = currentPoints;
        if (response.data.customer) {
          // If API returns customer data with points, use it only if it's not 0
          // Otherwise preserve the current points value
          const apiPoints = response.data.customer.totalPoints || 0;
          pointsToSet = apiPoints > 0 ? apiPoints : currentPoints;
        }
        
        // Update user with new linkedBrands from API response
        updateUser({ 
          linkedBrands: response.data.linkedBrands,
          points: pointsToSet
        });

        // Update local state - only link, don't toggle
        setBrands((prev) =>
          prev.map((b) => (b.id === brandId ? { ...b, linked: true } : b))
        );
      } else {
        setError(response.message || 'Failed to link brand');
      }
    } catch (err) {
      console.error('Error linking brand:', err);
      setError(err instanceof Error ? err.message : 'Failed to link brand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('brands.title')}</h1>
        <p className="text-white/80">{t('brands.allBrands')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('common.search')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterLinked === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterLinked('all')}
              className={filterLinked === 'all' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}
            >
              {t('brands.allBrands')}
            </Button>
            <Button
              variant={filterLinked === 'linked' ? 'default' : 'outline'}
              onClick={() => setFilterLinked('linked')}
              className={filterLinked === 'linked' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}
            >
              {t('brands.linkedBrands')}
            </Button>
            <Button
              variant={filterLinked === 'unlinked' ? 'default' : 'outline'}
              onClick={() => setFilterLinked('unlinked')}
              className={filterLinked === 'unlinked' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}
            >
              Unlinked
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading brands...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Brands Grid */}
      {!loading && !error && filteredBrands.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">{t('brands.noBrands')}</p>
        </div>
      ) : !loading && !error ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => {
            const logoUrl = (brand.companyLogo || brand.logo) && !imageErrors.has(brand.id) 
              ? (brand.companyLogo || brand.logo) 
              : null;
            
            return (
              <div
                key={brand.id}
                className={`relative rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow overflow-hidden ${
                  brand.linked ? 'ring-2 ring-purple-500' : ''
                }`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backgroundImage: logoUrl ? `url(${logoUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Overlay for better text readability */}
                {logoUrl && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] pointer-events-none" />
                )}
                
                {/* Fallback icon if no logo */}
                {!logoUrl && (
                  <div className="absolute top-4 left-4 p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg opacity-20">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                )}
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16" />
                    {brand.linked && (
                      <div className="p-1 bg-green-600 rounded-full">
                        <Check className="w-4 h-4 text-green-100" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm">{brand.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 drop-shadow-sm">{brand.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full drop-shadow-sm">
                      {brand.category}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBrand(brand)}
                        className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!brand.linked && (
                        <Button
                          onClick={() => handleLinkBrand(brand.id)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          <LinkIcon className="w-4 h-4 mr-1" />
                          {t('brands.linkBrand')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Hidden image for error handling */}
                {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt=""
                    className="hidden"
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(brand.id));
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Brand Detail Modal */}
      {selectedBrand && (() => {
        const modalLogoUrl = (selectedBrand.companyLogo || selectedBrand.logo) && !imageErrors.has(selectedBrand.id)
          ? (selectedBrand.companyLogo || selectedBrand.logo)
          : null;
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div 
              className="relative rounded-xl shadow-2xl p-6 max-w-md w-full overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backgroundImage: modalLogoUrl ? `url(${modalLogoUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Overlay for better text readability */}
              {modalLogoUrl && (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] pointer-events-none" />
              )}
              
              {/* Fallback icon if no logo */}
              {!modalLogoUrl && (
                <div className="absolute top-6 left-6 p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg opacity-20">
                  <Store className="w-6 h-6 text-white" />
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm">{selectedBrand.name}</h2>
                    <p className="text-sm text-gray-600 drop-shadow-sm">{selectedBrand.category}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 drop-shadow-sm">{selectedBrand.description}</p>
                <div className="flex gap-3">
                  {!selectedBrand.linked && (
                    <Button
                      onClick={() => {
                        handleLinkBrand(selectedBrand.id);
                        setSelectedBrand(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      {t('brands.linkBrand')}
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedBrand(null)}
                    variant="outline"
                    className="flex-1 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                  >
                    {t('common.close')}
                  </Button>
                </div>
              </div>
              
              {/* Hidden image for error handling */}
              {modalLogoUrl && (
                <img 
                  src={modalLogoUrl} 
                  alt=""
                  className="hidden"
                  onError={() => {
                    setImageErrors(prev => new Set(prev).add(selectedBrand.id));
                  }}
                />
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
