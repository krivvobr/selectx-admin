import { supabase } from "@/lib/supabaseClient";

export type PropertyType = "apartamento" | "casa" | "cobertura" | "comercial" | "terreno";
export type PropertyPurpose = "venda" | "locacao";
export type PropertyStatus = "disponivel" | "vendido" | "alugado" | "inativo";

export interface Property {
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  address: string | null;
  city_id: string | null;
  neighborhood_id: string | null;
  state: string | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  suites: number | null;
  parking: number | null;
  furnished: boolean;
  financing: boolean;
  floor: number | null;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
}

export type PropertyInput = Omit<Property, "id" | "created_at" | "updated_at">;

export async function listProperties() {
  return supabase.from("properties").select("*").order("created_at", { ascending: false });
}

export async function getPropertyById(id: string) {
  return supabase.from("properties").select("*").eq("id", id).single();
}

export async function createProperty(input: PropertyInput) {
  return supabase.from("properties").insert(input).select("*").single();
}

export async function updateProperty(id: string, input: Partial<PropertyInput>) {
  return supabase.from("properties").update(input).eq("id", id).select("*").single();
}

export async function deleteProperty(id: string) {
  return supabase.from("properties").delete().eq("id", id);
}