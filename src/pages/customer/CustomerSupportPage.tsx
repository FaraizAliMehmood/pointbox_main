import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MessageCircle, Send, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { customerApi } from '@/services/api';

interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  category: string;
  linked: boolean;
}

export function CustomerSupportPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [formData, setFormData] = useState({
    brand: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const response = await customerApi.getBrands();
        
        if (response.success && response.data) {
          // Map API response to component's Brand interface
          const mappedBrands: Brand[] = response.data.map((apiBrand: any) => ({
            id: apiBrand._id,
            name: apiBrand.companyName,
            description: apiBrand.address || apiBrand.country || 'Partner brand',
            category: apiBrand.country || 'General',
            linked: user?.linkedBrands?.includes(apiBrand._id) || false,
          }));
          
          setBrands(mappedBrands);
        } else {
          setError(response.message || 'Failed to load brands');
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(err instanceof Error ? err.message : 'Failed to load brands');
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) {
        setError('Please log in to submit a support request');
        setLoading(false);
        return;
      }

      // Call the API to submit support request
      const response = await customerApi.contactSupport({
        subject: formData.subject,
        message: formData.message,
        brandId: formData.brand || undefined,
      });

      if (response.success) {
        setShowSuccess(true);
        setFormData({ brand: '', subject: '', message: '' });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setError(response.message || t('support.sendError'));
      }
    } catch (err) {
      console.error('Error submitting support request:', err);
      setError(err instanceof Error ? err.message : t('support.sendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('support.title')}</h1>
        <p className="text-white/80">{t('support.subtitle')}</p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{t('support.sendSuccess')}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('support.title')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                {t('support.brand')} <span className="text-red-500">*</span>
              </label>
              {loadingBrands ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading brands...
                </div>
              ) : (
                <select
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">{t('support.selectBrand')}</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                {t('support.subject')}
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder={t('support.enterSubject')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                {t('support.message')}
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={8}
                placeholder={t('support.enterMessage')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {loading ? (
                t('common.loading')
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('support.send')}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">support@pointbox.com</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Response Time</div>
                  <div className="text-sm text-gray-600">Within 24 hours</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Need Immediate Help?</h3>
            <p className="text-sm text-white/90 mb-4">
              For urgent matters, please call our support hotline or send an email directly.
            </p>
            <Button
              variant="outline"
              className="w-full bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => {
                window.location.href = 'mailto:support@pointbox.com';
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
