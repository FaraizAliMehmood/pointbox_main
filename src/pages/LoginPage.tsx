import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Gift, Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { customerApi } from '@/services/api';
type Mode = 'login' | 'checkEmail' | 'verifyOTP' | 'changePassword';

export function LoginPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  const [changePasswordEmail, setChangePasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (password.trim().length === 0) {
      setError('Password cannot be empty');
      setLoading(false);
      return;
    }

    try {
      const response = await customerApi.login({
        email: email.trim(),
        password: password.trim(),
        deviceToken: 'c-5cML0cRXKBjabcZYr5J_:APA91bGgoE0gOUo2z7UB2p93SxfjkvKq5XZmLlRV4ILTFZfIsSUlAgsa2PDWlB3xZ87OLiIdWojaDFPLJx9Uj3y-JhaKLXK46nJ12acg_Q0SNwuBIVsK8p8'
      });

      if (response.success && response.token && response.user) {
        try {
          const profileResponse = await customerApi.getProfile();
          if (profileResponse.success && profileResponse.data) {
            const userData = profileResponse.data;
            const authUserData = {
              id: userData._id,
              email: userData.email,
              fullName: userData.username,
              phoneNumber: userData.phone || '',
              points: userData.totalPoints || 0,
              linkedBrands: userData.linkedCompanies?.map((lc: any) =>
                typeof lc.company === 'string' ? lc.company : lc.company._id
              ) || [],
              createdAt: userData.createdAt,
            };
            localStorage.setItem('customer_user', JSON.stringify(authUserData));
            updateUser(authUserData);
          } else {
            const authUserData = {
              id: response.user.id,
              email: response.user.email,
              fullName: response.user.username || '',
              phoneNumber: '',
              points: response.user.totalPoints || 0,
              linkedBrands: [],
              createdAt: new Date().toISOString(),
            };
            localStorage.setItem('customer_user', JSON.stringify(authUserData));
            updateUser(authUserData);
          }
        } catch (profileErr) {
          console.error('Failed to fetch profile:', profileErr);
          const authUserData = {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.username || '',
            phoneNumber: '',
            points: response.user.totalPoints || 0,
            linkedBrands: [],
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem('customer_user', JSON.stringify(authUserData));
          updateUser(authUserData);
        }

        navigate('/customer/dashboard');
      } else {
        const errorMessage = response.message || 'Invalid email or password';
        if (errorMessage.toLowerCase().includes('verify your email') ||
          errorMessage.toLowerCase().includes('email verification')) {
          navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
          return;
        }
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      if (errorMessage.toLowerCase().includes('verify your email') ||
        errorMessage.toLowerCase().includes('email verification')) {
        navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await customerApi.sendOTPForPasswordChange(changePasswordEmail);
      if (response.success) {
        setMode('verifyOTP');
      } else {
        setError(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await customerApi.verifyOTPForPasswordChange(changePasswordEmail, otp);
      if (response.success) {
        setMode('changePassword');
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('changePassword.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('changePassword.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const response = await customerApi.changePasswordWithOTP(changePasswordEmail, newPassword);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setMode('login');
          setSuccess(false);
          setChangePasswordEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
        }, 3000);
      } else {
        setError(response.message || t('changePassword.passwordUpdateError'));
      }
    } catch (err: any) {
      setError(err.message || t('changePassword.passwordUpdateError'));
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('changePassword.passwordUpdated')}</h1>
            <p className="text-gray-600 mb-6">
              {t('changePassword.passwordUpdatedMessage')}
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
          {mode === 'login' && (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('auth.loginTitle')}</h1>
                <p className="text-sm text-gray-600 mt-2">{t('auth.loginSubtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder={t('auth.email')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={1}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder={t('auth.password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('checkEmail');
                      setError('');
                      setChangePasswordEmail('');
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium"
                >
                  {loading ? t('common.loading') : t('auth.login')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {t('auth.dontHaveAccount')}{' '}
                  <Link
                    to="/signup"
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('auth.signup')}
                  </Link>
                </p>
              </div>
            </>
          )}

          {mode === 'checkEmail' && (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('changePassword.checkEmail')}</h1>
                <p className="text-sm text-gray-600 mt-2">{t('changePassword.checkEmailDescription')}</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="changePasswordEmail" className="block text-sm font-medium text-gray-700">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="changePasswordEmail"
                      type="email"
                      value={changePasswordEmail}
                      onChange={(e) => setChangePasswordEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium"
                >
                  {loading ? t('common.loading') : t('changePassword.sendOTP')}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setChangePasswordEmail('');
                    setError('');
                  }}
                  className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {t('auth.login')}
                </button>
              </form>
            </>
          )}

          {mode === 'verifyOTP' && (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('changePassword.verifyOTP')}</h1>
                <p className="text-sm text-gray-600 mt-2">{t('changePassword.verifyOTPDescription')}</p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    {t('changePassword.otpCode')}
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                    maxLength={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                    placeholder="0000"
                  />
                  <p className="text-sm text-gray-500 mt-2">{t('changePassword.otpSentTo')} {changePasswordEmail}</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 4}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('common.loading') : t('changePassword.verify')}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('checkEmail');
                    setOtp('');
                    setError('');
                  }}
                  className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {t('changePassword.backToEmail')}
                </button>
              </form>
            </>
          )}

          {mode === 'changePassword' && (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('changePassword.changePassword')}</h1>
                <p className="text-sm text-gray-600 mt-2">{t('changePassword.changePasswordDescription')}</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    {t('changePassword.newPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder={t('changePassword.enterNewPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t('changePassword.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder={t('changePassword.confirmNewPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium"
                >
                  {loading ? t('common.loading') : t('changePassword.updatePassword')}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('verifyOTP');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {t('changePassword.backToOTP')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
