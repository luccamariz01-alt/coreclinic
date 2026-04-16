-- Execute no Supabase SQL Editor para garantir upload de imagens de procedimentos.
-- Bucket publico para permitir exibir imagem no frontend sem assinatura.

insert into storage.buckets (id, name, public)
values ('procedimentos-imagens', 'procedimentos-imagens', true)
on conflict (id) do nothing;

-- Leitura publica das imagens.
drop policy if exists "public read procedimentos imagens" on storage.objects;
create policy "public read procedimentos imagens"
on storage.objects for select
to public
using (bucket_id = 'procedimentos-imagens');

-- Upload/update/delete apenas para usuarios autenticados.
drop policy if exists "auth upload procedimentos imagens" on storage.objects;
create policy "auth upload procedimentos imagens"
on storage.objects for insert
to authenticated
with check (bucket_id = 'procedimentos-imagens');

drop policy if exists "auth update procedimentos imagens" on storage.objects;
create policy "auth update procedimentos imagens"
on storage.objects for update
to authenticated
using (bucket_id = 'procedimentos-imagens')
with check (bucket_id = 'procedimentos-imagens');

drop policy if exists "auth delete procedimentos imagens" on storage.objects;
create policy "auth delete procedimentos imagens"
on storage.objects for delete
to authenticated
using (bucket_id = 'procedimentos-imagens');
