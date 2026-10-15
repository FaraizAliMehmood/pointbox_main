import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ShoppingBag, Award, Sparkles, ArrowRight, Search, Loader2, AlertCircle, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { customerApi } from "@/services/api";

interface Brand {
  id: string;
  name: string;
  logo: string;
  pointsPerDollar: number;
  category: string;
  featured?: boolean;
  country?: string;
}

interface Product {
  id: string;
  name: string;
  brandId: string;
  image: string;
  price: number;
  pointsEarned: number;
  redeem_points: number;
  rating: number;
  description: string;
}

export function BrandsPage() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [productImageErrors, setProductImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getWebCompanies();
        if (response.success && response.data) {
          const mappedBrands: Brand[] = response.data
            .filter((company: { isActive?: boolean }) => company.isActive !== false)
            .map((company: { _id?: string; id?: string; companyName?: string; name?: string; logo?: string; companyLogo?: string; pointsMultiplier?: number; pointsPerDollar?: number; country?: string; featured?: boolean }) => ({
              id: company._id || company.id || '',
              name: company.companyName || company.name || 'Unknown Company',
              logo: company.logo || company.companyLogo || '',
              pointsPerDollar: company.pointsMultiplier || company.pointsPerDollar || 1,
              category: company.country || 'General',
              featured: company.featured || false,
              country: company.country || '',
            }));
          setBrands(mappedBrands);
          if (mappedBrands.length > 0 && !selectedBrand) {
            setSelectedBrand(mappedBrands[0]);
          }
        } else {
          setError(response.message || 'Failed to load brands');
        }
      } catch (err: unknown) {
        console.error('Error fetching brands:', err);
        setError(err instanceof Error ? err.message : 'Failed to load brands. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedBrand?.id) {
        setProducts([]);
        setProductsLoading(false);
        return;
      }
      try {
        setProductsLoading(true);
        setProductsError(null);
        const response = await customerApi.getWebProducts(selectedBrand.id);
        if (response.success && response.data) {
          const mappedProducts: Product[] = response.data
            .filter((product: { isActive?: boolean }) => product.isActive !== false)
            .map((product: { _id?: string; id?: string; company?: string | { _id?: string }; companyId?: string; name?: string; image?: string; imageUrl?: string; price?: number; redeem_points?: number; points?: number; rating?: number; description?: string }) => {
              const companyId = typeof product.company === 'string' ? product.company : product.company?._id || product.companyId;
              const price = product.price || (product.redeem_points ? product.redeem_points * 0.01 : 0);
              const pointsEarned = product.points || 0;
              return {
                id: product._id || product.id || '',
                name: product.name || 'Unnamed Product',
                brandId: companyId || selectedBrand.id,
                image: product.image || product.imageUrl || '',
                price,
                pointsEarned,
                redeem_points: product.redeem_points || 0,
                rating: product.rating || 4.5,
                description: product.description || '',
              };
            });
          setProducts(mappedProducts);
        } else {
          setProductsError(response.message || 'Failed to load products');
          setProducts([]);
        }
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        setProductsError(err instanceof Error ? err.message : 'Failed to load products. Please try again later.');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedBrand]);

  const handleImageError = (id: string) => setImageErrors((prev) => ({ ...prev, [id]: true }));
  const handleProductImageError = (id: string) => setProductImageErrors((prev) => ({ ...prev, [id]: true }));

  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const displayedBrand = selectedBrand && filteredBrands.some((b) => b.id === selectedBrand.id)
    ? selectedBrand
    : filteredBrands.length > 0
    ? filteredBrands[0]
    : null;
  const filteredProducts = products;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm text-white">Partner Brands</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white">Shop & Earn Points</h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Discover exclusive brands and earn loyalty points with every purchase
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-purple-300" />
            </div>
            <input
              type="text"
              placeholder="Search brands by name..."
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);
                const filtered = brands.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length > 0 && (!selectedBrand || !filtered.find((b) => b.id === selectedBrand.id))) {
                  setSelectedBrand(filtered[0]);
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
              disabled={loading}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  if (brands.length > 0) setSelectedBrand(brands[0]);
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-300 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && !loading && (
            <p className="text-center text-purple-200 text-sm mt-3">
              {filteredBrands.length > 0 ? `Found ${filteredBrands.length} brand${filteredBrands.length > 1 ? 's' : ''}` : "No brands found"}
            </p>
          )}
        </div>

        <div className="mb-12">
          <h3 className="text-2xl text-white mb-6 font-semibold">Select a Brand</h3>
          {loading ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
              <p className="text-white text-lg">Loading brands...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">Error loading brands</p>
              <p className="text-purple-200 text-sm">{error}</p>
            </div>
          ) : filteredBrands.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {filteredBrands.map((brand) => (
                <motion.button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    selectedBrand?.id === brand.id ? "bg-white/30 backdrop-blur-sm border-white shadow-lg" : "bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20"
                  }`}
                >
                  {brand.featured && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">Featured</div>
                  )}
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${selectedBrand?.id === brand.id ? "bg-white" : "bg-white/20"}`}>
                      {imageErrors[brand.id] || !brand.logo ? (
                        <Building2 className="w-8 h-8 text-white/50" />
                      ) : (
                        <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" onError={() => handleImageError(brand.id)} />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${selectedBrand?.id === brand.id ? "text-white" : "text-purple-100"}`}>{brand.name}</p>
                      <div className="flex items-center gap-1 justify-center mt-1">
                        <Award className="w-3 h-3 text-yellow-300" />
                        <span className="text-xs text-purple-200">{brand.pointsPerDollar}x points</span>
                      </div>
                      <p className="text-xs text-purple-300 mt-1">{brand.category}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Search className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-xl text-white mb-2">No brands found</p>
              <p className="text-purple-200">{searchQuery ? "Try searching with a different name" : "No brands available at the moment"}</p>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {displayedBrand && (
            <motion.div
              key={displayedBrand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl text-white font-bold mb-2">{displayedBrand.name} Products</h3>
                  <p className="text-purple-200">Earn {displayedBrand.pointsPerDollar}x points per $1 spent</p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-white">{filteredProducts.length} Products</span>
                </div>
              </div>

              {productsLoading ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
                  <p className="text-white text-lg">Loading products...</p>
                </div>
              ) : productsError ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">Error loading products</p>
                  <p className="text-purple-200 text-sm">{productsError}</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="group relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:bg-white/20 transition-all hover:shadow-xl"
                    >
                      <div className="relative h-48 overflow-hidden bg-white/5">
                        {productImageErrors[product.id] || !product.image ? (
                          <div className="w-full h-full flex items-center justify-center bg-white/10">
                            <ShoppingBag className="w-16 h-16 text-white/30" />
                          </div>
                        ) : (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={() => handleProductImageError(product.id)}
                          />
                        )}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {product.redeem_points} pts
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <h4 className="text-lg font-semibold text-white mb-1">{product.name}</h4>
                        <p className="text-sm text-purple-200 line-clamp-2">{product.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <ShoppingBag className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-xl text-white mb-2">No products available</p>
                  <p className="text-purple-200">Check back soon for {displayedBrand.name} products</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white text-lg font-semibold">How Points Work</h4>
                <p className="text-purple-200 text-sm">Each brand offers different point multipliers. Earn more with featured partners!</p>
              </div>
            </div>
            <Button className="bg-white text-purple-700 hover:bg-purple-50 gap-2" onClick={() => navigate('/how_it_works')}>
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
