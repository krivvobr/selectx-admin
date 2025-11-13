import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCity, listCities, type City, deleteCity, updateCity } from "@/services/locations";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const Cities = () => {
  const qc = useQueryClient();
  const { isAdmin, session } = useAuth();
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: () => listCities(),
    enabled: !!session,
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

  const { mutateAsync: removeCity } = useMutation({
    mutationFn: async (id: string) => {
      return await deleteCity(id);
    },
    onSuccess: () => {
      toast.success("Cidade removida.");
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao remover cidade.");
    },
  });

  const { mutateAsync: editCity } = useMutation({
    mutationFn: async (payload: { id: string; name: string; state: string }) => {
      return await updateCity(payload.id, { name: payload.name, state: payload.state });
    },
    onSuccess: () => {
      toast.success("Cidade atualizada.");
      qc.invalidateQueries({ queryKey: ["cities"] });
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao atualizar cidade.");
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
  };

  const handleDelete = (city: City) => {
    setSelectedCity(city);
    setDeleteAlertOpen(true);
  };

  const handleEdit = (city: City) => {
    setSelectedCity(city);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCity) return;
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const state = String(fd.get("state") ?? "").trim();
    if (!name || !state) {
      toast.error("Informe nome e estado (UF).");
      return;
    }
    await editCity({ id: selectedCity.id, name, state });
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={!isAdmin}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(c)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(c)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a cidade e todos os bairros associados a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedCity && removeCity(selectedCity.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cidade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={selectedCity?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input id="state" name="state" defaultValue={selectedCity?.state} />
            </div>
            <Button type="submit">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Cities;