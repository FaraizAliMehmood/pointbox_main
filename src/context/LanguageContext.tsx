import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

import enTranslations from '@/i18n/locales/en.json';
import esTranslations from '@/i18n/locales/es.json';
import frTranslations from '@/i18n/locales/fr.json';
import arTranslations from '@/i18n/locales/ar.json';

const translations: Record<Language, Record<string, unknown>> = {
  en: enTranslations as Record<string, unknown>,
  es: esTranslations as Record<string, unknown>,
  fr: frTranslations as Record<string, unknown>,
  ar: arTranslations as Record<string, unknown>,
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('customer_language') as Language;
      return stored || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customer_language', language);
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
      if (value === undefined) {
        value = translations.en;
        for (const k2 of keys) {
          value = (value as Record<string, unknown>)?.[k2];
        }
        break;
      }
    }

    return (value as string) || key;
  };

  const isRTL = false;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
