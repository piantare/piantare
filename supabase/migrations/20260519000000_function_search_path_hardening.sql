-- Step 9 hardening: pin search_path on functions flagged by Supabase advisor.
--
-- Why: `function_search_path_mutable` warnings can let a malicious schema in
-- the search_path shadow public objects. Pinning search_path = public, pg_temp
-- makes the resolution deterministic. No behavior change for these functions.
--
-- Scope: 4 functions surfaced by the security advisor. Other deferred findings
-- (admin_profiles_view, perfis_* policy gaps) are intentional baseline state
-- per Step 9 exclusion list.

alter function public.handle_updated_at() set search_path = public, pg_temp;
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.memberships_sync_org_kind() set search_path = public, pg_temp;
alter function public.touch_updated_at() set search_path = public, pg_temp;
