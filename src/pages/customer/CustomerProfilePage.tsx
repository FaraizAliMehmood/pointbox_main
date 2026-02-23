import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';
import { User, Mail, Phone, Gift, Store, Edit, Download, CheckCircle, Building2, CircleStar, Medal } from 'lucide-react';
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
  redeemPoints?: number;
  tierPoints?: number;
}

export function CustomerProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [linkedBrands, setLinkedBrands] = useState<Brand[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  // Load linked brands from API with redeem points
  useEffect(() => {
    const fetchLinkedBrands = async () => {
      if (!user) {
        setLinkedBrands([]);
        return;
      }

      try {
        // Fetch linked brands directly
        const linkedBrandsResponse = await customerApi.getLinkedBrands();
        console.log(linkedBrandsResponse);
        if (linkedBrandsResponse.success && linkedBrandsResponse.data) {
          const mappedBrands: Brand[] = linkedBrandsResponse.data.map((link: any) => {
            const company = typeof link.company === 'object' ? link.company : null;
            const companyId = company?._id?.toString() || (typeof link.company === 'string' ? link.company : '');
            
            return {
              id: companyId,
              name: company?.companyName || 'Unknown Brand',
              description: company?.address || company?.country || 'Partner brand',
              logo: company?.logo || company?.companyLogo || '',
              companyLogo: company?.companyLogo || company?.logo || '',
              category: company?.country || 'General',
              linked: true,
              redeemPoints: link.redeem_points || link.points || 0,
              tierPoints: link.tier_points || 0
            };
          });

          setLinkedBrands(mappedBrands);
        } else {
          setLinkedBrands([]);
        }
      } catch (err) {
        console.error('Error fetching linked brands for profile:', err);
        setLinkedBrands([]);
      }
    };

    fetchLinkedBrands();
  }, [user]);

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setIsEditing(false);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-code-${user?.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const qrValue = user?.id || '';

  // Function to get tier information based on tierPoints
  const getTierInfo = (tierPoints: number) => {
    console.log(tierPoints);
    if (tierPoints >= 5000) {
      return {
        name: 'Platinum',
        color: 'from-purple-600 to-indigo-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
        icon: CircleStar,
        nextTierPoints: null, // Already at highest tier
        currentTierMin: 5000,
      };
    } else if (tierPoints >= 1000) {
      return {
        name: 'Gold',
        color: 'from-yellow-400 to-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        icon: Medal,
        nextTierPoints: 5000,
        currentTierMin: 1000,
      };
    } else {
      return {
        name: 'Silver',
        color: 'from-gray-400 to-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: CircleStar,
        nextTierPoints: 1000,
        currentTierMin: 0,
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('profile.title')}</h1>
          <p className="text-white/80">{t('profile.personalInfo')}</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            <Edit className="w-4 h-4 mr-2" />
            {t('profile.editProfile')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('profile.personalInfo')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.fullName')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.fullName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phoneNumber')}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.phoneNumber}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    {t('profile.saveChanges')}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    {t('profile.cancel')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Linked Companies / Brands */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            {linkedBrands.length === 0 ? (
              <div className="text-center py-8">
                <Store className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 mb-2">{t('brands.noBrands')}</p>
                <Link to="/customer/brands">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    {t('brands.linkBrand')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedBrands.map((brand) => {
                  const logoUrl = !imageErrors.has(brand.id)
                    ? (brand as any).companyLogo || (brand as any).logo || null
                    : null;

                  return (
                    <div
                      key={brand.id}
                      className="relative rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow overflow-hidden"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backgroundImage: logoUrl ? `url(${logoUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      {logoUrl && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] pointer-events-none" />
                      )}

                      {!logoUrl && (
                        <div className="absolute top-3 left-3 p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg opacity-20">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          {(() => {
                            const tierInfo = getTierInfo(brand.tierPoints ?? 0);
                            const TierIcon = tierInfo.icon;
                            return (
                              <div className="flex flex-col gap-1">
                                <div className={`px-3 py-1.5 bg-gradient-to-br ${tierInfo.color} text-xs font-bold rounded-full flex items-center justify-center shadow-md gap-1`}>
                                  <TierIcon className="w-3 h-3 text-white" />
                                  <span className="text-white">{tierInfo.name}</span>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Linked
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 drop-shadow-sm">
                          {brand.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 drop-shadow-sm line-clamp-2">
                          {brand.description}
                        </p>
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full drop-shadow-sm">
                              {brand.category}
                            </span>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Redeem Points</div>
                              <div className="text-base font-bold text-purple-600">
                                {brand.redeemPoints ?? 0}
                              </div>
                            </div>
                          </div>
                         
                        </div>
                      </div>

                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt=""
                          className="hidden"
                          onError={() =>
                            setImageErrors((prev) => new Set(prev).add(brand.id))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* QR Code & Points */}
        <div className="space-y-6">
          {/* Points Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">{t('profile.totalPoints')}</div>
                <div className="text-2xl font-bold text-gray-900">{user?.points || 0}</div>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('profile.qrCode')}</h3>
            <div id="qr-code" className="flex justify-center mb-4 p-4 bg-white rounded-lg">
              <QRCodeSVG value={qrValue} size={200} level="H" />
            </div>
            <Button
              onClick={downloadQR}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('profile.downloadQR')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
