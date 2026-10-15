import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Gift, AlertCircle, Search } from 'lucide-react';
import { customerApi } from '@/services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  points: number;
  redeem_points: number;
  couponCode?: string;
  image?: string;
  companyName?: string;
  companyLogo?: string;
}

export function CustomerRedeemPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getProducts();
        if (response.success && response.data) {
          const mappedProducts: Product[] = (response.data as unknown[]).map((apiProduct: unknown) => {
            const p = apiProduct as Record<string, unknown>;
            return {
            id: (p._id as string) || '',
            name: (p.name as string) || '',
            description: (p.description as string) || '',
            points: (p.redeem_points as number) || (p.points as number) || 0,
            redeem_points: (p.redeem_points as number) || (p.points as number) || 0,
            couponCode: (p.couponCode as string) || '',
            image: (p.image as string) || (p.imageUrl as string),
            companyName: (p.companyName as string) || '',
            companyLogo: (typeof p.company === 'object' && p.company && (p.company as { companyLogo?: string }).companyLogo) || '',
          };
          });
          setProducts(mappedProducts);
          setFilteredProducts(mappedProducts);
        } else {
          setError(response.message || 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  useEffect(() => {
    let filtered = products;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      const searchTrimmed = searchTerm.trim();
      filtered = products.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const pointsMatch = product.redeem_points.toString().includes(searchTrimmed);
        const companyMatch = product.companyName?.toString().includes(searchTrimmed);
        return nameMatch || pointsMatch || companyMatch;
      });
    }
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('redeem.title')}</h1>
        <p className="text-white/80">{t('redeem.availablePoints')}: <span className="font-bold">{user?.points || 0}</span></p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or points..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
              <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">{t('redeem.noProducts')}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No products found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {product.image && (
                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{product.redeem_points}</div>
                        <div className="text-sm text-gray-600">{t('redeem.pointsRequired')}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                    {product.couponCode && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-xs text-purple-600 mb-1">Coupon Code</div>
                        <div className="text-lg font-bold text-purple-900 font-mono">{product.couponCode}</div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">Redeem Points</div>
                        <div className="text-lg font-semibold text-gray-900">{product.redeem_points} points</div>
                      </div>
                      {product.companyLogo && (
                        <img src={product.companyLogo} alt="" className="w-20 h-20 rounded-lg object-contain border border-purple-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
