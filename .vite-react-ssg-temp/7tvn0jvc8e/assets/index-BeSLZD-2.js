import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { s as supabase } from "../main.mjs";
const lovableAuth = createLovableAuth();
const lovable = {
  auth: {
    signInWithOAuth: async (provider, opts) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts == null ? void 0 : opts.redirect_uri,
        extraParams: {
          ...opts == null ? void 0 : opts.extraParams
        }
      });
      if (result.redirected) {
        return result;
      }
      if (result.error) {
        return result;
      }
      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    }
  }
};
export {
  lovable as l
};
