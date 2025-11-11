# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c132c6cf-2522-46ea-9ccb-f47a81aeb941

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c132c6cf-2522-46ea-9ccb-f47a81aeb941) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c132c6cf-2522-46ea-9ccb-f47a81aeb941) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Integração com Supabase

Este dashboard usa dados mock. A seguir está o plano e os passos para integrar com o Supabase (Postgres + RLS):

- Crie um projeto no Supabase.
- Abra Project > SQL e execute o arquivo `supabase/schema.sql` deste repositório (tabelas, enums, índices, RLS e seeds).
- Crie o arquivo `.env.local` com as variáveis:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

- Instale o cliente:

```
yarn add @supabase/supabase-js
```

- O cliente está em `src/lib/supabaseClient.ts`. Serviços prontos:
  - `src/services/properties.ts`: `listProperties`, `getPropertyById`, `createProperty`, `updateProperty`, `deleteProperty`
  - `src/services/leads.ts`: `listLeads`, `createLead`, `updateLeadStatus`

### Como usar nos componentes

Você pode integrar com React Query já presente no projeto:

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProperties, createProperty } from "@/services/properties";

const { data, isLoading, error } = useQuery({
  queryKey: ["properties"],
  queryFn: async () => (await listProperties()).data,
});

const qc = useQueryClient();
const mutation = useMutation({
  mutationFn: createProperty,
  onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
});
```

### Autenticação e perfis

- O Supabase Auth cria usuários em `auth.users`. Um trigger popula `public.profiles` com `role` padrão `viewer`.
- Políticas RLS definidas:
  - `properties`: leitura para autenticados; escrita só para `admin`.
  - `leads`: leitura para autenticados; inserção pública (site).
  - `profiles`: usuário lê o próprio perfil; `admin` lê/atualiza todos.

### Imagens

Imagens serão configuradas depois. Recomenda-se criar um bucket de Storage `properties` e gravar o caminho do arquivo na tabela (ou usar uma tabela `property_images`).

### Observações

- Seeds do `schema.sql` adicionam alguns exemplos de imóveis e leads, compatíveis com o mock atual.
- Ajuste os componentes para substituir o mock pelos serviços Supabase conforme necessário.
