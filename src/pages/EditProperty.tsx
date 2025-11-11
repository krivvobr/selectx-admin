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
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPropertyById, updateProperty, type Property } from "@/services/properties";

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [type, setType] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [furnished, setFurnished] = useState<string>("nao");
  const [financing, setFinancing] = useState<string>("sim");

  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await getPropertyById(id!);
      if (error) throw error;
      return data as Property;
    },
  });

  useEffect(() => {
    if (data) {
      setType(data.type);
      setPurpose(data.purpose);
      setFurnished(data.furnished ? "sim" : "nao");
      setFinancing(data.financing ? "sim" : "nao");
    }
  }, [data]);

  const { mutateAsync: saveProperty, isLoading: saving } = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await updateProperty(id!, payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Imóvel atualizado com sucesso!");
      navigate("/properties");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao atualizar imóvel.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data) return;

    const fd = new FormData(e.currentTarget);
    const getNum = (key: string) => {
      const val = String(fd.get(key) ?? "").trim();
      return val ? Number(val) : null;
    };

    const payload = {
      code: String(fd.get("code") ?? data.code).trim(),
      title: String(fd.get("title") ?? data.title).trim(),
      description: String(fd.get("description") ?? data.description ?? "").trim(),
      type: type as any,
      purpose: purpose as any,
      price: Number(String(fd.get("price") ?? String(data.price))),
      address: String(fd.get("address") ?? data.address ?? "").trim(),
      neighborhood: String(fd.get("neighborhood") ?? data.neighborhood ?? "").trim(),
      city: String(fd.get("city") ?? data.city ?? "").trim(),
      state: String(fd.get("state") ?? data.state ?? "").trim(),
      area: getNum("area"),
      bedrooms: getNum("bedrooms"),
      bathrooms: getNum("bathrooms"),
      parking: getNum("parking"),
      furnished: furnished === "sim",
      financing: financing === "sim",
      floor: getNum("floor"),
    };

    if (!payload.type || !payload.purpose) {
      toast.error("Selecione o tipo e a finalidade do imóvel.");
      return;
    }

    await saveProperty(payload);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
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
              Editar Imóvel
            </h2>
            <p className="text-muted-foreground mt-1">
              Atualize as informações do imóvel
            </p>
          </div>
        </div>

        {isLoading || !data ? (
          <div className="p-8">Carregando dados do imóvel...</div>
        ) : (
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
                      placeholder="Ex: Apartamento Moderno - Centro"
                      defaultValue={data.title}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      placeholder="Ex: SLX001"
                      defaultValue={data.code}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva as características, acabamentos, lazer, segurança..."
                    rows={5}
                    defaultValue={data.description ?? ""}
                    required
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
                      placeholder="Ex: 850000"
                      type="number"
                      defaultValue={String(data.price)}
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
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      placeholder="Rua, número"
                      defaultValue={data.address ?? ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      placeholder="Nome do bairro"
                      defaultValue={data.neighborhood ?? ""}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      placeholder="Cidade" 
                      defaultValue={data.city ?? ""}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input 
                      id="state" 
                      placeholder="UF" 
                      defaultValue={data.state ?? ""}
                      required 
                    />
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
                      type="number"
                      placeholder="120"
                      defaultValue={data.area ?? undefined}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Quartos</Label>
                    <Input 
                      id="bedrooms" 
                      type="number" 
                      placeholder="3"
                      defaultValue={data.bedrooms ?? undefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Banheiros</Label>
                    <Input 
                      id="bathrooms" 
                      type="number" 
                      placeholder="2"
                      defaultValue={data.bathrooms ?? undefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parking">Vagas</Label>
                    <Input 
                      id="parking" 
                      type="number" 
                      placeholder="2"
                      defaultValue={data.parking ?? undefined}
                    />
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
                    <Input 
                      id="floor" 
                      placeholder="Ex: 5"
                      defaultValue={data.floor ?? undefined}
                    />
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
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Atualizar Imóvel"}
              </Button>
            </div>
          </div>
        </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditProperty;
