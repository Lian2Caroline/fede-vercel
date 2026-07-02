import { createContext, useContext } from "react";
import type { LangCode } from "@/lib/lang";

interface LangContextValue {
  lang: LangCode;
  switchLang: (newLang: LangCode) => void;
}

export const LangContext = createContext<LangContextValue>({
  lang: "fr",
  switchLang: () => {},
});

export const useLang = () => useContext(LangContext);
