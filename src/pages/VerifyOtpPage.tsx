import { useState, useEffect, Suspense } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Gift, KeyRound, CheckCircle, Mail } from 'lucide-react';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { customerApi } from '@/services/api';

function VerifyOtpContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

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

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 4) {
      setError(t('verifyOtp.invalidOtp'));
      return;
    }

    setLoading(true);

    try {
      const response = await customerApi.verifyOtp(otp);

      if (response.success) {
        setSuccess(true);
        if ((response as any).email) {
          setEmail((response as any).email);
        } else if (response.data?.email) {
          setEmail(response.data.email);
        }

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || t('verifyOtp.invalidCode'));
      }
    } catch (err: any) {
      setError(err.message || t('verifyOtp.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError(t('verifyOtp.emailRequired'));
      return;
    }

    setError('');
    setResending(true);
    setResendSuccess(false);

    try {
      const response = await customerApi.resendOTPForVerification(email);
      if (response.success) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setError(response.message || t('verifyOtp.resendFailed'));
      }
    } catch (err: any) {
      setError(err.message || t('verifyOtp.errorOccurred'));
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('verifyOtp.accountVerified')}</h1>
            <p className="text-gray-600 mb-6">
              {t('verifyOtp.redirecting')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4 relative">
      <Link
        to="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-3 group transition-transform hover:scale-105"
      >
        {logoLoading ? (
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors">
            <Gift className="w-6 h-6 text-white" />
          </div>
        ) : logo ? (
          <div className="relative w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl p-2 group-hover:bg-white/20 transition-colors">
            <img
              src={logo}
              alt="PointBox Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors">
            <Gift className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="hidden sm:block">
          <div className="text-lg font-bold text-white">PointBox</div>
          <div className="text-xs text-white/80 -mt-1">Loyalty Program</div>
        </div>
      </Link>

      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Verify OTP</h1>
            <p className="text-sm text-gray-600 mt-2">
              Enter the 4-digit code sent to your email
            </p>
            {email && (
              <p className="text-sm text-purple-600 mt-2 font-medium flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {email}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                OTP has been resent to your email. Please check your inbox.
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-center text-2xl tracking-widest font-mono"
                placeholder="0000"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Enter the 4-digit code from your email
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            {email && (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : "Didn't receive code? Resend OTP"}
              </button>
            )}

            <div className="text-center space-y-2">
              <Link
                to="/login"
                className="block text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
