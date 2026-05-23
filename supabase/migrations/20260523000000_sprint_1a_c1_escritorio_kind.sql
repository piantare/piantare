-- ============================================================
-- Sprint 1A C1 — adicionar 'escritorio' ao organization_kind
--
-- ADR 0007 §2c+§2e: escritório entra como o terceiro ator comercial.
-- Aditivo apenas (não renomeia nada). Idempotente para tolerar
-- re-aplicação em ambientes de transição.
--
-- IMPORTANTE: este SQL acompanha o commit de código que entende o
-- novo valor (domínio + onboarding). Lição do incidente 2026-05-23:
-- shape do enum só muda junto com o código que usa o nome novo.
-- ============================================================

alter type public.organization_kind add value if not exists 'escritorio';
