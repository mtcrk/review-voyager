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
