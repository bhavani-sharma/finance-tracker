// lib/hooks/useTransactions.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

export function useTransactions(month: string) {
  return useQuery({
    queryKey: ["transactions", month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", `${month}-01`)
        .lte("date", `${month}-31`)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tx: any) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...tx, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
