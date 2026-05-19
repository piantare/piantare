-- ============================================================
-- PIANTARE · SCHEMA SUPABASE
-- Rodar no SQL Editor do Supabase (supabase.com → SQL Editor)
-- ============================================================

-- EXTENSÕES
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM: tipos de ator
-- ============================================================
create type ator_tipo as enum (
  'industria',
  'marca',
  'escritorio',
  'agente',
  'clinica',
  'profissional',
  'magistral',
  'distribuidora',
  'labdiag',
  'hub',
  'agencia',
  'pesquisador',
  'cliente',
  'admin'
);

-- ============================================================
-- ENUM: status de aprovação
-- ============================================================
create type aprovacao_status as enum (
  'pendente',
  'aprovado',
  'recusado',
  'em_analise'
);

-- ============================================================
-- TABELA: profiles
-- Extensão da tabela auth.users do Supabase
-- ============================================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  tipo ator_tipo not null,
  status aprovacao_status not null default 'pendente',

  -- Dados pessoais / empresariais
  nome_completo text,
  nome_fantasia text,
  cpf text,
  cnpj text,
  email text,
  telefone text,
  whatsapp text,
  cidade text,
  estado text,
  pais text default 'Brasil',

  -- Onboarding
  como_conheceu text,
  motivacao text, -- "por que quer fazer parte"
  termos_aceitos boolean default false,
  termos_aceitos_em timestamptz,
  onboarding_completo boolean default false,
  onboarding_completo_em timestamptz,

  -- Admin
  aprovado_por uuid references profiles(id),
  aprovado_em timestamptz,
  recusado_motivo text,
  notas_admin text,

  -- Stark Bank
  starkbank_account_id text,
  starkbank_pix_key text,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_escritorio
-- ============================================================
create table perfis_escritorio (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  responsavel_cpf text,
  nome_escritorio text,
  bio_publica text,
  site text,
  cidade text,
  estado text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_agente
-- ============================================================
create table perfis_agente (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cpf text,
  bio_publica text,
  especialidades text[], -- array de especialidades
  valor_mensal numeric(10,2),
  anos_experiencia integer,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_profissional
-- ============================================================
create table perfis_profissional (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cpf text,
  tipo_registro text, -- CRM, CRN, CRP, CRF, etc
  numero_registro text,
  uf_registro text,
  especialidade text,
  outras_especialidades text[],
  modalidades text[], -- presencial, telemedicina_video, telemedicina_chat
  autonomo boolean default false,
  bio_publica text,
  valor_consulta numeric(10,2),
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_clinica
-- ============================================================
create table perfis_clinica (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  responsavel_cpf text,
  nome_clinica text,
  bio_publica text,
  endereco text,
  cidade text,
  estado text,
  modalidades text[],
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_industria
-- ============================================================
create table perfis_industria (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  nome_industria text,
  certificacoes_anvisa text[],
  produtos_principais text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_marca
-- ============================================================
create table perfis_marca (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  nome_marca text,
  produtos_principais text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_magistral
-- ============================================================
create table perfis_magistral (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  responsavel_tecnico text,
  crf text,
  uf_crf text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_distribuidora
-- ============================================================
create table perfis_distribuidora (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  regioes_cobertura text[],
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_labdiag
-- ============================================================
create table perfis_labdiag (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  exames_oferecidos text[],
  coleta_domiciliar boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_hub
-- ============================================================
create table perfis_hub (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  tipo_operacao text[], -- importacao, dispensacao, suplementos, todos
  regioes_cobertura text[],
  tem_api boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_agencia
-- ============================================================
create table perfis_agencia (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cnpj text,
  responsavel_nome text,
  nome_agencia text,
  modelo_cobranca text, -- CPL, CPA, mix
  canais_atuacao text[],
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_pesquisador
-- ============================================================
create table perfis_pesquisador (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cpf text,
  cnpj text, -- opcional (PJ)
  instituicao text,
  area_pesquisa text,
  lattes_url text,
  titulacao text, -- graduado, mestre, doutor, pos-doutor
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis_cliente
-- ============================================================
create table perfis_cliente (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  cpf text,
  data_nascimento date,
  sexo text,
  score_longevidade integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: vinculos
-- Qualquer ator pode solicitar vínculo com qualquer outro
-- ============================================================
create table vinculos (
  id uuid primary key default uuid_generate_v4(),
  solicitante_id uuid references profiles(id) on delete cascade not null,
  destinatario_id uuid references profiles(id) on delete cascade not null,
  tipo text, -- fornecedor, parceria, logistica, clinica, pesquisa, encaminhamento
  mensagem text,
  status text default 'pendente', -- pendente, aceito, recusado
  created_at timestamptz default now(),
  respondido_em timestamptz,
  unique(solicitante_id, destinatario_id)
);

-- ============================================================
-- TABELA: familias
-- ============================================================
create table familias (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  admin_id uuid references profiles(id) not null,
  created_at timestamptz default now()
);

create table familia_membros (
  id uuid primary key default uuid_generate_v4(),
  familia_id uuid references familias(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  parentesco text,
  eh_menor boolean default false,
  responsavel_id uuid references profiles(id), -- obrigatório se menor
  documento_tutela_url text,
  consentimento_dado boolean default false,
  consentimento_em timestamptz,
  created_at timestamptz default now(),
  unique(familia_id, profile_id)
);

-- ============================================================
-- TABELA: consentimentos
-- Cliente autoriza acesso de profissional/agente aos seus dados
-- ============================================================
create table consentimentos (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid references profiles(id) on delete cascade not null,
  autorizado_id uuid references profiles(id) on delete cascade not null,
  dados_autorizados text[], -- biomarcadores, anamneses, prescricoes, prontuario
  ativo boolean default true,
  criado_em timestamptz default now(),
  revogado_em timestamptz,
  unique(cliente_id, autorizado_id)
);

-- ============================================================
-- TABELA: biomarcadores
-- ============================================================
create table biomarcadores (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid references profiles(id) on delete cascade not null,
  nome text not null,
  valor numeric,
  unidade text,
  referencia_min numeric,
  referencia_max numeric,
  status text, -- ok, warn, alert
  fonte text, -- exame_upload, integracao_lab, manual
  editado_manualmente boolean default false,
  data_coleta date,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: exames
-- ============================================================
create table exames (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid references profiles(id) on delete cascade not null,
  tipo text,
  laboratorio text,
  data_coleta date,
  arquivo_url text,
  processado boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: anamneses (templates)
-- ============================================================
create table anamneses_templates (
  id uuid primary key default uuid_generate_v4(),
  criado_por uuid references profiles(id) not null,
  titulo text not null,
  descricao text,
  perguntas jsonb not null default '[]',
  obrigatoria boolean default false,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: anamneses (respostas)
-- ============================================================
create table anamneses_respostas (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references anamneses_templates(id),
  cliente_id uuid references profiles(id) on delete cascade not null,
  respostas jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: comunidade (posts)
-- ============================================================
create table comunidade_posts (
  id uuid primary key default uuid_generate_v4(),
  autor_id uuid references profiles(id) on delete cascade not null,
  canal text not null, -- geral, vendas, protocolo_clinico, marcas_produtos, celebracoes, anvisa
  conteudo text not null,
  likes integer default 0,
  reportes integer default 0,
  removido boolean default false,
  removido_motivo text,
  created_at timestamptz default now()
);

create table comunidade_likes (
  post_id uuid references comunidade_posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (post_id, profile_id)
);

create table comunidade_reportes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references comunidade_posts(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete cascade not null,
  motivo text not null,
  created_at timestamptz default now(),
  unique(post_id, reporter_id)
);

-- ============================================================
-- TABELA: creator (publicações)
-- ============================================================
create table creator_publicacoes (
  id uuid primary key default uuid_generate_v4(),
  autor_id uuid references profiles(id) on delete cascade not null,
  tipo text not null, -- artigo, case_clinico, protocolo, video, curso, pesquisa, laudo
  titulo text not null,
  pilar text,
  conteudo text,
  modelo_acesso text default 'gratuito', -- gratuito, pago_avulso, assinantes
  valor numeric(10,2),
  visualizacoes integer default 0,
  reportes integer default 0,
  removido boolean default false,
  publicado boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: base científica
-- ============================================================
create table base_cientifica (
  id uuid primary key default uuid_generate_v4(),
  submetido_por uuid references profiles(id) not null,
  titulo text not null,
  pilar text not null,
  fonte text,
  ano integer,
  resumo text,
  url text,
  arquivo_url text,
  tags text[],
  status text default 'em_revisao', -- em_revisao, publicado, recusado
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: notificações
-- ============================================================
create table notificacoes (
  id uuid primary key default uuid_generate_v4(),
  destinatario_id uuid references profiles(id) on delete cascade not null,
  tipo text not null,
  titulo text not null,
  mensagem text,
  lida boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ============================================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- ============================================================
-- FUNÇÃO: criar profile automaticamente ao criar usuário
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, tipo, email, status)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'tipo')::ator_tipo, 'cliente'),
    new.email,
    case
      when coalesce((new.raw_user_meta_data->>'tipo')::ator_tipo, 'cliente') = 'cliente' then 'aprovado'::aprovacao_status
      else 'pendente'::aprovacao_status
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table vinculos enable row level security;
alter table consentimentos enable row level security;
alter table biomarcadores enable row level security;
alter table exames enable row level security;
alter table anamneses_respostas enable row level security;
alter table comunidade_posts enable row level security;
alter table comunidade_likes enable row level security;
alter table comunidade_reportes enable row level security;
alter table creator_publicacoes enable row level security;
alter table base_cientifica enable row level security;
alter table notificacoes enable row level security;
alter table familias enable row level security;
alter table familia_membros enable row level security;

-- Profiles: cada um vê o próprio
create policy "profiles_self" on profiles
  for all using (auth.uid() = id);

-- Profiles: qualquer autenticado pode ver perfis aprovados (para vínculos, busca)
create policy "profiles_public_approved" on profiles
  for select using (status = 'aprovado');

-- Vinculos: ver os próprios
create policy "vinculos_self" on vinculos
  for all using (auth.uid() = solicitante_id or auth.uid() = destinatario_id);

-- Consentimentos: cliente controla os próprios
create policy "consentimentos_cliente" on consentimentos
  for all using (auth.uid() = cliente_id);

-- Consentimentos: autorizado pode ver onde foi autorizado
create policy "consentimentos_autorizado" on consentimentos
  for select using (auth.uid() = autorizado_id and ativo = true);

-- Biomarcadores: cliente vê os próprios
create policy "biomarcadores_cliente" on biomarcadores
  for all using (auth.uid() = cliente_id);

-- Exames: cliente vê os próprios
create policy "exames_cliente" on exames
  for all using (auth.uid() = cliente_id);

-- Anamneses respostas: cliente vê as próprias
create policy "anamneses_cliente" on anamneses_respostas
  for all using (auth.uid() = cliente_id);

-- Comunidade: todos autenticados veem posts não removidos
create policy "comunidade_read" on comunidade_posts
  for select using (removido = false and auth.uid() is not null);

create policy "comunidade_write" on comunidade_posts
  for insert with check (auth.uid() = autor_id);

create policy "comunidade_own" on comunidade_posts
  for update using (auth.uid() = autor_id);

-- Creator: publicações públicas visíveis a todos
create policy "creator_read" on creator_publicacoes
  for select using (publicado = true and removido = false);

create policy "creator_write" on creator_publicacoes
  for all using (auth.uid() = autor_id);

-- Base científica: publicados visíveis a todos autenticados
create policy "ciencia_read" on base_cientifica
  for select using (status = 'publicado' and auth.uid() is not null);

create policy "ciencia_submit" on base_cientifica
  for insert with check (auth.uid() = submetido_por);

-- Notificações: cada um vê as próprias
create policy "notif_self" on notificacoes
  for all using (auth.uid() = destinatario_id);

-- Famílias
create policy "familias_admin" on familias
  for all using (auth.uid() = admin_id);

create policy "familia_membros_self" on familia_membros
  for all using (auth.uid() = profile_id or auth.uid() in (
    select admin_id from familias where id = familia_id
  ));

-- ============================================================
-- ADMIN: usuário especial que vê tudo
-- Para ativar: no Supabase, crie o usuário admin e adicione
-- manualmente na tabela profiles com tipo='admin' e status='aprovado'
-- ============================================================

-- View para o admin ver todos os profiles com dados completos
create view admin_profiles_view as
  select
    p.*,
    u.email as auth_email,
    u.created_at as auth_created_at,
    u.last_sign_in_at
  from profiles p
  join auth.users u on p.id = u.id;

-- ============================================================
-- DADOS INICIAIS: canais da comunidade
-- (apenas referência, não uma tabela separada — o canal é um campo)
-- Canais: geral | vendas | protocolo_clinico | marcas_produtos |
--         celebracoes | anvisa_regulatorio
-- ============================================================

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
