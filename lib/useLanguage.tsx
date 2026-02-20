"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, ReactElement } from "react";
import { Language } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }): ReactElement {
  const [language, setLanguageState] = useState<Language>("fr");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Get saved language from localStorage
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && (saved === "en" || saved === "fr")) {
      setLanguageState(saved);
    } else {
      // Default to French
      setLanguageState("fr");
      localStorage.setItem("language", "fr");
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
