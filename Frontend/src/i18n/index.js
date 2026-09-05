import en from './locales/en.js';
import hi from './locales/hi.js';
import mr from './locales/mr.js';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_FARMER_LANGUAGE,
  LANGUAGE_METADATA,
  STORAGE_KEY_FARMER_LANG,
} from './languageConfig.js';

const translations = {
  [SUPPORTED_LANGUAGES.EN]: en,
  [SUPPORTED_LANGUAGES.HI]: hi,
  [SUPPORTED_LANGUAGES.MR]: mr,
};

/**
 * Resolve a dot-notated key path from a translation dictionary
 * with fallback to English.
 * 
 * @param {string} lang - 'en' | 'hi' | 'mr'
 * @param {string} path - e.g. 'report.title' or 'navigation.dashboard'
 * @param {Object} [params] - Optional interpolation parameters { name: 'Ramesh' }
 * @returns {string}
 */
export const getTranslation = (lang, path, params = {}) => {
  const targetLang = translations[lang] ? lang : DEFAULT_FARMER_LANGUAGE;
  const dict = translations[targetLang] || en;
  const fallbackDict = en;

  const resolve = (obj, p) => {
    if (!obj || !p) return null;
    return p.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
  };

  let result = resolve(dict, path);
  if (result === null || result === undefined) {
    result = resolve(fallbackDict, path) || path;
  }

  if (typeof result === 'string' && params && Object.keys(params).length > 0) {
    Object.entries(params).forEach(([k, v]) => {
      result = result.replace(new RegExp(`{${k}}`, 'g'), v);
    });
  }

  return result;
};

/**
 * Creates a bound translation function t(path, params) for a given language.
 */
export const createTranslator = (lang) => {
  return (path, params) => getTranslation(lang, path, params);
};

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_FARMER_LANGUAGE,
  LANGUAGE_METADATA,
  STORAGE_KEY_FARMER_LANG,
  translations,
};
