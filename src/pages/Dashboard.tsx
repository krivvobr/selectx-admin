import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { countProperties, listRecentProperties } from "@/services/properties";
import { countLeads } from "@/services/leads";

const formatCurrencyBR = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const labelType = (type: string) => {
  const map: Record<string, string> = {
    apartamento: "Apartamento",
    casa: "Casa",
    cobertura: "Cobertura",
    comercial: "Comercial",
    terreno: "Terreno",
  };
  return map[type] ?? type;
};

const labelStatus = (status: string) => {
  const map: Record<string, string> = {
    disponivel: "Disponível",
    vendido: "Vendido",
    alugado: "Alugado",
    inativo: "Inativo",
  };
  return map[status] ?? status;
};

const statusVariant = (status: string): "default" | "secondary" | "outline" => {
  switch (status) {
    case "disponivel":
      return "default";
    case "vendido":
      return "secondary";
    case "alugado":
    case "inativo":
    default:
      return "outline";
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const {
    data: propertiesCount,
    isLoading: loadingPropsCount,
  } = useQuery({
    queryKey: ["properties-count"],
    queryFn: () => countProperties(),
    refetchOnMount: "always",
    enabled: !!session,
  });

  const { data: leadsCount, isLoading: loadingLeadsCount } = useQuery({
    queryKey: ["leads-count"],
    queryFn: () => countLeads(),
    refetchOnMount: "always",
    enabled: !!session,
  });

  const { data: recent, isLoading: loadingRecent } = useQuery({
    queryKey: ["recent-properties"],
    queryFn: async () => {
      const { data, error } = await listRecentProperties(5);
      if (error) throw error;
      return data ?? [];
    },
    refetchOnMount: "always",
    enabled: !!session,
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Visão geral dos seus imóveis
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Imóveis"
            value={loadingPropsCount ? "--" : propertiesCount ?? 0}
            icon={Building2}
          />

          <StatCard
            title="Leads"
            value={loadingLeadsCount ? "--" : leadsCount ?? 0}
            icon={Users}
          />
        </div>

        {/* Recent Properties */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Imóveis Recentes
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Últimas atualizações do sistema
              </p>
            </div>
            <Button onClick={() => navigate("/properties")}>
              Ver Todos
            </Button>
          </div>

          <Table>
            <TableHeader className="bg-table-header">
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRecent && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}
              {!loadingRecent && recent && recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum imóvel encontrado.
                  </TableCell>
                </TableRow>
              )}
              {!loadingRecent && recent && recent.map((property) => (
                <TableRow key={property.id} className="hover:bg-hover">
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>{labelType(property.type)}</TableCell>
                  <TableCell>{formatCurrencyBR(property.price)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(property.status)}>
                      {labelStatus(property.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(property.updated_at || property.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
