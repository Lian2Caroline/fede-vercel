import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HREFLANG_MAP, SITE_URL, isValidLang, LANG_CODES } from "@/lib/lang";
import type { LangCode } from "@/lib/lang";

interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}

export function useSEO({ title, description, path = "/", noindex = false }: SEOOptions) {
  const { i18n } = useTranslation();
  const lang = isValidLang(i18n.language) ? (i18n.language as LangCode) : "fr";
  const pagePath = path === "/" ? "" : path;

  useEffect(() => {
    document.title = title;

    const canonical = `${SITE_URL}/${lang}${pagePath}`;

    let canonEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonEl) {
      canonEl = document.createElement("link");
      canonEl.rel = "canonical";
      document.head.appendChild(canonEl);
    }
    canonEl.href = canonical;

    if (description) {
      const descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (descEl) descEl.content = description;
    }

    const ogUrlEl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (ogUrlEl) ogUrlEl.content = canonical;

    const ogTitleEl = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (ogTitleEl) ogTitleEl.content = title;

    if (description) {
      const ogDescEl = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
      if (ogDescEl) ogDescEl.content = description;
    }

    if (noindex) {
      let robotsEl = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (!robotsEl) {
        robotsEl = document.createElement("meta");
        robotsEl.name = "robots";
        document.head.appendChild(robotsEl);
      }
      robotsEl.content = "noindex, nofollow";
    }

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    const allLangs = Array.from(LANG_CODES) as LangCode[];
    const fragment = document.createDocumentFragment();
    for (const l of allLangs) {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.setAttribute("hreflang", HREFLANG_MAP[l]);
      link.href = `${SITE_URL}/${l}${pagePath}`;
      fragment.appendChild(link);
    }
    const xDef = document.createElement("link");
    xDef.rel = "alternate";
    xDef.setAttribute("hreflang", "x-default");
    xDef.href = `${SITE_URL}/fr${pagePath}`;
    fragment.appendChild(xDef);
    document.head.appendChild(fragment);

    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    };
  }, [lang, title, description, pagePath, noindex]);
}
