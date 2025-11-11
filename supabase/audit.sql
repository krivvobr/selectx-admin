-- Auditoria do schema Select-X para Supabase
-- Execute este script no SQL Editor do seu projeto Supabase (MCP: sepabase_selectx)

-- 1) Enums esperados
select 'property_type' as enum_name, array_agg(enumlabel order by enumlabel) as labels
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public' and t.typname = 'property_type'
union all
select 'property_purpose', array_agg(enumlabel order by enumlabel)
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public' and t.typname = 'property_purpose'
union all
select 'property_status', array_agg(enumlabel order by enumlabel)
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public' and t.typname = 'property_status'
union all
select 'lead_status', array_agg(enumlabel order by enumlabel)
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public' and t.typname = 'lead_status'
union all
select 'user_role', array_agg(enumlabel order by enumlabel)
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public' and t.typname = 'user_role';

-- 2) Tabelas existentes
select table_schema, table_name
from information_schema.tables
where table_schema in ('public','auth')
and table_name in ('properties','leads','profiles','users')
order by table_schema, table_name;

-- 3) Colunas esperadas por tabela (mostra colunas ausentes)
with expected as (
  select 'properties'::text as table_name, unnest(array[
    'id','code','title','description','type','purpose','price','address','neighborhood','city','state','area','bedrooms','bathrooms','parking','furnished','financing','floor','status','created_at','updated_at'
  ]) as column_name
  union all
  select 'leads', unnest(array[
    'id','name','phone','email','property_id','status','created_at','notes'
  ])
  union all
  select 'profiles', unnest(array[
    'id','full_name','phone','role','created_at'
  ])
)
select e.table_name, e.column_name as missing_column
from expected e
left join information_schema.columns c
  on c.table_schema='public' and c.table_name=e.table_name and c.column_name=e.column_name
where c.column_name is null
order by e.table_name, e.column_name;

-- 4) Índices
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname='public' and tablename in ('properties','leads','profiles')
order by tablename, indexname;

-- 5) RLS habilitado
select n.nspname as schema, c.relname as table, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname='public' and c.relname in ('properties','leads','profiles');

-- 6) Políticas definidas
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname='public' and tablename in ('properties','leads','profiles')
order by tablename, policyname;

-- 7) Triggers relevantes
-- updated_at em properties
select n.nspname as schema, c.relname as table, t.tgname as trigger
from pg_trigger t
join pg_class c on c.oid=t.tgrelid
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname='properties';

-- criação automática de profiles ao inserir em auth.users
select n.nspname as schema, c.relname as table, t.tgname as trigger
from pg_trigger t
join pg_class c on c.oid=t.tgrelid
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='auth' and c.relname='users';

-- 8) Seeds básicos
select 'properties_count' as metric, count(*)::int as value from public.properties
union all
select 'leads_count', count(*)::int from public.leads;

-- 9) Perfil admin presente
select id, role from public.profiles where role='admin';

-- 10) Recomendações (verificação manual):
-- - Storage: verificar se há bucket 'properties' para imagens (não coberto por SQL)
-- - Realtime: se necessário, habilite para tabelas (Database > Replication) 
-- - Constraints: 'code' único em properties (checado na definição), verificar NOT NULL conforme seu uso