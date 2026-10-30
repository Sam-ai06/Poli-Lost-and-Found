-- Apply to the existing Poli Lost and Found schema. Mutations run in one transaction.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.api_mutar_impl(operacion text, datos jsonb, recurso_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  usuario uuid := auth.uid();
  objeto public.objetos%rowtype;
  reclamo public.reclamaciones%rowtype;
  resultado jsonb;
  campos text[];
  estado_nuevo text;
begin
  if usuario is null then
    raise sqlstate 'PT401' using message = 'Debes iniciar sesión.';
  end if;
  if datos is null or pg_catalog.jsonb_typeof(datos) <> 'object' then
    raise sqlstate 'PT400' using message = 'El cuerpo debe ser un objeto JSON.';
  end if;

  campos := case operacion
    when 'crear_objeto' then array['titulo','categoria','color','descripcion','fecha_hallazgo','lugar_hallazgo','tipo_entrega','punto_entrega']
    when 'crear_busqueda' then array['categoria','descripcion','color','fecha_perdida','lugar_aproximado']
    when 'crear_reclamacion' then array['objeto_id','busqueda_id','prueba_propiedad']
    when 'gestionar_reclamacion' then array['estado']
    when 'eliminar_objeto' then array[]::text[]
    else null
  end;
  if campos is null or (datos - campos) <> '{}'::jsonb then
    raise sqlstate 'PT400' using message = 'Operación o campos no permitidos.';
  end if;
  if exists (select 1 from pg_catalog.jsonb_each(datos) as campo where pg_catalog.jsonb_typeof(campo.value) not in ('string', 'null')) then
    raise sqlstate 'PT400' using message = 'Los campos deben ser texto o null.';
  end if;

  if operacion = 'crear_objeto' then
    insert into public.objetos (publicado_por, titulo, categoria, color, descripcion, fecha_hallazgo, lugar_hallazgo, tipo_entrega, punto_entrega)
    values (usuario, datos->>'titulo', datos->>'categoria', datos->>'color', datos->>'descripcion', (datos->>'fecha_hallazgo')::date, datos->>'lugar_hallazgo', datos->>'tipo_entrega', datos->>'punto_entrega')
    returning to_jsonb(objetos) into resultado;
    return resultado;
  elsif operacion = 'crear_busqueda' then
    insert into public.busquedas (usuario_id, categoria, descripcion, color, fecha_perdida, lugar_aproximado)
    values (usuario, datos->>'categoria', datos->>'descripcion', datos->>'color', (datos->>'fecha_perdida')::date, datos->>'lugar_aproximado')
    returning to_jsonb(busquedas) into resultado;
    return resultado;
  elsif operacion = 'crear_reclamacion' then
    select * into objeto from public.objetos where id = (datos->>'objeto_id')::uuid for update;
    if not found or objeto.estado <> 'disponible' then
      raise sqlstate 'PT404' using message = 'Objeto disponible no encontrado.';
    end if;
    if objeto.publicado_por = usuario then
      raise sqlstate 'PT403' using message = 'No puedes reclamar tu propio objeto.';
    end if;
    if datos->>'busqueda_id' is not null and not exists (
      select 1 from public.busquedas where id = (datos->>'busqueda_id')::uuid and usuario_id = usuario
    ) then
      raise sqlstate 'PT400' using message = 'La búsqueda no existe o no te pertenece.';
    end if;
    if exists (select 1 from public.reclamaciones where objeto_id = objeto.id and solicitante_id = usuario and estado in ('pendiente','aprobada')) then
      raise sqlstate 'PT409' using message = 'Ya tienes una reclamación activa para este objeto.';
    end if;
    insert into public.reclamaciones (objeto_id, solicitante_id, busqueda_id, prueba_propiedad)
    values (objeto.id, usuario, (datos->>'busqueda_id')::uuid, datos->>'prueba_propiedad')
    returning to_jsonb(reclamaciones) into resultado;
    return resultado;
  elsif operacion = 'gestionar_reclamacion' then
    select * into reclamo from public.reclamaciones where id = recurso_id;
    if not found then raise sqlstate 'PT404' using message = 'Reclamación no encontrada.'; end if;
    select * into objeto from public.objetos where id = reclamo.objeto_id for update;
    if not found or objeto.publicado_por <> usuario then
      raise sqlstate 'PT403' using message = 'Solo el autor puede gestionar esta reclamación.';
    end if;
    select * into reclamo from public.reclamaciones where id = recurso_id for update;
    if not found then raise sqlstate 'PT404' using message = 'Reclamación no encontrada.'; end if;
    estado_nuevo := datos->>'estado';
    if estado_nuevo is null or estado_nuevo not in ('aprobada', 'rechazada', 'entregada') then
      raise sqlstate 'PT400' using message = 'Estado permitido: aprobada, rechazada o entregada.';
    end if;
    if estado_nuevo = 'aprobada' and reclamo.estado = 'pendiente' and objeto.estado = 'disponible' then
      update public.objetos set estado = 'en_recuperacion', actualizado_en = now() where id = objeto.id;
    elsif estado_nuevo = 'rechazada' and reclamo.estado = 'pendiente' then
      null;
    elsif estado_nuevo = 'entregada' and reclamo.estado = 'aprobada' and objeto.estado = 'en_recuperacion' then
      update public.objetos set estado = 'entregado', actualizado_en = now() where id = objeto.id;
    else
      raise sqlstate 'PT409' using message = 'La transición de estado no está permitida.';
    end if;
    update public.reclamaciones
      set estado = estado_nuevo,
          resuelto_en = case when estado_nuevo in ('aprobada','rechazada') then now() else resuelto_en end,
          entregado_en = case when estado_nuevo = 'entregada' then now() else entregado_en end
      where id = recurso_id returning to_jsonb(reclamaciones) into resultado;
    return resultado;
  elsif operacion = 'eliminar_objeto' then
    select * into objeto from public.objetos where id = recurso_id for update;
    if not found then raise sqlstate 'PT404' using message = 'Objeto no encontrado.'; end if;
    if objeto.publicado_por <> usuario then raise sqlstate 'PT403' using message = 'Solo el autor puede eliminar este objeto.'; end if;
    if exists (select 1 from public.reclamaciones where objeto_id = objeto.id) then
      raise sqlstate 'PT409' using message = 'No se puede eliminar un objeto con reclamaciones.';
    end if;
    delete from public.objetos where id = objeto.id;
    return pg_catalog.jsonb_build_object('id', objeto.id, 'eliminado', true);
  end if;
  raise sqlstate 'PT400' using message = 'Operación no permitida.';
end;
$$;

revoke all on function private.api_mutar_impl(text, jsonb, uuid) from public, anon, authenticated;
grant execute on function private.api_mutar_impl(text, jsonb, uuid) to authenticated;

create or replace function public.api_mutar(operacion text, datos jsonb, recurso_id uuid default null)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.api_mutar_impl(operacion, datos, recurso_id); $$;
revoke all on function public.api_mutar(text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.api_mutar(text, jsonb, uuid) to authenticated;

-- Only the claimant and the object's author can read a claim and its evidence.
grant select on public.reclamaciones to authenticated;
create policy "participantes ven reclamaciones" on public.reclamaciones
  for select to authenticated
  using (
    solicitante_id = (select auth.uid())
    or exists (select 1 from public.objetos o where o.id = objeto_id and o.publicado_por = (select auth.uid()))
  );
