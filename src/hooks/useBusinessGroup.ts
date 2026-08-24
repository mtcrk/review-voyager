import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GroupMembership {
  groupId: string;
  groupName: string;
  role: "group_admin" | "property_user";
  businessId: string | null;
}

/** Kullanıcının group_admin olduğu ilk grup (Faz 1: tek grup varsayımı). */
export function useAdminGroup() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-group", user?.id],
    queryFn: async (): Promise<GroupMembership | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("business_group_members")
        .select("group_id, role, business_id, business_groups(name)")
        .eq("user_id", user.id)
        .eq("role", "group_admin")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("useAdminGroup error", error);
        return null;
      }
      if (!data) return null;

      return {
        groupId: data.group_id,
        groupName: (data as any).business_groups?.name ?? "Grup",
        role: "group_admin",
        businessId: data.business_id,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export interface GroupPropertyRow {
  business_id: string;
  business_name: string;
  review_count: number;
  avg_rating: number | null;
  reply_rate: number | null;
  avg_reply_hours: number | null;
  prev_review_count: number;
  prev_avg_rating: number | null;
}

export function useGroupSummary(groupId: string | undefined, from: Date, to: Date) {
  return useQuery({
    queryKey: ["group-summary", groupId, from.toISOString(), to.toISOString()],
    queryFn: async (): Promise<GroupPropertyRow[]> => {
      if (!groupId) return [];
      const { data, error } = await (supabase as any).rpc("group_property_summary", {
        _group_id: groupId,
        _from: from.toISOString(),
        _to: to.toISOString(),
      });
      if (error) throw error;
      return (data ?? []) as GroupPropertyRow[];
    },
    enabled: !!groupId,
  });
}

export interface GroupTopicCell {
  business_id: string;
  business_name: string;
  topic_id: string;
  category: string | null;
  is_decision_driver: boolean | null;
  total_mentions: number;
  positive_mentions: number;
  negative_mentions: number;
  positive_rate: number | null;
}

/** Grup içi konu matrisi — tek RPC, tesis/konu başına ayrı sorgu yok. */
export function useGroupTopicMatrix(groupId: string | undefined, from: Date, to: Date) {
  return useQuery({
    queryKey: ["group-topic-matrix", groupId, from.toISOString(), to.toISOString()],
    queryFn: async (): Promise<GroupTopicCell[]> => {
      if (!groupId) return [];
      const { data, error } = await (supabase as any).rpc("group_topic_matrix", {
        _group_id: groupId,
        _from: from.toISOString(),
        _to: to.toISOString(),
      });
      if (error) throw error;
      return (data ?? []) as GroupTopicCell[];
    },
    enabled: !!groupId,
    staleTime: 60_000,
  });
}

export interface GroupTopicQuote {
  review_id: string;
  excerpt: string | null;
  sentiment: number;
  posted_at: string;
  platform: string | null;
  rating: number | null;
  review_text: string | null;
  highlights: any;
  total_count: number;
}

export function useGroupTopicQuotes(
  groupId: string | undefined,
  businessId: string | undefined,
  topicId: string | undefined,
  from: Date,
  to: Date,
  limit = 20,
  offset = 0,
) {
  return useQuery({
    queryKey: [
      "group-topic-quotes",
      groupId,
      businessId,
      topicId,
      from.toISOString(),
      to.toISOString(),
      limit,
      offset,
    ],
    queryFn: async (): Promise<GroupTopicQuote[]> => {
      if (!groupId || !businessId || !topicId) return [];
      const { data, error } = await (supabase as any).rpc("group_topic_quotes", {
        _group_id: groupId,
        _business_id: businessId,
        _topic_id: topicId,
        _from: from.toISOString(),
        _to: to.toISOString(),
        _limit: limit,
        _offset: offset,
      });
      if (error) throw error;
      return (data ?? []) as GroupTopicQuote[];
    },
    enabled: !!groupId && !!businessId && !!topicId,
  });
}

/** ci_topics taksonomisinin TR etiketleri. */
export function useTopicLabels() {
  return useQuery({
    queryKey: ["ci_topics_labels"],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("ci_topics").select("id, display_name");
      if (error) throw error;
      const out: Record<string, string> = {};
      for (const t of (data ?? []) as any[]) {
        out[t.id] = t.display_name?.tr ?? t.display_name?.en ?? t.id;
      }
      return out;
    },
    staleTime: 60 * 60 * 1000,
  });
}

