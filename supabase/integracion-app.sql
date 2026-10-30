-- Integración de perfiles, reportes e imágenes con la app.
alter table public.busquedas add column if not exists ubicacion_perdida jsonb;
alter table public.busquedas add column if not exists origen_local text;
alter table public.objetos add column if not exists origen_local text;
alter table public.objetos_detalles_reservados alter column detalle drop not null;
alter table public.objetos_detalles_reservados add column if not exists contacto text;
create unique index if not exists objetos_origen_local_uidx on public.objetos (publicado_por, origen_local) where origen_local is not null;
create unique index if not exists busquedas_origen_local_uidx on public.busquedas (usuario_id, origen_local) where origen_local is not null;

-- Auth metadata is used only as display text, never as an authorization claim.
create or replace function private.crear_perfil_nuevo()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, left(coalesce(nullif(btrim(new.raw_user_meta_data->>'nombre_completo'), ''), 'Usuario'), 120))
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function private.crear_perfil_nuevo() from public, anon, authenticated;
drop trigger if exists crear_perfil_findyp on auth.users;
create trigger crear_perfil_findyp after insert on auth.users for each row execute function private.crear_perfil_nuevo();

grant select on public.perfiles, public.busquedas, public.busqueda_imagenes, public.objetos_detalles_reservados to authenticated;
create policy "perfiles visibles a usuarios" on public.perfiles for select to authenticated using (true);
create policy "usuario ve sus busquedas" on public.busquedas for select to authenticated using (usuario_id = (select auth.uid()));
create policy "usuario ve imagenes de sus busquedas" on public.busqueda_imagenes for select to authenticated
using (exists (select 1 from public.busquedas b where b.id = busqueda_id and b.usuario_id = (select auth.uid())));

create or replace function private.participa_en_objeto(objeto uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (select 1 from public.reclamaciones r where r.objeto_id = objeto and r.solicitante_id = auth.uid());
$$;
revoke all on function private.participa_en_objeto(uuid) from public, anon, authenticated;
grant execute on function private.participa_en_objeto(uuid) to authenticated;
create policy "solicitante ve objeto reclamado" on public.objetos for select to authenticated using ((select private.participa_en_objeto(id)));
create policy "autor ve detalles reservados" on public.objetos_detalles_reservados for select to authenticated
using (exists (select 1 from public.objetos o where o.id = objeto_id and o.publicado_por = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('objetos-imagenes', 'objetos-imagenes', true, 10485760, array['image/jpeg','image/png','image/webp','image/heic','image/heif']),
  ('busquedas-imagenes', 'busquedas-imagenes', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do nothing;
create policy "subir imagenes propias" on storage.objects for insert to authenticated
with check (bucket_id in ('objetos-imagenes','busquedas-imagenes') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "leer imagenes propias" on storage.objects for select to authenticated
using (bucket_id in ('objetos-imagenes','busquedas-imagenes') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "eliminar imagenes propias" on storage.objects for delete to authenticated
using (bucket_id in ('objetos-imagenes','busquedas-imagenes') and (storage.foldername(name))[1] = (select auth.uid())::text);

create or replace function private.guardar_reporte_impl(tipo text, datos jsonb, recurso_id uuid default null, origen text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  usuario uuid := auth.uid();
  id_resultado uuid;
  ruta text := datos->>'ruta_storage';
  existente uuid;
  bucket text;
begin
  if usuario is null then raise sqlstate 'PT401' using message = 'Debes iniciar sesión.'; end if;
  if tipo not in ('objeto','busqueda') or jsonb_typeof(datos) <> 'object' then
    raise sqlstate 'PT400' using message = 'Datos no válidos.';
  end if;
  if origen is not null and (length(origen) > 100 or origen !~ '^r-[a-zA-Z0-9-]+$' or recurso_id is not null) then
    raise sqlstate 'PT400' using message = 'Origen de importación inválido.';
  end if;
  if origen is not null then
    if tipo = 'objeto' then select id into existente from public.objetos where publicado_por = usuario and origen_local = origen;
    else select id into existente from public.busquedas where usuario_id = usuario and origen_local = origen; end if;
    if existente is not null then return existente; end if;
  end if;
  bucket := case when tipo = 'objeto' then 'objetos-imagenes' else 'busquedas-imagenes' end;
  if ruta is not null and (split_part(ruta,'/',1) <> usuario::text or not exists (
    select 1 from storage.objects s where s.bucket_id = bucket and s.name = ruta and s.owner_id = usuario::text
  )) then raise sqlstate 'PT400' using message = 'La imagen no existe o no te pertenece.'; end if;

  if tipo = 'objeto' then
    if recurso_id is null then
      insert into public.objetos (publicado_por,titulo,categoria,color,descripcion,fecha_hallazgo,lugar_hallazgo,tipo_entrega,punto_entrega,origen_local,estado)
      values (usuario,datos->>'titulo',datos->>'categoria',datos->>'color',datos->>'descripcion',(datos->>'fecha_hallazgo')::date,datos->>'lugar_hallazgo',datos->>'tipo_entrega',datos->>'punto_entrega',origen,case when origen is not null then coalesce(datos->>'estado','disponible') else 'disponible' end)
      returning id into id_resultado;
    else
      update public.objetos set titulo=datos->>'titulo',categoria=datos->>'categoria',color=datos->>'color',descripcion=datos->>'descripcion',
        fecha_hallazgo=(datos->>'fecha_hallazgo')::date,lugar_hallazgo=datos->>'lugar_hallazgo',tipo_entrega=datos->>'tipo_entrega',
        punto_entrega=datos->>'punto_entrega',actualizado_en=now()
      where id=recurso_id and publicado_por=usuario and estado='disponible' returning id into id_resultado;
      if id_resultado is null then raise sqlstate 'PT404' using message = 'Objeto no encontrado o no editable.'; end if;
    end if;
    if datos->>'contacto' is not null or datos->>'caracteristica_reservada' is not null then
      insert into public.objetos_detalles_reservados (objeto_id,detalle,contacto) values (id_resultado, datos->>'caracteristica_reservada',datos->>'contacto')
      on conflict (objeto_id) do update set detalle=excluded.detalle,contacto=excluded.contacto;
    else delete from public.objetos_detalles_reservados where objeto_id=id_resultado; end if;
    delete from public.objeto_imagenes where objeto_id=id_resultado;
    if ruta is not null then insert into public.objeto_imagenes (objeto_id,ruta_storage,tipo) values (id_resultado,ruta,coalesce(datos->>'tipo_imagen','fotografia')); end if;
  else
    if recurso_id is null then
      insert into public.busquedas (usuario_id,categoria,descripcion,color,fecha_perdida,lugar_aproximado,ubicacion_perdida,origen_local,estado)
      values (usuario,datos->>'categoria',datos->>'descripcion',datos->>'color',(datos->>'fecha_perdida')::date,datos->>'lugar_aproximado',nullif(datos->'ubicacion_perdida','null'::jsonb),origen,case when origen is not null then coalesce(datos->>'estado','activa') else 'activa' end)
      returning id into id_resultado;
    else
      update public.busquedas set categoria=datos->>'categoria',descripcion=datos->>'descripcion',color=datos->>'color',
        fecha_perdida=(datos->>'fecha_perdida')::date,lugar_aproximado=datos->>'lugar_aproximado',ubicacion_perdida=nullif(datos->'ubicacion_perdida','null'::jsonb)
      where id=recurso_id and usuario_id=usuario and estado='activa' returning id into id_resultado;
      if id_resultado is null then raise sqlstate 'PT404' using message = 'Búsqueda no encontrada o no editable.'; end if;
    end if;
    delete from public.busqueda_imagenes where busqueda_id=id_resultado;
    if ruta is not null then insert into public.busqueda_imagenes (busqueda_id,ruta_storage) values (id_resultado,ruta); end if;
  end if;
  return id_resultado;
end $$;
revoke all on function private.guardar_reporte_impl(text,jsonb,uuid,text) from public, anon, authenticated;
grant execute on function private.guardar_reporte_impl(text,jsonb,uuid,text) to authenticated;
create or replace function public.guardar_reporte(tipo text, datos jsonb, recurso_id uuid default null, origen text default null)
returns uuid language sql security invoker set search_path = '' as $$ select private.guardar_reporte_impl(tipo,datos,recurso_id,origen); $$;
revoke all on function public.guardar_reporte(text,jsonb,uuid,text) from public, anon, authenticated;
grant execute on function public.guardar_reporte(text,jsonb,uuid,text) to authenticated;

create or replace function private.cerrar_busqueda_impl(recurso_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise sqlstate 'PT401' using message = 'Debes iniciar sesión.'; end if;
  update public.busquedas set estado='cerrada' where id=recurso_id and usuario_id=auth.uid() and estado='activa';
  if not found then raise sqlstate 'PT404' using message = 'Búsqueda no encontrada o no editable.'; end if;
end $$;
revoke all on function private.cerrar_busqueda_impl(uuid) from public, anon, authenticated;
grant execute on function private.cerrar_busqueda_impl(uuid) to authenticated;
create or replace function public.cerrar_busqueda(recurso_id uuid) returns void language sql security invoker set search_path = '' as $$ select private.cerrar_busqueda_impl(recurso_id); $$;
revoke all on function public.cerrar_busqueda(uuid) from public, anon, authenticated;
grant execute on function public.cerrar_busqueda(uuid) to authenticated;

create or replace function private.instrucciones_entrega_impl(reclamo_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare resultado jsonb;
begin
  if auth.uid() is null then raise sqlstate 'PT401' using message = 'Debes iniciar sesión.'; end if;
  select jsonb_build_object('contacto', d.contacto, 'punto_entrega', o.punto_entrega) into resultado
  from public.reclamaciones r join public.objetos o on o.id=r.objeto_id
  left join public.objetos_detalles_reservados d on d.objeto_id=o.id
  where r.id=reclamo_id and (o.publicado_por=auth.uid() or (r.solicitante_id=auth.uid() and r.estado in ('aprobada','entregada')));
  if resultado is null then raise sqlstate 'PT403' using message = 'Las instrucciones no están disponibles.'; end if;
  return resultado;
end $$;
revoke all on function private.instrucciones_entrega_impl(uuid) from public, anon, authenticated;
grant execute on function private.instrucciones_entrega_impl(uuid) to authenticated;
create or replace function public.instrucciones_entrega(reclamo_id uuid) returns jsonb language sql security invoker set search_path = '' as $$ select private.instrucciones_entrega_impl(reclamo_id); $$;
revoke all on function public.instrucciones_entrega(uuid) from public, anon, authenticated;
grant execute on function public.instrucciones_entrega(uuid) to authenticated;
