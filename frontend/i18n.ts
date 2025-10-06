import { getRequestConfig } from "next-intl/server";

// Supported locales
export const locales = ["en", "es", "fr"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Pick safe locale: if undefined or unsupported → fallback to 'en'
  const safeLocale: Locale =
    locale && locales.includes(locale as Locale) ? (locale as Locale) : "en";

  return {
    locale: safeLocale,
    messages: (await import(`./messages/${safeLocale}.json`)).default,
  };
});
