import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_FARMER_LANGUAGE,
  LANGUAGE_METADATA,
  STORAGE_KEY_FARMER_LANG,
  getTranslation,
} from '../i18n';
import { useAuth } from './AuthContext';

const FarmerLanguageContext = createContext(null);

export const FarmerLanguageProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const role = auth?.role;

  const [lang, setLangState] = useState(() => {
    try {
      const storedUser = localStorage.getItem('pashuprahari_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.role === 'FARMER' && parsed.language && Object.values(SUPPORTED_LANGUAGES).includes(parsed.language)) {
          return parsed.language;
        }
      }
      const saved = localStorage.getItem(STORAGE_KEY_FARMER_LANG);
      if (saved && Object.values(SUPPORTED_LANGUAGES).includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Failed to read farmer language from storage:', e);
    }
    return DEFAULT_FARMER_LANGUAGE;
  });

  // Sync language with authenticated role & session changes
  useEffect(() => {
    if (!isAuthenticated || !user || role !== 'FARMER') {
      // Non-Farmer (Admin, Vet, or Guest): ensure farmer context is reset to default
      setLangState(DEFAULT_FARMER_LANGUAGE);
    } else if (role === 'FARMER') {
      const userLang = user.language || localStorage.getItem(STORAGE_KEY_FARMER_LANG);
      if (userLang && Object.values(SUPPORTED_LANGUAGES).includes(userLang)) {
        setLangState(userLang);
      } else {
        setLangState(DEFAULT_FARMER_LANGUAGE);
      }
    }
  }, [isAuthenticated, user?.id, user?.language, role]);

  const setLang = (newLang) => {
    if (Object.values(SUPPORTED_LANGUAGES).includes(newLang)) {
      setLangState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY_FARMER_LANG, newLang);
        const storedUser = localStorage.getItem('pashuprahari_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'FARMER') {
            parsed.language = newLang;
            localStorage.setItem('pashuprahari_user', JSON.stringify(parsed));
          }
        }
      } catch (e) {
        console.warn('Failed to save farmer language to storage:', e);
      }
    }
  };

  const t = useMemo(() => {
    return (path, params) => getTranslation(lang, path, params);
  }, [lang]);

  const currentMeta = useMemo(() => {
    return LANGUAGE_METADATA.find((m) => m.code === lang) || LANGUAGE_METADATA[0];
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      currentMeta,
      languages: LANGUAGE_METADATA,
    }),
    [lang, t, currentMeta]
  );

  return (
    <FarmerLanguageContext.Provider value={value}>
      {children}
    </FarmerLanguageContext.Provider>
  );
};

export const useFarmerLanguage = () => {
  const context = useContext(FarmerLanguageContext);
  if (!context) {
    // Fallback safe translator if invoked outside FarmerLanguageProvider
    return {
      lang: DEFAULT_FARMER_LANGUAGE,
      setLang: () => {},
      t: (path, params) => getTranslation(DEFAULT_FARMER_LANGUAGE, path, params),
      currentMeta: LANGUAGE_METADATA[0],
      languages: LANGUAGE_METADATA,
    };
  }
  return context;
};
