import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Gift, TrendingUp, History, Store } from 'lucide-react';
import { customerApi } from '@/services/api';

export function CustomerDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await customerApi.getTransactions();

        if (response.success && response.data) {
          setTransactionCount(response.data.length || 0);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setTransactionCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const stats = [
    {
      label: t('profile.availablePoints'),
      value: user?.points || 0,
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      label: t('sidebar.transactionHistory'),
      value: loading ? '...' : transactionCount.toString(),
      icon: History,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: t('sidebar.brands'),
      value: user?.linkedBrands?.length || 0,
      icon: Store,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('sidebar.dashboard')}</h1>
        <p className="text-white/80">Welcome back, {user?.fullName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/customer/redeem"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
          >
            <Gift className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="font-medium text-gray-900">{t('sidebar.availableOffers')}</div>
          </Link>
          <Link
            to="/customer/brands"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
          >
            <Store className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
            <div className="font-medium text-gray-900">{t('sidebar.brands')}</div>
          </Link>
          <Link
            to="/customer/transactions"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <History className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="font-medium text-gray-900">{t('sidebar.transactionHistory')}</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
