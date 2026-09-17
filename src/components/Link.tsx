import { forwardRef } from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";
import { canonicalTo } from "@/lib/canonicalTo";

/**
 * Drop-in replacement for react-router's <Link>. Internal string paths are
 * emitted in the site's canonical trailing-slash form so crawlers never
 * discover the redirecting variant. All other props/styling pass through.
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, ...props }, ref) => (
  <RouterLink ref={ref} to={canonicalTo(to)} {...props} />
));

Link.displayName = "Link";

export { Link };
export default Link;
