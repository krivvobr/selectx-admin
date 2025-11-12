import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCity, listCities, type City } from "@/services/locations";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const Cities = () => {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: () => listCities(),
  });

  const { mutateAsync: addCity, isPending } = useMutation({
    mutationFn: async (payload: { name: string; state: string }) => {
      return await createCity(payload);
    },
    onSuccess: () => {
      toast.success("Cidade cadastrada.");
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao cadastrar cidade.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Apenas administradores podem cadastrar cidades.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const state = String(fd.get("state") ?? "").trim();
    if (!name || !state) {
      toast.error("Informe nome e estado (UF).");
      return;
    }
    await addCity({ name, state });
    (e.currentTarget as HTMLFormElement).reset();
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Cidade</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" placeholder="Ex: São Paulo" disabled={!isAdmin} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">UF</Label>
                <Input id="state" name="state" placeholder="Ex: SP" disabled={!isAdmin} />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isPending || !isAdmin}>Salvar</Button>
              </div>
            </form>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cidades Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
              <ul className="space-y-2">
                {cities.map((c: City) => (
                  <li key={c.id} className="flex justify-between border rounded p-2">
                    <span>{c.name} - {c.state}</span>
                  </li>
                ))}
                {cities.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma cidade cadastrada.</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cities;