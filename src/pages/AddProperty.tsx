import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createProperty } from "@/services/properties";
import { listCities, listNeighborhoodsByCity } from "@/services/locations";
import { useAuth } from "@/hooks/use-auth";

const AddProperty = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [type, setType] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [furnished, setFurnished] = useState<string>("nao");
  const [financing, setFinancing] = useState<string>("sim");
  const [cityId, setCityId] = useState<string>("");
  const [neighborhoodId, setNeighborhoodId] = useState<string>("");

  const { mutateAsync: addProperty, isLoading } = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await createProperty(payload);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Imóvel cadastrado com sucesso!");
      navigate("/properties");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao cadastrar imóvel.");
    },
  });

  const { data: cities = [], isLoading: loadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => listCities(),
  });

  const { data: neighborhoods = [], isLoading: loadingNeighborhoods } = useQuery({
    queryKey: ["neighborhoods", cityId],
    queryFn: () => (cityId ? listNeighborhoodsByCity(cityId) : Promise.resolve([])),
    enabled: !!cityId,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Apenas administradores podem cadastrar imóveis.");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const getNum = (key: string) => {
      const val = String(fd.get(key) ?? "").trim();
      return val ? Number(val) : null;
    };

    const payload = {
      code: String(fd.get("code") ?? "").trim(),
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      type: type as any,
      purpose: purpose as any,
      price: Number(String(fd.get("price") ?? "0")),
      address: String(fd.get("address") ?? "").trim(),
      city: (() => {
        const c = cities.find((x) => x.id === cityId);
        return c ? c.name : "";
      })(),
      state: (() => {
        const c = cities.find((x) => x.id === cityId);
        return c ? c.state : "";
      })(),
      neighborhood: (() => {
        const n = neighborhoods.find((x) => x.id === neighborhoodId);
        return n ? n.name : "";
      })(),
      area: getNum("area"),
      bedrooms: getNum("bedrooms"),
      bathrooms: getNum("bathrooms"),
      parking: getNum("parking"),
      furnished: furnished === "sim",
      financing: financing === "sim",
      floor: getNum("floor"),
      status: "disponivel" as const,
    };

    if (!payload.type || !payload.purpose) {
      toast.error("Selecione o tipo e a finalidade do imóvel.");
      return;
    }

    if (!cityId) {
      toast.error("Selecione a cidade do imóvel.");
      return;
    }

    await addProperty(payload as any);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {!isAdmin && (
          <div className="mb-4 text-sm text-muted-foreground">
            Você não tem permissão para cadastrar imóveis.
          </div>
        )}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/properties")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Adicionar Imóvel
            </h2>
            <p className="text-muted-foreground mt-1">
              Preencha as informações do novo imóvel
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Imóvel</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Ex: Apartamento Moderno - Centro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="Ex: SLX001"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva as características, acabamentos, lazer, segurança..."
                    rows={5}
                    
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={type} onValueChange={setType} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartamento">Apartamento</SelectItem>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="terreno">Terreno</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="cobertura">Cobertura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Finalidade</Label>
                    <Select value={purpose} onValueChange={setPurpose} required>
                      <SelectTrigger id="purpose">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venda">Venda</SelectItem>
                        <SelectItem value="locacao">Locação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço</Label>
                    <Input
                      id="price"
                      name="price"
                      placeholder="Ex: 850000"
                      type="number"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citySelect">Cidade</Label>
                    <Select value={cityId} onValueChange={(v) => { setCityId(v); setNeighborhoodId(""); }}>
                      <SelectTrigger id="citySelect">
                        <SelectValue placeholder={loadingCities ? "Carregando..." : "Selecione a cidade"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} - {c.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!loadingCities && cities.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Nenhuma cidade cadastrada. Cadastre em "Cidades" no menu.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Estado (derivado)</Label>
                    <Input
                      value={(() => {
                        const c = cities.find((x) => x.id === cityId);
                        return c ? c.state : "";
                      })()}
                      readOnly
                      placeholder="Selecione a cidade"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Rua, número"
                      
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhoodSelect">Bairro</Label>
                    <Select
                      value={neighborhoodId}
                      onValueChange={setNeighborhoodId}
                      disabled={!cityId || loadingNeighborhoods}
                    >
                      <SelectTrigger id="neighborhoodSelect">
                        <SelectValue
                          placeholder={
                            !cityId
                              ? "Selecione primeiro a cidade"
                              : loadingNeighborhoods
                              ? "Carregando..."
                              : "Selecione o bairro (opcional)"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {neighborhoods.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!loadingNeighborhoods && cityId && neighborhoods.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Nenhum bairro cadastrado para esta cidade.
                      </p>
                    )}
                  </div>
                </div>
          
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Especificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Área Útil (m²)</Label>
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      placeholder="120"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Quartos</Label>
                    <Input id="bedrooms" name="bedrooms" type="number" placeholder="3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Banheiros</Label>
                    <Input id="bathrooms" name="bathrooms" type="number" placeholder="2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parking">Vagas</Label>
                    <Input id="parking" name="parking" type="number" placeholder="2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="furnished">Mobiliado</Label>
                    <Select value={furnished} onValueChange={setFurnished}>
                      <SelectTrigger id="furnished">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="financing">Aceita Financiamento</Label>
                    <Select value={financing} onValueChange={setFinancing}>
                      <SelectTrigger id="financing">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Andar</Label>
                    <Input id="floor" name="floor" placeholder="Ex: 5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Fotos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para fazer upload ou arraste as imagens
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 5 imagens, máximo de 20
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/properties")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || loadingCities || !isAdmin}>
                {isLoading ? "Salvando..." : "Salvar Imóvel"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddProperty;
