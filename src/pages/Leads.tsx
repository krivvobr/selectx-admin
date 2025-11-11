import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with real data from database
const mockLeads = [
  {
    id: 1,
    name: "João Silva",
    phone: "(11) 98765-4321",
    email: "joao.silva@email.com",
    propertyName: "Apartamento 3 quartos no Centro",
    propertyUrl: "/property/123",
    date: "2025-11-10",
    status: "new"
  },
  {
    id: 2,
    name: "Maria Santos",
    phone: "(11) 97654-3210",
    email: "maria.santos@email.com",
    propertyName: "Casa 4 quartos no Jardim Paulista",
    propertyUrl: "/property/456",
    date: "2025-11-09",
    status: "contacted"
  },
  {
    id: 3,
    name: "Pedro Oliveira",
    phone: "(11) 96543-2109",
    email: "pedro.oliveira@email.com",
    propertyName: "Cobertura Duplex na Vila Madalena",
    propertyUrl: "/property/789",
    date: "2025-11-08",
    status: "new"
  },
];

const Leads = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads</h1>
          <p className="text-muted-foreground">
            Gerencie os interessados vindos do site
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Todos os Leads</CardTitle>
                <CardDescription>
                  Lista de contatos interessados em imóveis
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar leads..."
                  className="pl-10"
                />
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
                  <TableHead>Imóvel Interessado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {lead.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {lead.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={lead.propertyUrl}
                        className="flex items-center gap-2 text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {lead.propertyName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(lead.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={lead.status === "new" ? "default" : "secondary"}
                      >
                        {lead.status === "new" ? "Novo" : "Contatado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver detalhes
                      </Button>
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
