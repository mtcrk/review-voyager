// Explicit allowlist gate for AI analysis jobs.
//
// Reads ANALYSIS_ALLOWLIST_EMAILS (comma-separated). Resolves those auth users
// to every business they own. Fail-safe: an unset/empty env var yields an empty
// set, so nothing is processed — analysis never opens up to everyone by accident.
//
// This gate REPLACES the subscription check for the jobs that use it: allowlisted
// accounts are processed regardless of billing status.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Code-level additions to ANALYSIS_ALLOWLIST_EMAILS (union with the env var).
const EXTRA_ALLOWED_EMAILS = [
  "gozdemersin@almira.com.tr",
  "esra@titanic.com",
];

export function allowlistEmails(): string[] {
  const raw = Deno.env.get("ANALYSIS_ALLOWLIST_EMAILS") ?? "";
  return Array.from(
    new Set(
      [...raw.split(","), ...EXTRA_ALLOWED_EMAILS]
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0),
    ),
  );
}

export type AllowlistResolution = {
  emails: string[];
  matchedEmails: string[];
  businessIds: Set<string>;
};

/** Resolve the allowlisted emails to owned business ids. Empty env => empty set. */
export async function resolveAllowlistBusinessIds(
  supabaseUrl: string,
  serviceKey: string,
): Promise<AllowlistResolution> {
  const emails = allowlistEmails();
  const businessIds = new Set<string>();
  const matchedEmails: string[] = [];
  if (emails.length === 0) return { emails, matchedEmails, businessIds };

  const admin = createClient(supabaseUrl, serviceKey);
  const wanted = new Set(emails);
  const userIds: string[] = [];

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const users = data?.users ?? [];
    for (const u of users) {
      const email = (u.email ?? "").trim().toLowerCase();
      if (email && wanted.has(email)) {
        userIds.push(u.id);
        if (!matchedEmails.includes(email)) matchedEmails.push(email);
      }
    }
    if (users.length < 1000) break;
  }

  if (userIds.length > 0) {
    const { data: biz, error: bizErr } = await admin
      .from("businesses")
      .select("id")
      .in("user_id", userIds);
    if (bizErr) throw bizErr;
    for (const b of biz ?? []) businessIds.add(b.id as string);
  }

  return { emails, matchedEmails, businessIds };
}
