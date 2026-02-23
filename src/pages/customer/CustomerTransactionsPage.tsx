import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { customerApi, type Transaction as ApiTransaction } from '@/services/api';

interface Transaction {
  id: string;
  userId?: string;
  type: 'earn' | 'redeem';
  points: number;
  redeem_points: number;
  brand: string;
  brandLogo?: string;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  invoiceNumber?: string;
  invoiceImage?: string;
}

export function CustomerTransactionsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'earn' | 'redeem'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getTransactions();
        console.log(response);
        
        if (response.success && response.data) {
          // Map API transactions to component's Transaction format
          const mappedTransactions: Transaction[] = response.data.map((apiTxn: ApiTransaction) => ({
            id: apiTxn.transactionId || apiTxn._id,
            userId: typeof apiTxn.customer === 'string' ? apiTxn.customer : undefined,
            type: apiTxn.type,
            points: apiTxn.points,
            redeem_points: apiTxn.redeem_points || 0,
            brand: apiTxn.companyName || (typeof apiTxn.company === 'object' ? apiTxn.company.companyName : ''),
            brandLogo: typeof apiTxn.company === 'object' ? apiTxn.company.companyLogo : undefined,
            description: apiTxn.notes || `${apiTxn.type === 'earn' ? 'Earned' : 'Redeemed'} ${apiTxn.redeem_points || apiTxn.points} points`,
            date: apiTxn.createdAt,
            status: 'completed' as const, // API transactions are typically completed
            invoiceNumber: apiTxn.invoiceNumber,
            invoiceImage: apiTxn.invoiceImage,
          }));
          
          setTransactions(mappedTransactions);
          setFilteredTransactions(mappedTransactions);
        } else {
          setError(response.message || 'Failed to load transactions');
          // Fallback to empty array if API fails
          setTransactions([]);
          setFilteredTransactions([]);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        // Fallback to empty array on error
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  useEffect(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, transactions]);

  const exportTransactions = () => {
    const csv = [
      ['Transaction ID', 'Date', 'Type', 'Points', 'Brand', 'Description', 'Status'],
      ...filteredTransactions.map((t) => [
        t.id,
        new Date(t.date).toLocaleString(),
        t.type,
        t.redeem_points,
        t.brand,
        t.description,
        t.status,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('transactions.title')}</h1>
          <p className="text-white/80">{filteredTransactions.length} {t('transactions.title')}</p>
        </div>
        <Button
          onClick={exportTransactions}
          variant="outline"
          className="bg-white/95 hover:bg-white"
          disabled={loading || filteredTransactions.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          {t('common.save')}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('transactions.search')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className={filterType === 'all' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}
            >
              {t('common.filter')}
            </Button>
            <Button
              variant={filterType === 'earn' ? 'default' : 'outline'}
              onClick={() => setFilterType('earn')}
              className={filterType === 'earn' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}
            >
              {t('transactions.earn')}
            </Button>
            <Button
              variant={filterType === 'redeem' ? 'default' : 'outline'}
              onClick={() => setFilterType('redeem')}
              className={filterType === 'redeem' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}
            >
              {t('transactions.redeem')}
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Transactions Table */}
      {!loading && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.brand')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.transactionId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.points')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.view')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {t('transactions.noTransactions')}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {transaction.brandLogo ? (
                          <img
                            src={transaction.brandLogo}
                            alt={transaction.brand}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                            {transaction.brand.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{transaction.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'earn'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type === 'earn' ? t('transactions.earn') : t('transactions.redeem')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.type === 'earn' ? '+' : '-'}
                      {Math.abs(transaction.redeem_points)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t(`transactions.${transaction.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {t('transactions.noTransactions')}
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    {transaction.brandLogo ? (
                      <img
                        src={transaction.brandLogo}
                        alt={transaction.brand}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {transaction.brand.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{transaction.brand}</div>
                      <div className="text-xs text-gray-500">{transaction.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      transaction.type === 'earn'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.type === 'earn' ? t('transactions.earn') : t('transactions.redeem')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-gray-600">{new Date(transaction.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{transaction.description}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'earn' ? '+' : '-'}
                      {Math.abs(transaction.redeem_points)}
                    </div>
                    <div className="text-xs text-gray-500">{t(`transactions.${transaction.status}`)}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTransaction(transaction)}
                  className="w-full mt-2"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('common.view')}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('transactions.title')}</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">{t('transactions.transactionId')}</div>
                <div className="text-lg font-medium text-gray-900">{selectedTransaction.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('transactions.date')}</div>
                <div className="text-lg font-medium text-gray-900">
                  {new Date(selectedTransaction.date).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('transactions.type')}</div>
                <div className="text-lg font-medium text-gray-900">
                  {selectedTransaction.type === 'earn' ? t('transactions.earn') : t('transactions.redeem')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('transactions.points')}</div>
                <div className="text-lg font-medium text-gray-900">
                  {selectedTransaction.type === 'earn' ? '+' : '-'}
                  {Math.abs(selectedTransaction.redeem_points)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('transactions.brand')}</div>
                <div className="flex items-center gap-3 mt-1">
                  {selectedTransaction.brandLogo ? (
                    <img
                      src={selectedTransaction.brandLogo}
                      alt={selectedTransaction.brand}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                      {selectedTransaction.brand.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-lg font-medium text-gray-900">{selectedTransaction.brand}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('transactions.description')}</div>
                <div className="text-lg font-medium text-gray-900">{selectedTransaction.description}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('transactions.status')}</div>
                <div className="text-lg font-medium text-gray-900">
                  {t(`transactions.${selectedTransaction.status}`)}
                </div>
              </div>
              {selectedTransaction.invoiceNumber && (
                <div>
                  <div className="text-sm text-gray-600">{t('transactions.invoiceNumber')}</div>
                  <div className="text-lg font-medium text-gray-900">
                    {selectedTransaction.invoiceNumber}
                  </div>
                </div>
              )}
              {selectedTransaction.invoiceImage && (
                <div>
                  <div className="text-sm text-gray-600">{t('transactions.invoice')}</div>
                  <div className="mt-2 space-y-2">
                    <a
                      href={selectedTransaction.invoiceImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 underline"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {t('transactions.viewInvoice')}
                    </a>
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={selectedTransaction.invoiceImage}
                        alt="Invoice"
                        className="max-h-64 w-full object-contain bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => setSelectedTransaction(null)}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
