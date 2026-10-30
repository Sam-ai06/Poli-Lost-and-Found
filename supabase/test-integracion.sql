-- Se revierten todos los usuarios y registros de prueba.
begin;
do $$
declare
  autor uuid := gen_random_uuid();
  otro uuid := gen_random_uuid();
  id_objeto_prueba uuid;
  busqueda_id uuid;
  reclamo_id uuid;
  valor jsonb;
  bloqueado boolean;
begin
  insert into auth.users (id,raw_user_meta_data) values (autor,'{"nombre_completo":"Autor de prueba"}'),(otro,'{"nombre_completo":"Solicitante"}');
  if not exists (select 1 from public.perfiles where id=autor and nombre='Autor de prueba') then raise exception 'Perfil no creado'; end if;
  perform set_config('request.jwt.claim.sub',autor::text,true);
  perform set_config('role','authenticated',true);
  id_objeto_prueba := public.guardar_reporte('objeto','{"titulo":"Llaves azules","categoria":"llaves","descripcion":"Llaves encontradas","fecha_hallazgo":"2026-10-01","lugar_hallazgo":"Biblioteca","tipo_entrega":"coordinar_contacto","contacto":"autor@example.invalid","caracteristica_reservada":"Marca privada"}',null,'r-123-test');
  if public.guardar_reporte('objeto','{}',null,'r-123-test') <> id_objeto_prueba then raise exception 'Importación duplicada'; end if;
  if (select contacto from public.objetos_detalles_reservados where objeto_id=id_objeto_prueba limit 1) <> 'autor@example.invalid' then raise exception 'Faltan detalles'; end if;
  perform public.guardar_reporte('objeto','{"titulo":"Llaves actualizadas","categoria":"llaves","descripcion":"Llaves encontradas","fecha_hallazgo":"2026-10-01","lugar_hallazgo":"Biblioteca","tipo_entrega":"coordinar_contacto","contacto":"autor@example.invalid","caracteristica_reservada":"Marca privada"}',id_objeto_prueba,null);
  if (select titulo from public.objetos where id=id_objeto_prueba) <> 'Llaves actualizadas' then raise exception 'No se actualizó el objeto'; end if;
  perform set_config('request.jwt.claim.sub',otro::text,true);
  if exists (select 1 from public.objetos_detalles_reservados where objetos_detalles_reservados.objeto_id=id_objeto_prueba) then raise exception 'Detalle expuesto a otro usuario'; end if;
  bloqueado := false;
  begin perform public.guardar_reporte('objeto','{}',id_objeto_prueba,null);
  exception when sqlstate 'PT404' then bloqueado := true; end;
  if not bloqueado then raise exception 'Otro usuario puede editar'; end if;
  busqueda_id := public.guardar_reporte('busqueda','{"categoria":"llaves","descripcion":"Perdí las llaves","ubicacion_perdida":{"latitud":-2.1,"longitud":-79.9}}',null,null);
  perform public.guardar_reporte('busqueda','{"categoria":"llaves","descripcion":"Llaves perdidas","ubicacion_perdida":{"latitud":-2.1,"longitud":-79.9}}',busqueda_id,null);
  if (select descripcion from public.busquedas where id=busqueda_id) <> 'Llaves perdidas' then raise exception 'No se actualizó la búsqueda'; end if;
  valor := public.api_mutar('crear_reclamacion',jsonb_build_object('objeto_id',id_objeto_prueba,'busqueda_id',busqueda_id,'prueba_propiedad','Mis llaves azules'),null);
  reclamo_id := (valor->>'id')::uuid;
  bloqueado := false;
  begin perform public.instrucciones_entrega(reclamo_id); exception when sqlstate 'PT403' then bloqueado := true; end;
  if not bloqueado then raise exception 'Contacto expuesto antes de aprobar'; end if;
  perform set_config('request.jwt.claim.sub',autor::text,true);
  perform public.api_mutar('gestionar_reclamacion','{"estado":"aprobada"}',reclamo_id);
  perform set_config('request.jwt.claim.sub',otro::text,true);
  if (select estado from public.objetos where id=id_objeto_prueba) <> 'en_recuperacion' then raise exception 'Solicitante no ve objeto'; end if;
  if public.instrucciones_entrega(reclamo_id)->>'contacto' <> 'autor@example.invalid' then raise exception 'Contacto no disponible'; end if;
  if exists (select 1 from public.objetos_detalles_reservados where objetos_detalles_reservados.objeto_id=id_objeto_prueba) then raise exception 'Característica reservada expuesta'; end if;
  perform public.cerrar_busqueda(busqueda_id);
  if (select estado from public.busquedas where id=busqueda_id) <> 'cerrada' then raise exception 'Búsqueda no cerrada'; end if;
  perform set_config('role','none',true);
end $$;
rollback;
