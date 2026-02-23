/**
 * Customer API Service
 * Centralized API service for all customer-related API calls
 */

// API Configuration - Vite uses import.meta.env
const API_BASE_URL = import.meta.env.VITE_CUSTOMER_API_URL || import.meta.env.VITE_API_URL || 'https://api.pointbox.me/api/customer';

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceToken: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  country?: string;
  googleId?: string;
  isGoogleSignup?: boolean;
}

export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
}

export interface RedeemRequest {
  productId: string;
}

export interface SupportRequest {
  subject: string;
  message: string;
  transactionId?: string;
  brandId?: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface Customer {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  totalPoints: number;
  redeemedPoints: number;
  linkedCompanies: Array<{
    company: string | {
      _id: string;
      companyName: string;
      email: string;
      address?: string;
      country?: string;
    };
    points: number;
    tier?: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  transactionId: string;
  customer: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  company: string | {
    _id: string;
    companyName: string;
    companyLogo?: string;
  };
  companyName: string;
  type: 'earn' | 'redeem';
  points: number;
  redeem_points?: number;
  invoiceNumber?: string;
  invoiceImage?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  points: number;
  company: string | {
    _id: string;
    companyName: string;
    companyLogo?: string;
  };
  companyName: string;
  isActive: boolean;
  createdAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Brand {
  _id: string;
  companyName: string;
  email: string;
  address?: string;
  country?: string;
}

export interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

class CustomerApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('customer_token');
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('customer_token', token);
      } else {
        localStorage.removeItem('customer_token');
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('customer_token');
      if (storedToken) {
        this.token = storedToken;
      }
    }
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('customer_token');
      if (storedToken) {
        this.token = storedToken;
      }
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
        if (options.body) {
          try {
            const bodyObj = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
            const sanitized = { ...bodyObj };
            if (sanitized.password) sanitized.password = '***';
            console.log('API Request:', {
              method: options.method,
              endpoint,
              body: sanitized,
              hasPassword: !!bodyObj.password,
              passwordLength: bodyObj.password ? String(bodyObj.password).length : 0
            });
          } catch {
            console.log('API Request:', { method: options.method, endpoint, body: 'non-JSON' });
          }
        } else {
          console.warn('API Request without body:', { method: options.method, endpoint });
        }
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async signup(data: SignupRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(data: LoginRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    if (typeof data.password !== 'string' || data.password.trim().length === 0) {
      throw new Error('Password is required');
    }

    const requestBody: any = {
      email: String(data.email).trim(),
      password: String(data.password).trim(),
      deviceToken: String(data.deviceToken.trim())
    };

    const response = await this.request<{ user: any; token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  logout(): void {
    this.clearToken();
  }

  async getProfile(): Promise<ApiResponse<Customer>> {
    return this.request<Customer>('/profile', {
      method: 'GET',
    });
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<ApiResponse<Customer>> {
    return this.request<Customer>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>('/account', {
      method: 'DELETE',
    });

    if (response.success) {
      this.clearToken();
    }

    return response;
  }

  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>('/transactions', {
      method: 'GET',
    });
  }

  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('/products', {
      method: 'GET',
    });
  }

  async redeemPoints(data: RedeemRequest): Promise<ApiResponse<{
    transaction: Transaction;
    product: Product;
    remainingPoints: number;
  }>> {
    return this.request<{
      transaction: Transaction;
      product: Product;
      remainingPoints: number;
    }>('/redeem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBrands(): Promise<ApiResponse<Brand[]>> {
    return this.request<Brand[]>('/brands', {
      method: 'GET',
    });
  }

  async linkBrand(brandId: string): Promise<ApiResponse<{
    linkedBrands: string[];
    customer: Customer;
  }>> {
    return this.request<{
      linkedBrands: string[];
      customer: Customer;
    }>('/link-brand', {
      method: 'POST',
      body: JSON.stringify({ brandId }),
    });
  }

  async getLinkedBrands(): Promise<ApiResponse<Customer['linkedCompanies']>> {
    return this.request<Customer['linkedCompanies']>('/linked-brands', {
      method: 'GET',
    });
  }

  async getBanners(): Promise<ApiResponse<Banner[]>> {
    return this.request<Banner[]>('/banners', {
      method: 'GET',
    });
  }

  async getConversionRate(): Promise<ApiResponse<ConversionRate>> {
    return this.request<ConversionRate>('/conversion-rate', {
      method: 'GET',
    });
  }

  async contactSupport(data: SupportRequest): Promise<ApiResponse<{
    _id: string;
    customer: string;
    customerEmail: string;
    customerName: string;
    subject: string;
    message: string;
    transactionId?: string;
    createdAt: string;
  }>> {
    return this.request<{
      _id: string;
      customer: string;
      customerEmail: string;
      customerName: string;
      subject: string;
      message: string;
      transactionId?: string;
      createdAt: string;
    }>('/support', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitContact(data: ContactRequest): Promise<ApiResponse<{
    id: string;
    name: string;
    email: string;
    subject: string;
    createdAt: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Contact form API Error:', error);
      throw error;
    }
  }

  async getWebFAQs(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/web/faqs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getWebTerms(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/web/terms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getWebNewsletters(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/web/newsletters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getWebCompanies(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/web/companies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getWebProducts(brandId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/web/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: brandId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getWebSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/web`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async createNewsletterEmail(email: string): Promise<ApiResponse<{
    _id: string;
    email: string;
    createdAt: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/web/newsletter-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "email": email, "source": "footer" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Newsletter Email API Error:', error);
      throw error;
    }
  }

  async getSEO(): Promise<ApiResponse<{
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/web/seo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('SEO API Error:', error);
      throw error;
    }
  }

  async sendOTPForPasswordChange(email: string): Promise<ApiResponse<any>> {
    return this.request('/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTPForPasswordChange(email: string, otp: string): Promise<ApiResponse<any>> {
    return this.request('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async verifyOtp(otp: string): Promise<ApiResponse<{ email?: string }> & { email?: string }> {
    return this.request<{ email?: string }>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  async resendOTPForVerification(email: string): Promise<ApiResponse<any>> {
    return this.request('/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async changePasswordWithOTP(email: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request('/change-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  }
}

export const customerApi = new CustomerApiService();
export default CustomerApiService;
