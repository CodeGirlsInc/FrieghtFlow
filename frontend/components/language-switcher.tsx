"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales } from "@/i18n";

const languageNames: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
};

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    const segments = pathname.split("/");

    // If first segment is a locale → replace it
    if (locales.includes(segments[1] as any)) {
      segments[1] = newLocale;
    } else {
      // Otherwise, just prepend locale
      segments.splice(1, 0, newLocale);
    }

    const newPath = segments.join("/") || "/";
    router.push(newPath);
  };

  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
            locale === loc
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span className="mr-1">{languageFlags[loc]}</span>
          {languageNames[loc]}
        </button>
      ))}
    </div>
  );
}
