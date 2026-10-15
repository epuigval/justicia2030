-- Atomically completes one individual participation.
-- PostgREST executes each RPC call in one transaction, so the deferred shape
-- constraints observe the nine inserted selections and completed parent row.

create function public.complete_individual_participation(
  p_participation_id uuid,
  p_write_token_hash text,
  p_card_ids text[],
  p_result_code text,
  p_final_payload_hash text
)
returns table (
  completion_outcome text,
  participation_status text,
  stored_result_code text,
  stored_completed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_participation public.participations%rowtype;
  unique_card_count bigint;
  active_card_count bigint;
  valid_phase_distribution boolean;
  personas_count bigint;
  procesos_count bigint;
  tecnologia_count bigint;
  gobernanza_count bigint;
  categories_at_least_three bigint;
  calculated_result_code text;
begin
  select p.*
  into current_participation
  from public.participations as p
  where p.id = p_participation_id
  for update;

  if not found then
    return query select 'not_found'::text, null::text, null::text, null::timestamptz;
    return;
  end if;

  if current_participation.write_token_hash is distinct from p_write_token_hash then
    return query select
      'token_mismatch'::text,
      current_participation.status,
      current_participation.result_code,
      current_participation.completed_at;
    return;
  end if;

  if current_participation.status = 'completed' then
    return query select
      case
        when current_participation.final_payload_hash = p_final_payload_hash then 'already_completed'::text
        else 'payload_conflict'::text
      end,
      current_participation.status,
      current_participation.result_code,
      current_participation.completed_at;
    return;
  end if;

  if current_participation.status <> 'started' then
    return query select
      'state_conflict'::text,
      current_participation.status,
      current_participation.result_code,
      current_participation.completed_at;
    return;
  end if;

  if p_write_token_hash !~ '^[0-9a-f]{64}$'
    or p_final_payload_hash !~ '^[0-9a-f]{64}$'
    or p_result_code is null
    or p_result_code not in (
      'vision-integral',
      'foco-personas',
      'foco-procesos',
      'foco-tecnologia',
      'foco-gobernanza',
      'foco-personas-procesos',
      'foco-personas-tecnologia',
      'foco-personas-gobernanza',
      'foco-procesos-tecnologia',
      'foco-procesos-gobernanza',
      'foco-tecnologia-gobernanza'
    )
  then
    return query select 'invalid_selection'::text, current_participation.status, null::text, null::timestamptz;
    return;
  end if;

  select count(distinct requested.card_id)
  into unique_card_count
  from unnest(p_card_ids) as requested(card_id);

  if coalesce(cardinality(p_card_ids), 0) <> 9 or unique_card_count <> 9 then
    return query select 'invalid_selection'::text, current_participation.status, null::text, null::timestamptz;
    return;
  end if;

  -- Keep catalog snapshots stable until transaction commits. SECURITY DEFINER
  -- supplies lock privileges without granting catalog UPDATE to service_role.
  perform c.id
  from public.cards as c
  join public.phases as p
    on p.id = c.phase_id
   and p.active
  join public.categories as category
    on category.id = c.category_id
   and category.active
  where c.id = any(p_card_ids)
    and c.active
    and c.category_id in ('personas', 'procesos', 'tecnologia', 'gobernanza')
  for share of c, p, category;

  select count(*)
  into active_card_count
  from public.cards as c
  join public.phases as p
    on p.id = c.phase_id
   and p.active
  join public.categories as category
    on category.id = c.category_id
   and category.active
  where c.id = any(p_card_ids)
    and c.active
    and c.category_id in ('personas', 'procesos', 'tecnologia', 'gobernanza');

  if active_card_count <> 9 then
    return query select 'catalog_not_found'::text, current_participation.status, null::text, null::timestamptz;
    return;
  end if;

  select
    count(*) filter (where c.phase_id = 'justicia-actual') = 3
    and count(*) filter (where c.phase_id = 'justicia-conectada') = 3
    and count(*) filter (where c.phase_id = 'justicia-inteligente') = 3
  into valid_phase_distribution
  from public.cards as c
  where c.id = any(p_card_ids);

  if not valid_phase_distribution then
    return query select 'invalid_selection'::text, current_participation.status, null::text, null::timestamptz;
    return;
  end if;

  select
    count(*) filter (where c.category_id = 'personas'),
    count(*) filter (where c.category_id = 'procesos'),
    count(*) filter (where c.category_id = 'tecnologia'),
    count(*) filter (where c.category_id = 'gobernanza')
  into personas_count, procesos_count, tecnologia_count, gobernanza_count
  from public.cards as c
  where c.id = any(p_card_ids);

  categories_at_least_three :=
    (case when personas_count >= 3 then 1 else 0 end)
    + (case when procesos_count >= 3 then 1 else 0 end)
    + (case when tecnologia_count >= 3 then 1 else 0 end)
    + (case when gobernanza_count >= 3 then 1 else 0 end);

  if (case when personas_count = 3 then 1 else 0 end)
      + (case when procesos_count = 3 then 1 else 0 end)
      + (case when tecnologia_count = 3 then 1 else 0 end)
      + (case when gobernanza_count = 3 then 1 else 0 end) = 3
    and (
      personas_count = 0
      or procesos_count = 0
      or tecnologia_count = 0
      or gobernanza_count = 0
    )
  then
    calculated_result_code := 'vision-integral';
  elsif categories_at_least_three = 2 then
    calculated_result_code := case
      when personas_count >= 3 and procesos_count >= 3 then 'foco-personas-procesos'
      when personas_count >= 3 and tecnologia_count >= 3 then 'foco-personas-tecnologia'
      when personas_count >= 3 and gobernanza_count >= 3 then 'foco-personas-gobernanza'
      when procesos_count >= 3 and tecnologia_count >= 3 then 'foco-procesos-tecnologia'
      when procesos_count >= 3 and gobernanza_count >= 3 then 'foco-procesos-gobernanza'
      when tecnologia_count >= 3 and gobernanza_count >= 3 then 'foco-tecnologia-gobernanza'
    end;
  elsif personas_count >= 4 then
    calculated_result_code := 'foco-personas';
  elsif procesos_count >= 4 then
    calculated_result_code := 'foco-procesos';
  elsif tecnologia_count >= 4 then
    calculated_result_code := 'foco-tecnologia';
  elsif gobernanza_count >= 4 then
    calculated_result_code := 'foco-gobernanza';
  else
    calculated_result_code := 'vision-integral';
  end if;

  -- Server computes interpretation before invoking RPC; verify it again while
  -- catalog rows are locked so result and persisted snapshots cannot diverge.
  if calculated_result_code is distinct from p_result_code then
    return query select 'invalid_selection'::text, current_participation.status, null::text, null::timestamptz;
    return;
  end if;

  insert into public.participation_selections (
    participation_id,
    card_id,
    phase_id,
    category_id_snapshot,
    card_title_snapshot
  )
  select
    p_participation_id,
    c.id,
    c.phase_id,
    c.category_id,
    c.title
  from public.cards as c
  where c.id = any(p_card_ids)
  order by c.sort_order;

  update public.participations as p
  set status = 'completed',
      completed_at = clock_timestamp(),
      result_code = p_result_code,
      final_payload_hash = p_final_payload_hash
  where p.id = p_participation_id
  returning p.* into current_participation;

  return query select
    'completed'::text,
    current_participation.status,
    current_participation.result_code,
    current_participation.completed_at;
end;
$$;

revoke all on function public.complete_individual_participation(uuid, text, text[], text, text)
  from public, anon, authenticated;

grant execute on function public.complete_individual_participation(uuid, text, text[], text, text)
  to service_role;

comment on function public.complete_individual_participation(uuid, text, text[], text, text) is
  'Server-only atomic and idempotent completion for one individual participation.';
