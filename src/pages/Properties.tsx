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

const properties = [
  {
    id: "1",
    code: "SLX001",
    title: "Apartamento Moderno - Centro",
    type: "Apartamento",
    purpose: "Venda",
    location: "Centro, São Paulo",
    price: "R$ 850.000",
    bedrooms: 3,
    area: "120m²",
    status: "Disponível",
  },
  {
    id: "2",
    code: "SLX002",
    title: "Casa com Piscina - Jardins",
    type: "Casa",
    purpose: "Venda",
    location: "Jardins, São Paulo",
    price: "R$ 1.200.000",
    bedrooms: 4,
    area: "250m²",
    status: "Vendido",
  },
  {
    id: "3",
    code: "SLX003",
    title: "Cobertura Duplex - Vila Nova",
    type: "Cobertura",
    purpose: "Locação",
    location: "Vila Nova, São Paulo",
    price: "R$ 2.500/mês",
    bedrooms: 3,
    area: "180m²",
    status: "Alugado",
  },
  {
    id: "4",
    code: "SLX004",
    title: "Sala Comercial - Centro",
    type: "Comercial",
    purpose: "Venda",
    location: "Centro, São Paulo",
    price: "R$ 450.000",
    bedrooms: 0,
    area: "80m²",
    status: "Disponível",
  },
];

const Properties = () => {
  const navigate = useNavigate();

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
              {properties.map((property) => (
                <TableRow key={property.id} className="hover:bg-hover">
                  <TableCell className="font-mono text-sm">
                    {property.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {property.title}
                  </TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>{property.purpose}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {property.location}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {property.price}
                  </TableCell>
                  <TableCell>
                    {property.bedrooms > 0 ? property.bedrooms : "-"}
                  </TableCell>
                  <TableCell>{property.area}</TableCell>
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
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default Properties;
