\set ON_ERROR_STOP on

do $$
begin
  if has_function_privilege(
    'anon',
    'public.complete_individual_participation(uuid,text,text[],text,text)',
    'EXECUTE'
  ) then
    raise exception 'anon must not execute completion RPC';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.complete_individual_participation(uuid,text,text[],text,text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated must not execute completion RPC';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.complete_individual_participation(uuid,text,text[],text,text)',
    'EXECUTE'
  ) then
    raise exception 'service_role must execute completion RPC';
  end if;

  if has_table_privilege('anon', 'public.participations', 'SELECT')
    or has_table_privilege('authenticated', 'public.participations', 'SELECT')
  then
    raise exception 'browser roles must not read participations';
  end if;
end;
$$;

set role service_role;

insert into public.participations (
  id,
  collective_id,
  collective_name_snapshot,
  write_token_hash
)
values (
  '11111111-1111-4111-8111-111111111111',
  'universidad-talento-joven',
  'Universidad y talento joven',
  repeat('a', 64)
);

do $$
declare
  result record;
begin
  select *
  into result
  from public.complete_individual_participation(
    '11111111-1111-4111-8111-111111111111',
    repeat('a', 64),
    array[
      'justicia-actual-tarjeta-1',
      'justicia-actual-tarjeta-3',
      'justicia-actual-tarjeta-5',
      'justicia-conectada-tarjeta-1',
      'justicia-conectada-tarjeta-3',
      'justicia-conectada-tarjeta-5',
      'justicia-inteligente-tarjeta-1',
      'justicia-inteligente-tarjeta-3',
      'justicia-inteligente-tarjeta-5'
    ],
    'vision-integral',
    repeat('b', 64)
  );

  if result.completion_outcome <> 'completed'
    or result.participation_status <> 'completed'
    or result.stored_result_code <> 'vision-integral'
    or result.stored_completed_at is null
  then
    raise exception 'valid completion failed: %', row_to_json(result);
  end if;
end;
$$;

do $$
declare
  result record;
  selection_count bigint;
begin
  select *
  into result
  from public.complete_individual_participation(
    '11111111-1111-4111-8111-111111111111',
    repeat('a', 64),
    array[
      'justicia-inteligente-tarjeta-5',
      'justicia-conectada-tarjeta-5',
      'justicia-actual-tarjeta-5',
      'justicia-inteligente-tarjeta-3',
      'justicia-conectada-tarjeta-3',
      'justicia-actual-tarjeta-3',
      'justicia-inteligente-tarjeta-1',
      'justicia-conectada-tarjeta-1',
      'justicia-actual-tarjeta-1'
    ],
    'vision-integral',
    repeat('b', 64)
  );

  select count(*)
  into selection_count
  from public.participation_selections
  where participation_id = '11111111-1111-4111-8111-111111111111';

  if result.completion_outcome <> 'already_completed' or selection_count <> 9 then
    raise exception 'idempotent retry failed';
  end if;
end;
$$;

do $$
declare
  result record;
begin
  select *
  into result
  from public.complete_individual_participation(
    '11111111-1111-4111-8111-111111111111',
    repeat('a', 64),
    array[
      'justicia-actual-tarjeta-1',
      'justicia-actual-tarjeta-3',
      'justicia-actual-tarjeta-5',
      'justicia-conectada-tarjeta-1',
      'justicia-conectada-tarjeta-3',
      'justicia-conectada-tarjeta-5',
      'justicia-inteligente-tarjeta-1',
      'justicia-inteligente-tarjeta-3',
      'justicia-inteligente-tarjeta-7'
    ],
    'foco-personas-procesos',
    repeat('c', 64)
  );

  if result.completion_outcome <> 'payload_conflict' then
    raise exception 'different retry must conflict';
  end if;
end;
$$;

insert into public.participations (
  id,
  collective_id,
  collective_name_snapshot,
  write_token_hash
)
values (
  '22222222-2222-4222-8222-222222222222',
  'universidad-talento-joven',
  'Universidad y talento joven',
  repeat('d', 64)
);

do $$
declare
  result record;
begin
  select *
  into result
  from public.complete_individual_participation(
    '22222222-2222-4222-8222-222222222222',
    repeat('e', 64),
    array[
      'justicia-actual-tarjeta-1',
      'justicia-actual-tarjeta-3',
      'justicia-actual-tarjeta-5',
      'justicia-conectada-tarjeta-1',
      'justicia-conectada-tarjeta-3',
      'justicia-conectada-tarjeta-5',
      'justicia-inteligente-tarjeta-1',
      'justicia-inteligente-tarjeta-3',
      'justicia-inteligente-tarjeta-5'
    ],
    'vision-integral',
    repeat('f', 64)
  );

  if result.completion_outcome <> 'token_mismatch' then
    raise exception 'wrong token must fail';
  end if;
end;
$$;

do $$
declare
  result record;
  selection_count bigint;
begin
  select *
  into result
  from public.complete_individual_participation(
    '22222222-2222-4222-8222-222222222222',
    repeat('d', 64),
    array[
      'justicia-actual-tarjeta-1',
      'justicia-actual-tarjeta-3',
      'justicia-actual-tarjeta-5',
      'justicia-conectada-tarjeta-1',
      'justicia-conectada-tarjeta-3',
      'justicia-conectada-tarjeta-5',
      'justicia-inteligente-tarjeta-1',
      'justicia-inteligente-tarjeta-3'
    ],
    'vision-integral',
    repeat('f', 64)
  );

  select count(*)
  into selection_count
  from public.participation_selections
  where participation_id = '22222222-2222-4222-8222-222222222222';

  if result.completion_outcome <> 'invalid_selection' or selection_count <> 0 then
    raise exception 'invalid completion must leave no selections';
  end if;
end;
$$;

do $$
declare
  result record;
begin
  select *
  into result
  from public.complete_individual_participation(
    '22222222-2222-4222-8222-222222222222',
    repeat('d', 64),
    array[
      'justicia-actual-tarjeta-1',
      'justicia-actual-tarjeta-3',
      'justicia-actual-tarjeta-5',
      'justicia-conectada-tarjeta-1',
      'justicia-conectada-tarjeta-3',
      'justicia-conectada-tarjeta-5',
      'justicia-inteligente-tarjeta-1',
      'justicia-inteligente-tarjeta-3',
      'justicia-inteligente-tarjeta-5'
    ],
    'foco-personas-procesos',
    repeat('f', 64)
  );

  if result.completion_outcome <> 'invalid_selection' then
    raise exception 'RPC must reject a result code inconsistent with locked catalog';
  end if;
end;
$$;

reset role;
