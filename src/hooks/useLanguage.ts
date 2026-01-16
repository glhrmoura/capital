import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: 'pt-BR' | 'en') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return {
    currentLanguage: i18n.language as 'pt-BR' | 'en',
    changeLanguage,
  };
};
