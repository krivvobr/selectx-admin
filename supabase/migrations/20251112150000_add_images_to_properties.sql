-- Alter properties table to add images and cover_image columns
alter table public.properties add column if not exists images jsonb;
alter table public.properties add column if not exists cover_image text;
