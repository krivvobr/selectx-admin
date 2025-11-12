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
import { ArrowLeft, Upload, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createProperty } from "@/services/properties";
import { listCities, listNeighborhoodsByCity } from "@/services/locations";
import ImageKitUpload from "@/components/ImageKitUpload";
import { useAuth } from "@/hooks/use-auth";

const formatCurrency = (value: string) => {
  if (!value) return "";
  let onlyNumbers = value.replace(/\D/g, "");
  if (onlyNumbers === "") return "";

  let intValue = parseInt(onlyNumbers, 10);
  if (isNaN(intValue)) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(intValue / 100);
};

const formatNumber = (value: string) => {
  if (!value) return "";
  let onlyNumbers = value.replace(/\D/g, "");
  if (onlyNumbers === "") return "";

  let floatValue = parseFloat(onlyNumbers) / 100;
  if (isNaN(floatValue)) return "";

  return floatValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const AddProperty = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [type, setType] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [furnished, setFurnished] = useState<string>("nao");
  const [financing, setFinancing] = useState<string>("sim");
  const [cityId, setCityId] = useState<string>("");
  const [neighborhoodId, setNeighborhoodId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [code, setCode] = useState(generateRandomCode());
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");

  useEffect(() => {
    setCode(generateRandomCode());
  }, []);

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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setPrice(formatted);
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setArea(formatted);
  };

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
      return val ? Number(val.replace(",", ".")) : null;
    };

    const unmaskedPrice = price.replace(/\D/g, "");
    const city = cities.find((c) => c.id === cityId);

    const payload = {
      code: code,
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      type: type as any,
      purpose: purpose as any,
      price: Number(unmaskedPrice) / 100,
      address: String(fd.get("address") ?? "").trim(),
      city_id: cityId,
      neighborhood_id: neighborhoodId,
      state: city ? city.state : "",
      area: getNum("area"),
      bedrooms: getNum("bedrooms"),
      bathrooms: getNum("bathrooms"),
      suites: getNum("suites"),
      parking: getNum("parking"),
      furnished: furnished === "sim",
      financing: financing === "sim",
      floor: getNum("floor"),
      status: "disponivel" as const,
      images: images,
      cover_image: coverImage,
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
                    <div className="flex items-center gap-2">
                      <Input
                        id="code"
                        name="code"
                        value={code}
                        readOnly
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCode(generateRandomCode())}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
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
                      placeholder="R$ 0,00"
                      value={price}
                      onChange={handlePriceChange}
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Área Útil (m²)</Label>
                    <Input
                      id="area"
                      name="area"
                      placeholder="0,00"
                      value={area}
                      onChange={handleAreaChange}
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
                    <Label htmlFor="suites">Suítes</Label>
                    <Input id="suites" name="suites" type="number" placeholder="1" />
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
                <ImageKitUpload
                  onSuccess={(url) => {
                    if (images.length === 0) {
                      setCoverImage(url);
                    }
                    setImages((prev) => [...prev, url]);
                  }}
                  onError={(error) => {
                    console.error(error);
                    toast.error("Erro ao fazer upload da imagem.");
                  }}
                />
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`property image ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {coverImage === url && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Capa
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          if (coverImage === url) {
                            setCoverImage(images.find((i) => i !== url) ?? "");
                          }
                          setImages((prev) => prev.filter((i) => i !== url));
                        }}
                      >
                        X
                      </Button>
                      {coverImage !== url && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-2 left-2"
                          onClick={() => setCoverImage(url)}
                        >
                          Definir como capa
                        </Button>
                      )}
                    </div>
                  ))}
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
