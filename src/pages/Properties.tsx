import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProperties, deleteProperty, type Property } from "@/services/properties";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

function formatCurrencyBR(value?: number | null) {
  if (value == null) return "-";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  } catch {
    return String(value);
  }
}

function formatArea(value?: number | null) {
  if (value == null) return "-";
  return `${value}m²`;
}

function labelType(type?: Property["type"]) {
  switch (type) {
    case "apartamento":
      return "Apartamento";
    case "casa":
      return "Casa";
    case "cobertura":
      return "Cobertura";
    case "comercial":
      return "Comercial";
    case "terreno":
      return "Terreno";
    default:
      return "-";
  }
}

function labelPurpose(purpose?: Property["purpose"]) {
  switch (purpose) {
    case "venda":
      return "Venda";
    case "locacao":
      return "Locação";
    default:
      return "-";
  }
}

function labelStatus(status?: Property["status"]) {
  switch (status) {
    case "disponivel":
      return "Disponível";
    case "vendido":
      return "Vendido";
    case "alugado":
      return "Alugado";
    case "inativo":
      return "Inativo";
    default:
      return "-";
  }
}

const Properties = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await listProperties();
      if (error) throw error;
      return data as Property[];
    },
    retry: false,
    refetchOnMount: "always",
  });

  const { mutateAsync: removeProperty, isLoading: deleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteProperty(id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Imóvel excluído com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao excluir imóvel.");
    },
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Gerenciar Imóveis
            </h2>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie todos os imóveis cadastrados
            </p>
          </div>
          <Button onClick={() => navigate("/add-property")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Imóvel
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, código ou localização..."
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Finalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="locacao">Locação</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-table-header">
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Finalidade</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Quartos</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Carregando imóveis...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-destructive">
                    Erro ao carregar imóveis: {error instanceof Error ? error.message : "Tente novamente mais tarde."}
                  </TableCell>
                </TableRow>
              ) : !data || data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Nenhum imóvel encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((property) => (
                  <TableRow key={property.id} className="hover:bg-hover">
                    <TableCell className="font-mono text-sm">{property.code}</TableCell>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{labelType(property.type)}</TableCell>
                    <TableCell>{labelPurpose(property.purpose)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {property.neighborhood && property.city
                        ? `${property.neighborhood}, ${property.city}`
                        : property.city || "-"}
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrencyBR(property.price)}</TableCell>
                    <TableCell>{property.bedrooms ?? "-"}</TableCell>
                    <TableCell>{formatArea(property.area)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          property.status === "disponivel"
                            ? "default"
                            : property.status === "vendido"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {labelStatus(property.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/edit-property/${property.id}`)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleting}
                          onClick={async () => {
                            if (!window.confirm("Deseja realmente excluir este imóvel?")) return;
                            await removeProperty(property.id);
                          }}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Properties;
