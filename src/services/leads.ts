import { supabase } from "@/lib/supabaseClient";

export type LeadStatus = "new" | "contacted";

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  property_id: string | null;
  status: LeadStatus;
  created_at: string;
  notes: string | null;
}

export type LeadInput = Omit<Lead, "id" | "created_at">;

export async function listLeads() {
  return supabase
    .from("leads")
    .select("*, properties:property_id(code, title)")
    .order("created_at", { ascending: false });
}

export async function createLead(input: Omit<LeadInput, "status"> & { status?: LeadStatus }) {
  const payload = { status: "new" as LeadStatus, ...input };
  return supabase.from("leads").insert(payload).select("*").single();
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return supabase.from("leads").update({ status }).eq("id", id).select("*").single();
}