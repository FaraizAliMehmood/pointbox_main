import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  User,
  Gift,
  History,
  MessageCircle,
  Megaphone,
  Store,
  LogOut,
  Trash2,
  Menu,
  X,
  Gift as GiftIcon,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { customerApi } from '@/services/api';

export const CustomerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, deleteAccount, user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLogoLoading(true);
        const response = await customerApi.getWebSettings();
        if (response.success && response.data) {
          setLogo(response.data.logo || response.data.logoUrl || null);
        }
      } catch (error) {
        console.error('Failed to fetch logo:', error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchLogo();
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), href: '/customer/dashboard' },
    { icon: User, label: t('sidebar.profile'), href: '/customer/profile' },
    { icon: Gift, label: t('sidebar.availableOffers'), href: '/customer/redeem' },
    { icon: History, label: t('sidebar.transactionHistory'), href: '/customer/transactions' },
    { icon: MessageCircle, label: t('sidebar.contactSupport'), href: '/customer/support' },
    { icon: Megaphone, label: t('sidebar.promotionalBanners'), href: '/customer/banners' },
    { icon: Store, label: t('sidebar.brands'), href: '/customer/brands' },
    { icon: KeyRound, label: t('sidebar.changePassword') || 'Change Password', href: '/customer/change-password' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('account.confirmDelete'))) {
      deleteAccount();
      navigate('/login');
    }
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white/90 backdrop-blur-sm"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-sm shadow-xl z-40
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isRTL ? 'lg:right-0 lg:left-auto' : ''}
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <Link to="/customer/dashboard" className="flex items-center gap-3">
              {logoLoading ? (
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                  <GiftIcon className="w-6 h-6 text-white" />
                </div>
              ) : logo ? (
                <div className="relative w-12 h-12">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                  <GiftIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <div className="text-lg font-bold text-gray-900">PointBox</div>
                <div className="text-xs text-gray-500">{user?.fullName || 'Customer'}</div>
              </div>
            </Link>
          </div>

          <div className="p-4 border-b border-gray-200">
            <LanguageSelector />
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('sidebar.logout')}</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="w-full justify-start gap-3 text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-5 h-5" />
              <span>{t('sidebar.deleteAccount')}</span>
            </Button>
            {showDeleteConfirm && (
              <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 mb-2">{t('account.confirmDelete')}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="flex-1"
                  >
                    {t('common.yes')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    {t('common.no')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
