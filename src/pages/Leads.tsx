import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listLeads, deleteLead } from "@/services/leads";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const Leads = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { session, loading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await listLeads();
      if (error) throw error;
      return data ?? [];
    },
    enabled: !loading && !!session,
  });

  // Removido fluxo de "marcar contatado" conforme solicitação

  const { mutateAsync: removeLead, isLoading: deleting } = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await deleteLead(leadId);
      if (error) throw error;
    },
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads</h1>
          <p className="text-muted-foreground">Gerencie os interessados vindos do site</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Todos os Leads</CardTitle>
                <CardDescription>Lista de contatos interessados em imóveis</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar leads..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && data && data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && data && data.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {lead.phone ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {lead.email ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                        {lead.status === "new" ? "Novo" : "Contatado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = lead.property_url as string | undefined;
                            if (url && typeof url === "string") {
                              window.open(url, "_blank");
                              return;
                            }
                            if (lead.property_id) {
                              navigate(`/edit-property/${lead.property_id}`);
                              return;
                            }
                            toast({ title: "Sem imóvel", description: "Este lead não possui URL associada." });
                          }}
                        >
                          Ver imóvel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleting}
                          onClick={async () => {
                            if (!window.confirm("Deseja realmente remover este lead?")) return;
                            try {
                              await removeLead(lead.id);
                              toast({ title: "Lead removido", description: "O lead foi excluído." });
                              queryClient.invalidateQueries({ queryKey: ["leads"] });
                            } catch (err: any) {
                              toast({ title: "Erro", description: err?.message ?? "Falha ao remover lead." });
                            }
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Leads;
