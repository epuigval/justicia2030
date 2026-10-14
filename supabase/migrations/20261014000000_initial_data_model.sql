-- Justicia 2030: initial structural catalog and individual participation model.
-- Interpretation rules and result copy intentionally remain versioned in code.

create table public.phases (
  id text primary key,
  name text not null,
  sort_order smallint not null,
  active boolean not null default true,

  constraint phases_id_not_blank check (btrim(id) <> ''),
  constraint phases_name_not_blank check (btrim(name) <> ''),
  constraint phases_sort_order_positive check (sort_order > 0),
  constraint phases_sort_order_unique unique (sort_order)
);

create table public.categories (
  id text primary key,
  name text not null,
  sort_order smallint not null,
  active boolean not null default true,

  constraint categories_id_not_blank check (btrim(id) <> ''),
  constraint categories_name_not_blank check (btrim(name) <> ''),
  constraint categories_sort_order_positive check (sort_order > 0),
  constraint categories_sort_order_unique unique (sort_order)
);

create table public.cards (
  id text primary key,
  phase_id text not null,
  category_id text not null,
  title text not null,
  sort_order smallint not null,
  active boolean not null default true,

  constraint cards_id_not_blank check (btrim(id) <> ''),
  constraint cards_title_not_blank check (btrim(title) <> ''),
  constraint cards_sort_order_positive check (sort_order > 0),
  constraint cards_sort_order_unique unique (sort_order),
  constraint cards_phase_fk
    foreign key (phase_id)
    references public.phases (id)
    on update restrict
    on delete restrict,
  constraint cards_category_fk
    foreign key (category_id)
    references public.categories (id)
    on update restrict
    on delete restrict
);

create table public.collectives (
  id text primary key,
  name text not null,
  sort_order smallint not null,
  active boolean not null default true,

  constraint collectives_id_not_blank check (btrim(id) <> ''),
  constraint collectives_name_not_blank check (btrim(name) <> ''),
  constraint collectives_sort_order_positive check (sort_order > 0),
  constraint collectives_sort_order_unique unique (sort_order)
);

create table public.subprofiles (
  id text primary key,
  collective_id text not null,
  name text not null,
  sort_order smallint not null,
  active boolean not null default true,

  constraint subprofiles_id_not_blank check (btrim(id) <> ''),
  constraint subprofiles_name_not_blank check (btrim(name) <> ''),
  constraint subprofiles_sort_order_positive check (sort_order > 0),
  constraint subprofiles_collective_fk
    foreign key (collective_id)
    references public.collectives (id)
    on update restrict
    on delete restrict,
  constraint subprofiles_collective_id_unique unique (collective_id, id),
  constraint subprofiles_collective_sort_order_unique unique (collective_id, sort_order)
);

create table public.participations (
  id uuid primary key,
  mode text not null default 'individual',
  status text not null default 'started',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  collective_id text not null,
  subprofile_id text,
  collective_name_snapshot text not null,
  subprofile_name_snapshot text,
  catalog_version text not null default 'catalog-v1',
  interpretation_version text not null default 'interpretation-v1',
  result_code text,
  write_token_hash text not null,
  final_payload_hash text,

  constraint participations_mode_check check (mode = 'individual'),
  constraint participations_status_check check (status in ('started', 'completed')),
  constraint participations_collective_snapshot_not_blank
    check (btrim(collective_name_snapshot) <> ''),
  constraint participations_subprofile_snapshot_check check (
    (subprofile_id is null and subprofile_name_snapshot is null)
    or
    (
      subprofile_id is not null
      and subprofile_name_snapshot is not null
      and btrim(subprofile_name_snapshot) <> ''
    )
  ),
  constraint participations_catalog_version_check
    check (catalog_version = 'catalog-v1'),
  constraint participations_interpretation_version_check
    check (interpretation_version = 'interpretation-v1'),
  constraint participations_result_code_not_blank
    check (result_code is null or btrim(result_code) <> ''),
  constraint participations_write_token_hash_format
    check (write_token_hash ~ '^[0-9a-f]{64}$'),
  constraint participations_final_payload_hash_format
    check (final_payload_hash is null or final_payload_hash ~ '^[0-9a-f]{64}$'),
  constraint participations_completion_time_order check (
    completed_at is null or completed_at >= started_at
  ),
  constraint participations_lifecycle_check check (
    (
      status = 'started'
      and completed_at is null
      and result_code is null
      and final_payload_hash is null
    )
    or
    (
      status = 'completed'
      and completed_at is not null
      and result_code is not null
      and final_payload_hash is not null
    )
  ),
  constraint participations_collective_fk
    foreign key (collective_id)
    references public.collectives (id)
    on update restrict
    on delete restrict,
  constraint participations_subprofile_collective_fk
    foreign key (collective_id, subprofile_id)
    references public.subprofiles (collective_id, id)
    on update restrict
    on delete restrict
);

create table public.participation_selections (
  participation_id uuid not null,
  card_id text not null,
  phase_id text not null,
  category_id_snapshot text not null,
  card_title_snapshot text not null,

  constraint participation_selections_pk primary key (participation_id, card_id),
  constraint participation_selections_title_not_blank
    check (btrim(card_title_snapshot) <> ''),
  constraint participation_selections_participation_fk
    foreign key (participation_id)
    references public.participations (id)
    on update restrict
    on delete restrict,
  constraint participation_selections_card_fk
    foreign key (card_id)
    references public.cards (id)
    on update restrict
    on delete restrict,
  constraint participation_selections_phase_fk
    foreign key (phase_id)
    references public.phases (id)
    on update restrict
    on delete restrict,
  constraint participation_selections_category_snapshot_fk
    foreign key (category_id_snapshot)
    references public.categories (id)
    on update restrict
    on delete restrict
);

-- Catalog v1 -----------------------------------------------------------------

insert into public.phases (id, name, sort_order, active)
values
  ('justicia-actual', 'Justicia Actual', 1, true),
  ('justicia-conectada', 'Justicia Conectada', 2, true),
  ('justicia-inteligente', 'Justicia Inteligente', 3, true);

insert into public.categories (id, name, sort_order, active)
values
  ('personas', 'Personas', 1, true),
  ('procesos', 'Procesos', 2, true),
  ('tecnologia', 'Tecnología', 3, true),
  ('gobernanza', 'Gobernanza', 4, true);

insert into public.cards (id, phase_id, category_id, title, sort_order, active)
values
  ('justicia-actual-tarjeta-1', 'justicia-actual', 'personas', 'Mejora de la atención a la ciudadanía', 1, true),
  ('justicia-actual-tarjeta-2', 'justicia-actual', 'personas', 'Capacitación y adaptación de los profesionales', 2, true),
  ('justicia-actual-tarjeta-3', 'justicia-actual', 'procesos', 'Simplificación procesal y operativa', 3, true),
  ('justicia-actual-tarjeta-4', 'justicia-actual', 'procesos', 'Gestión eficiente de cargas y recursos', 4, true),
  ('justicia-actual-tarjeta-5', 'justicia-actual', 'tecnologia', 'Puesto de trabajo digital integrado', 5, true),
  ('justicia-actual-tarjeta-6', 'justicia-actual', 'tecnologia', 'Calidad y disponibilidad del dato', 6, true),
  ('justicia-actual-tarjeta-7', 'justicia-actual', 'gobernanza', 'Coordinación entre actores de Justicia', 7, true),
  ('justicia-actual-tarjeta-8', 'justicia-actual', 'gobernanza', 'Modelo común de seguimiento y mejora', 8, true),
  ('justicia-conectada-tarjeta-1', 'justicia-conectada', 'personas', 'Experiencia unificada para profesionales', 9, true),
  ('justicia-conectada-tarjeta-2', 'justicia-conectada', 'personas', 'Colaboración digital entre colectivos', 10, true),
  ('justicia-conectada-tarjeta-3', 'justicia-conectada', 'procesos', 'Interoperabilidad de extremo a extremo', 11, true),
  ('justicia-conectada-tarjeta-4', 'justicia-conectada', 'procesos', 'Expediente judicial verdaderamente interoperable', 12, true),
  ('justicia-conectada-tarjeta-5', 'justicia-conectada', 'tecnologia', 'Intercambio de datos con otras Administraciones', 13, true),
  ('justicia-conectada-tarjeta-6', 'justicia-conectada', 'tecnologia', 'Identidad y acceso digital común', 14, true),
  ('justicia-conectada-tarjeta-7', 'justicia-conectada', 'gobernanza', 'Gobierno compartido del dato judicial', 15, true),
  ('justicia-conectada-tarjeta-8', 'justicia-conectada', 'gobernanza', 'Estándares comunes e interoperabilidad por diseño', 16, true),
  ('justicia-inteligente-tarjeta-1', 'justicia-inteligente', 'personas', 'Asistente inteligente para profesionales', 17, true),
  ('justicia-inteligente-tarjeta-2', 'justicia-inteligente', 'personas', 'Capacidades digitales e IA responsable', 18, true),
  ('justicia-inteligente-tarjeta-3', 'justicia-inteligente', 'procesos', 'Automatización de tareas repetitivas', 19, true),
  ('justicia-inteligente-tarjeta-4', 'justicia-inteligente', 'procesos', 'Servicios proactivos y tramitación inteligente', 20, true),
  ('justicia-inteligente-tarjeta-5', 'justicia-inteligente', 'tecnologia', 'Analítica avanzada para la gestión judicial', 21, true),
  ('justicia-inteligente-tarjeta-6', 'justicia-inteligente', 'tecnologia', 'IA para el tratamiento documental', 22, true),
  ('justicia-inteligente-tarjeta-7', 'justicia-inteligente', 'gobernanza', 'Gobernanza y control de la IA', 23, true),
  ('justicia-inteligente-tarjeta-8', 'justicia-inteligente', 'gobernanza', 'Cartera común de casos de uso y medición de valor', 24, true);

insert into public.collectives (id, name, sort_order, active)
values
  ('universidad-talento-joven', 'Universidad y talento joven', 1, true),
  ('profesionales-juridicos', 'Profesionales jurídicos — Abogados y Procuradores', 2, true),
  ('profesionales-administracion-justicia', 'Profesionales de la Administración de Justicia', 3, true),
  (
    'otros-operadores-justicia',
    'Otros operadores jurídicos y profesionales vinculados a la Justicia (mediadores, peritos, graduados sociales, profesionales forenses, psicólogos, trabajadores sociales, SSJJ…)',
    4,
    true
  ),
  ('tecnologia-transformacion-digital', 'Tecnología y Transformación Digital de la Justicia', 5, true);

insert into public.subprofiles (id, collective_id, name, sort_order, active)
values
  ('universidad-talento-joven--estudiante', 'universidad-talento-joven', 'Estudiante', 1, true),
  ('universidad-talento-joven--docente', 'universidad-talento-joven', 'Docente', 2, true),
  ('universidad-talento-joven--investigacion', 'universidad-talento-joven', 'Investigación', 3, true),
  ('universidad-talento-joven--otros-perfiles-academicos', 'universidad-talento-joven', 'Otros perfiles académicos', 4, true),
  ('profesionales-juridicos--abogacia', 'profesionales-juridicos', 'Abogacía', 1, true),
  ('profesionales-juridicos--procura', 'profesionales-juridicos', 'Procura', 2, true),
  ('profesionales-juridicos--asesoria-servicios-juridicos', 'profesionales-juridicos', 'Asesoría / Servicios jurídicos', 3, true),
  ('profesionales-juridicos--otros-profesionales-juridicos', 'profesionales-juridicos', 'Otros profesionales jurídicos', 4, true),
  ('profesionales-administracion-justicia--judicatura', 'profesionales-administracion-justicia', 'Judicatura', 1, true),
  ('profesionales-administracion-justicia--fiscalia', 'profesionales-administracion-justicia', 'Fiscalía', 2, true),
  ('profesionales-administracion-justicia--laj', 'profesionales-administracion-justicia', 'LAJ', 3, true),
  ('profesionales-administracion-justicia--gestion-tramitacion-auxilio', 'profesionales-administracion-justicia', 'Gestión / Tramitación / Auxilio', 4, true),
  ('profesionales-administracion-justicia--otros-profesionales-justicia', 'profesionales-administracion-justicia', 'Otros profesionales de Justicia', 5, true),
  ('otros-operadores-justicia--mediacion-masc', 'otros-operadores-justicia', 'Mediación / MASC', 1, true),
  ('otros-operadores-justicia--peritaje-forense', 'otros-operadores-justicia', 'Peritaje y ámbito forense', 2, true),
  ('otros-operadores-justicia--graduados-sociales', 'otros-operadores-justicia', 'Graduados Sociales', 3, true),
  ('otros-operadores-justicia--servicios-sociales-atencion-victimas', 'otros-operadores-justicia', 'Servicios sociales / Atención a víctimas', 4, true),
  ('otros-operadores-justicia--servicios-juridicos-aapp', 'otros-operadores-justicia', 'Servicios jurídicos de AAPP', 5, true),
  ('otros-operadores-justicia--otros-profesionales-vinculados', 'otros-operadores-justicia', 'Otros profesionales vinculados a Justicia', 6, true),
  ('tecnologia-transformacion-digital--direccion-gestion-tic', 'tecnologia-transformacion-digital', 'Dirección / Gestión TIC', 1, true),
  ('tecnologia-transformacion-digital--transformacion-digital-innovacion', 'tecnologia-transformacion-digital', 'Transformación digital e innovación', 2, true),
  ('tecnologia-transformacion-digital--datos-inteligencia-artificial', 'tecnologia-transformacion-digital', 'Datos e Inteligencia Artificial', 3, true),
  ('tecnologia-transformacion-digital--sistemas-arquitectura-interoperabilidad', 'tecnologia-transformacion-digital', 'Sistemas, arquitectura e interoperabilidad', 4, true),
  ('tecnologia-transformacion-digital--ciberseguridad', 'tecnologia-transformacion-digital', 'Ciberseguridad', 5, true),
  ('tecnologia-transformacion-digital--otros-perfiles-tecnologicos', 'tecnologia-transformacion-digital', 'Otros perfiles tecnológicos', 6, true);

-- Snapshot validation and historical immutability ----------------------------

create function public.validate_participation_catalog_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_collective_name text;
  current_subprofile_name text;
begin
  select c.name
  into current_collective_name
  from public.collectives as c
  where c.id = new.collective_id
    and c.active
  for share;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'collective must exist and be active';
  end if;

  if new.collective_name_snapshot is distinct from current_collective_name then
    raise exception using
      errcode = '23514',
      message = 'collective_name_snapshot must match the active catalog';
  end if;

  if new.subprofile_id is null then
    if new.subprofile_name_snapshot is not null then
      raise exception using
        errcode = '23514',
        message = 'subprofile_name_snapshot must be null without subprofile_id';
    end if;
  else
    select s.name
    into current_subprofile_name
    from public.subprofiles as s
    where s.id = new.subprofile_id
      and s.collective_id = new.collective_id
      and s.active
    for share;

    if not found then
      raise exception using
        errcode = '23514',
        message = 'subprofile must exist, be active, and belong to the collective';
    end if;

    if new.subprofile_name_snapshot is distinct from current_subprofile_name then
      raise exception using
        errcode = '23514',
        message = 'subprofile_name_snapshot must match the active catalog';
    end if;
  end if;

  return new;
end;
$$;

create trigger participations_validate_catalog_snapshot
before insert on public.participations
for each row
execute function public.validate_participation_catalog_snapshot();

create function public.protect_participation_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.mode is distinct from old.mode
    or new.started_at is distinct from old.started_at
    or new.collective_id is distinct from old.collective_id
    or new.subprofile_id is distinct from old.subprofile_id
    or new.collective_name_snapshot is distinct from old.collective_name_snapshot
    or new.subprofile_name_snapshot is distinct from old.subprofile_name_snapshot
    or new.catalog_version is distinct from old.catalog_version
    or new.interpretation_version is distinct from old.interpretation_version
    or new.write_token_hash is distinct from old.write_token_hash
  then
    raise exception using
      errcode = '55000',
      message = 'participation identity and catalog snapshot are immutable';
  end if;

  if old.status = 'completed' and new is distinct from old then
    raise exception using
      errcode = '55000',
      message = 'completed participation is immutable';
  end if;

  return new;
end;
$$;

create trigger participations_protect_history
before update on public.participations
for each row
execute function public.protect_participation_history();

create function public.validate_selection_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  locked_participation_id uuid;
  current_phase_id text;
  current_category_id text;
  current_card_title text;
begin
  -- Serialize every selection write through its parent. This closes races
  -- between concurrent finalization attempts and status changes.
  select p.id
  into locked_participation_id
  from public.participations as p
  where p.id = new.participation_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'participation must exist before inserting selections';
  end if;

  select c.phase_id, c.category_id, c.title
  into current_phase_id, current_category_id, current_card_title
  from public.cards as c
  join public.phases as p
    on p.id = c.phase_id
   and p.active
  join public.categories as category
    on category.id = c.category_id
   and category.active
  where c.id = new.card_id
    and c.active
  for share of c, p, category;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'card must exist and be active';
  end if;

  if new.phase_id is distinct from current_phase_id then
    raise exception using
      errcode = '23514',
      message = 'phase_id must match the active card catalog';
  end if;

  if new.category_id_snapshot is distinct from current_category_id then
    raise exception using
      errcode = '23514',
      message = 'category_id_snapshot must match the active card catalog';
  end if;

  if new.card_title_snapshot is distinct from current_card_title then
    raise exception using
      errcode = '23514',
      message = 'card_title_snapshot must match the active card catalog';
  end if;

  return new;
end;
$$;

create trigger participation_selections_validate_snapshot
before insert on public.participation_selections
for each row
execute function public.validate_selection_snapshot();

create function public.protect_selection_history()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  participation_status text;
begin
  if tg_op = 'UPDATE' then
    raise exception using
      errcode = '55000',
      message = 'participation selections are immutable; replace the transaction before completion';
  end if;

  select p.status
  into participation_status
  from public.participations as p
  where p.id = old.participation_id
  for update;

  if participation_status = 'completed' then
    raise exception using
      errcode = '55000',
      message = 'completed participation selections are immutable';
  end if;

  return old;
end;
$$;

create trigger participation_selections_protect_history
before update or delete on public.participation_selections
for each row
execute function public.protect_selection_history();

-- Deferred shape checks let server code insert the nine rows and complete the
-- participation in either order inside one transaction. Only final state is
-- accepted: started has no persisted selections; completed has 9, split 3x3.
create function public.assert_participation_selection_shape()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_participation_id uuid;
  participation_status text;
  selection_count bigint;
  phase_count bigint;
  has_invalid_phase_count boolean;
  has_unexpected_phase boolean;
begin
  if tg_table_name = 'participations' then
    target_participation_id := new.id;
  elsif tg_op = 'DELETE' then
    target_participation_id := old.participation_id;
  else
    target_participation_id := new.participation_id;
  end if;

  select p.status
  into participation_status
  from public.participations as p
  where p.id = target_participation_id;

  if not found then
    return null;
  end if;

  select
    count(*),
    count(distinct s.phase_id),
    coalesce(
      bool_or(
        s.phase_id not in (
          'justicia-actual',
          'justicia-conectada',
          'justicia-inteligente'
        )
      ),
      false
    )
  into selection_count, phase_count, has_unexpected_phase
  from public.participation_selections as s
  where s.participation_id = target_participation_id;

  if participation_status = 'started' then
    if selection_count <> 0 then
      raise exception using
        errcode = '23514',
        message = 'started participation cannot persist selections';
    end if;

    return null;
  end if;

  select exists (
    select 1
    from public.participation_selections as s
    where s.participation_id = target_participation_id
    group by s.phase_id
    having count(*) <> 3
  )
  into has_invalid_phase_count;

  if selection_count <> 9
    or phase_count <> 3
    or has_invalid_phase_count
    or has_unexpected_phase
  then
    raise exception using
      errcode = '23514',
      message = 'completed participation must contain exactly 9 selections, 3 per phase';
  end if;

  return null;
end;
$$;

create constraint trigger participations_selection_shape_check
after insert or update on public.participations
deferrable initially deferred
for each row
execute function public.assert_participation_selection_shape();

create constraint trigger participation_selections_shape_check
after insert or delete on public.participation_selections
deferrable initially deferred
for each row
execute function public.assert_participation_selection_shape();

-- Query-path indexes ---------------------------------------------------------

create index participations_started_at_idx
  on public.participations (started_at);

create index participations_status_started_at_idx
  on public.participations (status, started_at);

create index participations_collective_status_started_at_idx
  on public.participations (collective_id, status, started_at);

-- The primary key already covers participation -> selections lookups.
create index participation_selections_phase_card_idx
  on public.participation_selections (phase_id, card_id, participation_id);

create index participation_selections_category_idx
  on public.participation_selections (category_id_snapshot, participation_id);

-- Access control -------------------------------------------------------------

alter table public.phases enable row level security;
alter table public.categories enable row level security;
alter table public.cards enable row level security;
alter table public.collectives enable row level security;
alter table public.subprofiles enable row level security;
alter table public.participations enable row level security;
alter table public.participation_selections enable row level security;

-- No browser-facing policies are created. Publishable-key roles receive no
-- table privileges, so Postgres rejects access before evaluating RLS.
revoke all on table public.phases from public, anon, authenticated, service_role;
revoke all on table public.categories from public, anon, authenticated, service_role;
revoke all on table public.cards from public, anon, authenticated, service_role;
revoke all on table public.collectives from public, anon, authenticated, service_role;
revoke all on table public.subprofiles from public, anon, authenticated, service_role;
revoke all on table public.participations from public, anon, authenticated, service_role;
revoke all on table public.participation_selections from public, anon, authenticated, service_role;

grant select on table
  public.phases,
  public.categories,
  public.cards,
  public.collectives,
  public.subprofiles
to service_role;

grant select, insert, update on table public.participations to service_role;
grant select, insert on table public.participation_selections to service_role;

revoke execute on function public.validate_participation_catalog_snapshot()
  from public, anon, authenticated;
revoke execute on function public.protect_participation_history()
  from public, anon, authenticated;
revoke execute on function public.validate_selection_snapshot()
  from public, anon, authenticated;
revoke execute on function public.protect_selection_history()
  from public, anon, authenticated;
revoke execute on function public.assert_participation_selection_shape()
  from public, anon, authenticated;

grant execute on function public.validate_participation_catalog_snapshot()
  to service_role;
grant execute on function public.protect_participation_history()
  to service_role;
grant execute on function public.validate_selection_snapshot()
  to service_role;
grant execute on function public.protect_selection_history()
  to service_role;
grant execute on function public.assert_participation_selection_shape()
  to service_role;

comment on table public.participations is
  'Anonymous individual workshop starts and completions. Access is server-only.';

comment on column public.participations.final_payload_hash is
  'SHA-256 hex digest used by the future server completion transaction for idempotency.';

comment on table public.participation_selections is
  'Completion-time card snapshots. Rows are immutable after completion.';

comment on column public.participation_selections.category_id_snapshot is
  'Category at completion time; later card recategorization does not rewrite history.';
