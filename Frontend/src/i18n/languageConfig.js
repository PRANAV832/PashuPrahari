/**
 * Farmer Language Configuration
 * Supported languages: English (en), Hindi (hi), Marathi (mr)
 */

export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  MR: 'mr',
};

export const DEFAULT_FARMER_LANGUAGE = SUPPORTED_LANGUAGES.EN;

export const LANGUAGE_METADATA = [
  {
    code: SUPPORTED_LANGUAGES.EN,
    name: 'English',
    nativeName: 'English',
    speechCode: 'en-IN',
    shortLabel: 'EN',
  },
  {
    code: SUPPORTED_LANGUAGES.HI,
    name: 'Hindi',
    nativeName: 'हिंदी',
    speechCode: 'hi-IN',
    shortLabel: 'हिं',
  },
  {
    code: SUPPORTED_LANGUAGES.MR,
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    shortLabel: 'म',
  },
];

export const STORAGE_KEY_FARMER_LANG = 'pashuprahari_farmer_lang';
