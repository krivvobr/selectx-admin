# ImageKit Auth – Supabase Edge Function

Função que gera `token`, `expire` e `signature` para autenticação do ImageKit.

## Secrets necessários

Configure as chaves no projeto Supabase:

```
supabase secrets set IMAGEKIT_PUBLIC_KEY=public_...
supabase secrets set IMAGEKIT_PRIVATE_KEY=private_...
```

## Rodar localmente

Se usar Supabase CLI:

```
supabase start
supabase functions serve imagekit-auth
```

Endpoint local:

```
http://localhost:54321/functions/v1/imagekit-auth
```

## Produção

Após `supabase functions deploy imagekit-auth`, o endpoint será:

```
https://<PROJECT_REF>.functions.supabase.co/imagekit-auth
```

Atualize `VITE_IMAGEKIT_AUTH_ENDPOINT` no `.env.local` para o endpoint de produção.