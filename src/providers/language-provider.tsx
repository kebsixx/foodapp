import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import file terjemahan
import en from '../translations/en.json';
import id from '../translations/id.json';

// Inisialisasi i18n
i18n.init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: 'id', // Default bahasa Indonesia
  fallbackLng: 'id',
  interpolation: {
    escapeValue: false,
  },
});

// Tipe untuk konteks
type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
};

// Buat konteks
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Kunci untuk AsyncStorage
const LANGUAGE_KEY = '@app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('id'); // Default bahasa Indonesia

  // Load bahasa yang tersimpan saat aplikasi dimulai
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
          setLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []);

  // Fungsi untuk mengubah bahasa
  const changeLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguage(lang);
      i18n.changeLanguage(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LanguageContext.Provider>
  );
};

// Hook untuk menggunakan konteks bahasa
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider; 