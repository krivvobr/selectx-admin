import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Building2, TrendingUp, Users, DollarSign } from "lucide-react";
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

const recentProperties = [
  {
    id: "1",
    title: "Apartamento Moderno - Centro",
    type: "Apartamento",
    price: "R$ 850.000",
    status: "Disponível",
    date: "15/01/2025",
  },
  {
    id: "2",
    title: "Casa com Piscina - Jardins",
    type: "Casa",
    price: "R$ 1.200.000",
    status: "Vendido",
    date: "14/01/2025",
  },
  {
    id: "3",
    title: "Cobertura Duplex - Vila Nova",
    type: "Cobertura",
    price: "R$ 2.500/mês",
    status: "Alugado",
    date: "13/01/2025",
  },
  {
    id: "4",
    title: "Sala Comercial - Centro",
    type: "Comercial",
    price: "R$ 450.000",
    status: "Disponível",
    date: "12/01/2025",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
            value="124"
            icon={Building2}
            trend="+12% este mês"
          />
          <StatCard
            title="Vendas este Mês"
            value="18"
            icon={TrendingUp}
            trend="+25% vs mês anterior"
          />
          <StatCard
            title="Leads Ativos"
            value="342"
            icon={Users}
            trend="+8% esta semana"
          />
          <StatCard
            title="Receita Total"
            value="R$ 2.4M"
            icon={DollarSign}
            trend="+15% este mês"
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
              {recentProperties.map((property) => (
                <TableRow key={property.id} className="hover:bg-hover">
                  <TableCell className="font-medium">
                    {property.title}
                  </TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>{property.price}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        property.status === "Disponível"
                          ? "default"
                          : property.status === "Vendido"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {property.date}
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
