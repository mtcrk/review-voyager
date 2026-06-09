import { jsxs, jsx } from "react/jsx-runtime";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
const SITE_URL = "https://voyagerespond.com";
const SEO = ({ title, description, canonical, ogImage, ogType, noindex, jsonLd }) => {
  const location = useLocation();
  const isEn = location.pathname.startsWith("/en/") || location.pathname === "/en";
  let url = canonical ? canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}` : void 0;
  if (isEn) {
    url = `${SITE_URL}${location.pathname}`;
  }
  const image = ogImage || `${SITE_URL}/og-image.png`;
  const ldArray = jsonLd ? Array.isArray(jsonLd) ? jsonLd : [jsonLd] : [];
  return /* @__PURE__ */ jsxs(Helmet, { children: [
    /* @__PURE__ */ jsx("title", { children: title }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: description }),
    url && /* @__PURE__ */ jsx("link", { rel: "canonical", href: url }),
    /* @__PURE__ */ jsx(
      "meta",
      {
        name: "robots",
        content: noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      }
    ),
    /* @__PURE__ */ jsx("meta", { property: "og:title", content: title }),
    /* @__PURE__ */ jsx("meta", { property: "og:description", content: description }),
    url && /* @__PURE__ */ jsx("meta", { property: "og:url", content: url }),
    /* @__PURE__ */ jsx("meta", { property: "og:image", content: image }),
    /* @__PURE__ */ jsx("meta", { property: "og:image:width", content: "1200" }),
    /* @__PURE__ */ jsx("meta", { property: "og:image:height", content: "630" }),
    /* @__PURE__ */ jsx("meta", { property: "og:type", content: ogType || "website" }),
    /* @__PURE__ */ jsx("meta", { property: "og:locale", content: "tr_TR" }),
    /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: "VoyageRespond" }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:card", content: "summary_large_image" }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: title }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: description }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: image }),
    ldArray.map((ld, i) => /* @__PURE__ */ jsx("script", { type: "application/ld+json", children: JSON.stringify(ld) }, i))
  ] });
};
export {
  SEO as S
};
