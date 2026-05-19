-- ============================================================
-- 20260518120000_rls_baseline
-- Phase 2 Step 5 — Auth + RLS baseline.
--
-- Context: schema v1.3 (migration 0001_baseline) already has RLS enabled on
-- all 28 public tables and ships 18 policies. This migration is additive
-- and non-destructive:
--   - ADDs FORCE ROW LEVEL SECURITY on all 28 tables (close owner bypass)
--   - ADDs three helper functions for use by future policies
--   - Does NOT modify or remove any existing policy
--   - Does NOT add admin policies — admin paths use service-role
--     (services/supabase/admin.ts) per ADR 0003 Q3=(b)
--   - Does NOT add policies to the 14 unpoliced tables — each will get a
--     policy in the migration that activates its feature, per ADR 0003 Q2=(a)
--
-- See: docs/adrs/0003-auth-and-rls-baseline.md
-- ============================================================

-- ============================================================
-- 1. FORCE row level security on all public tables
--    Default RLS exempts the table owner. FORCE removes that exemption.
--    Defense-in-depth: even a connection logged in as `postgres` is gated.
--    Service-role still bypasses RLS via the JWT `service_role` claim.
-- ============================================================

alter table public.anamneses_respostas    force row level security;
alter table public.anamneses_templates    force row level security;
alter table public.base_cientifica        force row level security;
alter table public.biomarcadores          force row level security;
alter table public.comunidade_likes       force row level security;
alter table public.comunidade_posts       force row level security;
alter table public.comunidade_reportes    force row level security;
alter table public.consentimentos         force row level security;
alter table public.creator_publicacoes    force row level security;
alter table public.exames                 force row level security;
alter table public.familia_membros        force row level security;
alter table public.familias               force row level security;
alter table public.notificacoes           force row level security;
alter table public.perfis_agencia         force row level security;
alter table public.perfis_agente          force row level security;
alter table public.perfis_cliente         force row level security;
alter table public.perfis_clinica         force row level security;
alter table public.perfis_distribuidora   force row level security;
alter table public.perfis_escritorio      force row level security;
alter table public.perfis_hub             force row level security;
alter table public.perfis_industria       force row level security;
alter table public.perfis_labdiag         force row level security;
alter table public.perfis_magistral       force row level security;
alter table public.perfis_marca           force row level security;
alter table public.perfis_pesquisador     force row level security;
alter table public.perfis_profissional    force row level security;
alter table public.profiles               force row level security;
alter table public.vinculos               force row level security;

-- ============================================================
-- 2. Helper functions
--    All are SECURITY DEFINER so they can read profiles regardless of the
--    caller's RLS posture. Marked STABLE for plan caching within a query.
--    search_path is locked to `public` to prevent search_path attacks.
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select tipo = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.auth_user_role()
returns ator_tipo
language sql
stable
security definer
set search_path = public
as $$
  select tipo from public.profiles where id = auth.uid();
$$;

create or replace function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select status = 'aprovado'::aprovacao_status from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- 3. Grants on the helper functions
--    Available to anon and authenticated; harmless to expose since they
--    only ever return data about auth.uid() (the caller's own session).
-- ============================================================

revoke all on function public.is_admin()         from public;
revoke all on function public.auth_user_role()   from public;
revoke all on function public.is_approved()      from public;

grant execute on function public.is_admin()         to anon, authenticated;
grant execute on function public.auth_user_role()   to anon, authenticated;
grant execute on function public.is_approved()      to anon, authenticated;
