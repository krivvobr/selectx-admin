import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNeighborhood, listCities, listNeighborhoodsByCity, type Neighborhood } from "@/services/locations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const Neighborhoods = () => {
  const qc = useQueryClient();
  const [cityId, setCityId] = useState<string>("");
  const { isAdmin } = useAuth();

  const { data: cities = [], isLoading: loadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => listCities(),
  });

  const { data: neighborhoods = [], isLoading: loadingNeighborhoods } = useQuery({
    queryKey: ["neighborhoods", cityId],
    queryFn: () => (cityId ? listNeighborhoodsByCity(cityId) : Promise.resolve([])),
    enabled: !!cityId,
  });

  const { mutateAsync: addNeighborhood, isPending } = useMutation({
    mutationFn: async (payload: { city_id: string; name: string }) => {
      return await createNeighborhood(payload);
    },
    onSuccess: () => {
      toast.success("Bairro cadastrado.");
      qc.invalidateQueries({ queryKey: ["neighborhoods", cityId] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao cadastrar bairro.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Apenas administradores podem cadastrar bairros.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!cityId) {
      toast.error("Selecione a cidade.");
      return;
    }
    if (!name) {
      toast.error("Informe o nome do bairro.");
      return;
    }
    await addNeighborhood({ city_id: cityId, name });
    (e.currentTarget as HTMLFormElement).reset();
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Bairro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="citySelect">Cidade</Label>
                <Select value={cityId} onValueChange={(v) => setCityId(v)}>
                  <SelectTrigger id="citySelect">
                    <SelectValue placeholder={loadingCities ? "Carregando..." : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} - {c.state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Bairro</Label>
                <Input id="name" name="name" placeholder="Ex: Centro" disabled={!isAdmin} />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isPending || !cityId || !isAdmin}>Salvar</Button>
              </div>
            </form>
            {!isAdmin && (
              <p className="text-sm text-muted-foreground mt-2">
                Você não tem permissão para cadastrar bairros.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bairros Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {(!cityId || loadingNeighborhoods) ? (
              <p className="text-sm text-muted-foreground">{!cityId ? "Selecione uma cidade para listar" : "Carregando..."}</p>
            ) : (
              <ul className="space-y-2">
                {neighborhoods.map((n: Neighborhood) => (
                  <li key={n.id} className="flex justify-between border rounded p-2">
                    <span>{n.name}</span>
                  </li>
                ))}
                {neighborhoods.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum bairro para esta cidade.</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Neighborhoods;