import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}

const DEFAULT_SITE_URL = "https://awakening-homeopathy.web.app";

function resolveSiteUrl() {
  const configured = String(import.meta.env.VITE_SITE_URL || "").trim().replace(/\/$/, "");
  const isLocalConfigured = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured);

  if (import.meta.env.PROD && (!configured || isLocalConfigured)) {
    return DEFAULT_SITE_URL;
  }

  return configured || window.location.origin || DEFAULT_SITE_URL;
}

export function useSEO({ title, description, path = "/", noIndex = false }: SeoOptions) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const siteUrl = resolveSiteUrl();
    const canonical = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large");
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:url"]', "property", "og:url", canonical);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "Awakening Homoeopathy");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [title, description, path, noIndex]);
}
