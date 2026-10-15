import { useState, useEffect } from "react";
import { Settings, Loader2, AlertCircle, Mail, Phone, MapPin, Globe, Image as ImageIcon, FileText, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { customerApi } from "@/services/api";

interface WebSettings {
  logo?: string;
  logoUrl?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  socialMedia?: Record<string, string>;
  [key: string]: unknown;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<WebSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customerApi.getWebSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        } else {
          setError(response.message || 'Failed to load settings');
        }
      } catch (err: unknown) {
        console.error('Error fetching settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const renderField = (
    label: string,
    value: unknown,
    icon?: React.ComponentType<{ className?: string }>,
    isImage = false
  ) => {
    if (!value && value !== 0 && value !== false) return null;
    const Icon = icon || FileText;

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">{label}</h3>
            {isImage && typeof value === 'string' ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20">
                <img src={value} alt={label} className="w-full h-full object-contain" />
              </div>
            ) : typeof value === 'object' && value !== null ? (
              <div className="space-y-2">
                {Object.entries(value as Record<string, unknown>).map(([key, val]) => (
                  <div key={key} className="text-purple-100">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    {typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://')) ? (
                      <a href={val} target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-200 underline">
                        {val}
                      </a>
                    ) : (
                      <span>{String(val)}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('mailto:')) ? (
              <a href={value} target={value.startsWith('mailto:') ? undefined : '_blank'} rel={value.startsWith('mailto:') ? undefined : 'noopener noreferrer'} className="text-yellow-300 hover:text-yellow-200 underline break-all">
                {value}
              </a>
            ) : (
              <p className="text-purple-100 break-words">{String(value)}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 min-h-screen">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Settings className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Web Settings</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">Website Settings</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              View all website configuration and information
            </p>
          </motion.div>
        </div>

        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
            <p className="text-white text-lg">Loading settings...</p>
          </motion.div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">Error loading settings</p>
            <p className="text-purple-200 text-sm">{error}</p>
          </motion.div>
        ) : settings ? (
          <div className="space-y-6">
            {(settings.logo || settings.logoUrl) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {renderField("Logo", settings.logo || settings.logoUrl, ImageIcon, true)}
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.companyName && renderField("Company Name", settings.companyName, Building2)}
              {settings.email && renderField("Email", settings.email, Mail)}
              {settings.phone && renderField("Phone", settings.phone, Phone)}
              {settings.website && renderField("Website", settings.website, Globe)}
            </motion.div>
            {settings.address && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                {renderField("Address", settings.address, MapPin)}
              </motion.div>
            )}
            {settings.description && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                {renderField("Description", settings.description, FileText)}
              </motion.div>
            )}
            {settings.socialMedia && Object.keys(settings.socialMedia).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                {renderField("Social Media", settings.socialMedia, Globe)}
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <details className="cursor-pointer">
                <summary className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  View Raw JSON Data
                </summary>
                <pre className="text-purple-100 text-xs overflow-auto bg-black/20 p-4 rounded-lg mt-4">
                  {JSON.stringify(settings, null, 2)}
                </pre>
              </details>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <AlertCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-xl text-white mb-2">No settings found</p>
            <p className="text-purple-200">The settings data is empty or unavailable</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
