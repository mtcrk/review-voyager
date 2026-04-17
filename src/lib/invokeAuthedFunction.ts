import { supabase } from "@/integrations/supabase/client";

type InvokeOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

async function getFunctionErrorMessage(error: unknown) {
  const defaultMessage = error instanceof Error ? error.message : "İstek başarısız oldu";

  if (!error || typeof error !== "object" || !("context" in error)) {
    return defaultMessage;
  }

  const context = (error as { context?: Response }).context;
  if (!context) {
    return defaultMessage;
  }

  try {
    const response = context.clone();
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = await response.json();
      if (payload && typeof payload.error === "string") {
        return payload.error;
      }
    }

    const text = await response.text();
    return text || defaultMessage;
  } catch {
    return defaultMessage;
  }
}

export async function invokeAuthedFunction<T = unknown>(
  functionName: string,
  options: InvokeOptions = {},
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Oturum doğrulanamadı. Lütfen tekrar giriş yapın.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Oturum doğrulanamadı. Lütfen tekrar giriş yapın.");
  }

  const response = await supabase.functions.invoke<T>(functionName, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.error) {
    throw new Error(await getFunctionErrorMessage(response.error));
  }

  return response.data;
}