export const translations = {
  en: {
    title: 'FrieghtFlow',
    dashboard: 'Dashboard',
    shipments: 'Shipments',
    settings: 'Settings',
    logout: 'Logout',
    quote: 'Get Quote',
    track: 'Track Shipment',
  },
  es: {
    title: 'FrieghtFlow',
    dashboard: 'Panel de Control',
    shipments: 'Envíos',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    quote: 'Obtener Cotización',
    track: 'Rastrear Envío',
  },
  fr: {
    title: 'FrieghtFlow',
    dashboard: 'Tableau de Bord',
    shipments: 'Expéditions',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    quote: 'Obtenir un Devis',
    track: 'Suivre Envoi',
  },
};

export type Language = keyof typeof translations;

export function useTranslation(lang: Language) {
  return translations[lang] || translations.en;
}
