"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Dictionary, type Language } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ko",
  setLanguage: () => {},
  t: translations.ko,
});

const STORAGE_KEY = "mindtodo_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start at "ko" so the server render and the client's first paint
  // match exactly — reading localStorage here (even gated on `typeof
  // window`) let the client's *first* render differ from the server's,
  // which is a hydration mismatch on every piece of text `t` touches, not
  // just a cosmetic one. The saved language is applied afterward, in an
  // effect that only ever runs client-side post-hydration.
  const [language, setLanguageState] = useState<Language>("ko");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "ko" || saved === "en") {
      // deliberately diverging from the SSR-safe initial state above —
      // this is the sync-from-localStorage-after-mount step the fix depends on
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(next: Language) {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
