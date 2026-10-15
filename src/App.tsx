import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { ChatWidgetWrapper } from '@/components/ChatWidgetWrapper';
import { MainLayout } from '@/layouts/MainLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { VerifyOtpPage } from '@/pages/VerifyOtpPage';
import { CustomerDashboardPage } from '@/pages/CustomerDashboardPage';
import { TermsPage } from './pages/TermsPage';
import { FAQsPage } from './pages/FAQsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { NewsletterPage } from './pages/NewsletterPage';
import { ContactPage } from './pages/ContactPage';
import { BrandsPage } from './pages/BrandsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CustomerRedeemPage } from './pages/customer/CustomerRedeemPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';
import { CustomerBrandsPage } from './pages/customer/CustomerBrandsPage';
import { CustomerBannersPage } from './pages/customer/CustomerBannersPage';
import { CustomerTransactionsPage } from './pages/customer/CustomerTransactionsPage';
import { CustomerSupportPage } from './pages/customer/CustomerSupportPage';
import { CustomerChangePasswordPage } from './pages/customer/CustomerChangePasswordPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main layout: NavBar + content + Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/faqs" element={<FAQsPage />} />
              <Route path="/how_it_works" element={<HowItWorksPage />} />
              <Route path="/newsletter" element={<NewsletterPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Auth pages (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />

            {/* Customer dashboard layout: Sidebar + content */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route path="dashboard" element={<CustomerDashboardPage />} />
              <Route path="redeem" element={<CustomerRedeemPage />} />
              <Route path="profile" element={<CustomerProfilePage />} />
              <Route path="brands" element={<CustomerBrandsPage />} />
              <Route path="banners" element={<CustomerBannersPage />} />
              <Route path="transactions" element={<CustomerTransactionsPage />} />
              <Route path="support" element={<CustomerSupportPage />} />
              <Route path="change-password" element={<CustomerChangePasswordPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ChatWidgetWrapper />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
