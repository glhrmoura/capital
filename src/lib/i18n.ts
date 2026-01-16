import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from '../locales/pt-BR.json';
import en from '../locales/en.json';

const getStoredLanguage = (): string => {
  const stored = localStorage.getItem('language');
  if (stored && (stored === 'pt-BR' || stored === 'en')) {
    return stored;
  }
  const browserLang = navigator.language || navigator.languages[0];
  return browserLang.startsWith('pt') ? 'pt-BR' : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        translation: ptBR,
      },
      en: {
        translation: en,
      },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
