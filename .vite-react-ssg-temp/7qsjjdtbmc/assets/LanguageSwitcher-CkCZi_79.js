import { jsxs, jsx } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { b as useUrlLocale, D as DropdownMenu, c as DropdownMenuTrigger, B as Button, d as DropdownMenuContent, e as DropdownMenuItem } from "../main.mjs";
import { useNavigate, useLocation } from "react-router-dom";
function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildPath } = useUrlLocale();
  const changeLanguage = (lng) => {
    const target = buildPath(lng);
    navigate(`${target}${location.search}${location.hash}`);
  };
  return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2", children: [
      /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "uppercase", children: i18n.language })
    ] }) }),
    /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
      /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => changeLanguage("en"), children: "English" }),
      /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => changeLanguage("tr"), children: "Türkçe" })
    ] })
  ] });
}
export {
  LanguageSwitcher as L
};
