import { supabase } from "@/lib/supabaseClient";

export type City = {
  id: string;
  name: string;
  state: string;
  created_at?: string;
};

export type Neighborhood = {
  id: string;
  city_id: string;
  name: string;
  created_at?: string;
};

export async function listCities() {
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, state")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as City[];
}

export async function createCity(payload: { name: string; state: string }) {
  const { data, error } = await supabase
    .from("cities")
    .insert(payload)
    .select("id, name, state")
    .single();
  if (error) throw error;
  return data as City;
}

export async function updateCity(id: string, payload: { name: string; state: string }) {
  const { data, error } = await supabase
    .from("cities")
    .update(payload)
    .eq("id", id)
    .select("id, name, state")
    .single();
  if (error) throw error;
  return data as City;
}

export async function deleteCity(id: string) {
  const { error } = await supabase.from("cities").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function listNeighborhoodsByCity(cityId: string) {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name, city_id")
    .eq("city_id", cityId)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Neighborhood[];
}

export async function createNeighborhood(payload: { city_id: string; name: string }) {
  const { data, error } = await supabase
    .from("neighborhoods")
    .insert(payload)
    .select("id, name, city_id")
    .single();
  if (error) throw error;
  return data as Neighborhood;
}

export async function updateNeighborhood(id: string, payload: { name: string }) {
  const { data, error } = await supabase
    .from("neighborhoods")
    .update(payload)
    .eq("id", id)
    .select("id, name, city_id")
    .single();
  if (error) throw error;
  return data as Neighborhood;
}

export async function deleteNeighborhood(id: string) {
  const { error } = await supabase.from("neighborhoods").delete().eq("id", id);
  if (error) throw error;
  return true;
}
