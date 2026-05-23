export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anamneses_respostas: {
        Row: {
          cliente_id: string
          created_at: string | null
          id: string
          respostas: Json
          template_id: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          id?: string
          respostas?: Json
          template_id?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          id?: string
          respostas?: Json
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_respostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_respostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_respostas_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "anamneses_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      anamneses_templates: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          criado_por: string
          descricao: string | null
          id: string
          obrigatoria: boolean | null
          perguntas: Json
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          criado_por: string
          descricao?: string | null
          id?: string
          obrigatoria?: boolean | null
          perguntas?: Json
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          criado_por?: string
          descricao?: string | null
          id?: string
          obrigatoria?: boolean | null
          perguntas?: Json
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_templates_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_templates_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      base_cientifica: {
        Row: {
          ano: number | null
          arquivo_url: string | null
          created_at: string | null
          fonte: string | null
          id: string
          pilar: string
          resumo: string | null
          status: string | null
          submetido_por: string
          tags: string[] | null
          titulo: string
          url: string | null
        }
        Insert: {
          ano?: number | null
          arquivo_url?: string | null
          created_at?: string | null
          fonte?: string | null
          id?: string
          pilar: string
          resumo?: string | null
          status?: string | null
          submetido_por: string
          tags?: string[] | null
          titulo: string
          url?: string | null
        }
        Update: {
          ano?: number | null
          arquivo_url?: string | null
          created_at?: string | null
          fonte?: string | null
          id?: string
          pilar?: string
          resumo?: string | null
          status?: string | null
          submetido_por?: string
          tags?: string[] | null
          titulo?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "base_cientifica_submetido_por_fkey"
            columns: ["submetido_por"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "base_cientifica_submetido_por_fkey"
            columns: ["submetido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      biomarcadores: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_coleta: string | null
          editado_manualmente: boolean | null
          fonte: string | null
          id: string
          nome: string
          referencia_max: number | null
          referencia_min: number | null
          status: string | null
          unidade: string | null
          valor: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_coleta?: string | null
          editado_manualmente?: boolean | null
          fonte?: string | null
          id?: string
          nome: string
          referencia_max?: number | null
          referencia_min?: number | null
          status?: string | null
          unidade?: string | null
          valor?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_coleta?: string | null
          editado_manualmente?: boolean | null
          fonte?: string | null
          id?: string
          nome?: string
          referencia_max?: number | null
          referencia_min?: number | null
          status?: string | null
          unidade?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "biomarcadores_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biomarcadores_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_likes: {
        Row: {
          post_id: string
          profile_id: string
        }
        Insert: {
          post_id: string
          profile_id: string
        }
        Update: {
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "comunidade_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunidade_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunidade_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_posts: {
        Row: {
          autor_id: string
          canal: string
          conteudo: string
          created_at: string | null
          id: string
          likes: number | null
          removido: boolean | null
          removido_motivo: string | null
          reportes: number | null
        }
        Insert: {
          autor_id: string
          canal: string
          conteudo: string
          created_at?: string | null
          id?: string
          likes?: number | null
          removido?: boolean | null
          removido_motivo?: string | null
          reportes?: number | null
        }
        Update: {
          autor_id?: string
          canal?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          removido?: boolean | null
          removido_motivo?: string | null
          reportes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_posts_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunidade_posts_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_reportes: {
        Row: {
          created_at: string | null
          id: string
          motivo: string
          post_id: string
          reporter_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          motivo: string
          post_id: string
          reporter_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          motivo?: string
          post_id?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_reportes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "comunidade_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunidade_reportes_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunidade_reportes_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consentimentos: {
        Row: {
          ativo: boolean | null
          autorizado_id: string
          cliente_id: string
          criado_em: string | null
          dados_autorizados: string[] | null
          id: string
          revogado_em: string | null
        }
        Insert: {
          ativo?: boolean | null
          autorizado_id: string
          cliente_id: string
          criado_em?: string | null
          dados_autorizados?: string[] | null
          id?: string
          revogado_em?: string | null
        }
        Update: {
          ativo?: boolean | null
          autorizado_id?: string
          cliente_id?: string
          criado_em?: string | null
          dados_autorizados?: string[] | null
          id?: string
          revogado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consentimentos_autorizado_id_fkey"
            columns: ["autorizado_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consentimentos_autorizado_id_fkey"
            columns: ["autorizado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consentimentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consentimentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_publicacoes: {
        Row: {
          autor_id: string
          conteudo: string | null
          created_at: string | null
          id: string
          modelo_acesso: string | null
          pilar: string | null
          publicado: boolean | null
          removido: boolean | null
          reportes: number | null
          tipo: string
          titulo: string
          valor: number | null
          visualizacoes: number | null
        }
        Insert: {
          autor_id: string
          conteudo?: string | null
          created_at?: string | null
          id?: string
          modelo_acesso?: string | null
          pilar?: string | null
          publicado?: boolean | null
          removido?: boolean | null
          reportes?: number | null
          tipo: string
          titulo: string
          valor?: number | null
          visualizacoes?: number | null
        }
        Update: {
          autor_id?: string
          conteudo?: string | null
          created_at?: string | null
          id?: string
          modelo_acesso?: string | null
          pilar?: string | null
          publicado?: boolean | null
          removido?: boolean | null
          reportes?: number | null
          tipo?: string
          titulo?: string
          valor?: number | null
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_publicacoes_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_publicacoes_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exames: {
        Row: {
          arquivo_url: string | null
          cliente_id: string
          created_at: string | null
          data_coleta: string | null
          id: string
          laboratorio: string | null
          processado: boolean | null
          tipo: string | null
        }
        Insert: {
          arquivo_url?: string | null
          cliente_id: string
          created_at?: string | null
          data_coleta?: string | null
          id?: string
          laboratorio?: string | null
          processado?: boolean | null
          tipo?: string | null
        }
        Update: {
          arquivo_url?: string | null
          cliente_id?: string
          created_at?: string | null
          data_coleta?: string | null
          id?: string
          laboratorio?: string | null
          processado?: boolean | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exames_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exames_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      familia_membros: {
        Row: {
          consentimento_dado: boolean | null
          consentimento_em: string | null
          created_at: string | null
          documento_tutela_url: string | null
          eh_menor: boolean | null
          familia_id: string
          id: string
          parentesco: string | null
          profile_id: string
          responsavel_id: string | null
        }
        Insert: {
          consentimento_dado?: boolean | null
          consentimento_em?: string | null
          created_at?: string | null
          documento_tutela_url?: string | null
          eh_menor?: boolean | null
          familia_id: string
          id?: string
          parentesco?: string | null
          profile_id: string
          responsavel_id?: string | null
        }
        Update: {
          consentimento_dado?: boolean | null
          consentimento_em?: string | null
          created_at?: string | null
          documento_tutela_url?: string | null
          eh_menor?: boolean | null
          familia_id?: string
          id?: string
          parentesco?: string | null
          profile_id?: string
          responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "familia_membros_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familia_membros_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familia_membros_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familia_membros_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familia_membros_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      familias: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "familias_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familias_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_usd: number
          created_at: string
          id: string
          order_id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
        }
        Insert: {
          amount_usd: number
          created_at?: string
          id?: string
          order_id: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Update: {
          amount_usd?: number
          created_at?: string
          id?: string
          order_id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          org_kind: Database["public"]["Enums"]["organization_kind"]
          organization_id: string
          role: Database["public"]["Enums"]["membership_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_kind: Database["public"]["Enums"]["organization_kind"]
          organization_id: string
          role: Database["public"]["Enums"]["membership_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_kind?: Database["public"]["Enums"]["organization_kind"]
          organization_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          destinatario_id: string
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          destinatario_id: string
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          destinatario_id?: string
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          brand_id: string
          created_at: string
          created_by: string
          for_person_id: string | null
          id: string
          lab_id: string
          originating_agent_membership_id: string | null
          payment_terms: string
          product_id: string
          quantity: number
          stage: Database["public"]["Enums"]["order_stage"]
          status: Database["public"]["Enums"]["order_status"]
          total_usd: number
          unit_price_usd: number
          updated_at: string
          vertical: Database["public"]["Enums"]["vertical_kind"]
        }
        Insert: {
          brand_id: string
          created_at?: string
          created_by: string
          for_person_id?: string | null
          id?: string
          lab_id: string
          originating_agent_membership_id?: string | null
          payment_terms?: string
          product_id: string
          quantity: number
          stage?: Database["public"]["Enums"]["order_stage"]
          status?: Database["public"]["Enums"]["order_status"]
          total_usd?: number
          unit_price_usd: number
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical_kind"]
        }
        Update: {
          brand_id?: string
          created_at?: string
          created_by?: string
          for_person_id?: string | null
          id?: string
          lab_id?: string
          originating_agent_membership_id?: string | null
          payment_terms?: string
          product_id?: string
          quantity?: number
          stage?: Database["public"]["Enums"]["order_stage"]
          status?: Database["public"]["Enums"]["order_status"]
          total_usd?: number
          unit_price_usd?: number
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical_kind"]
        }
        Relationships: [
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_for_person_id_fkey"
            columns: ["for_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_originating_agent_membership_id_fkey"
            columns: ["originating_agent_membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country: string
          created_at: string
          currency: string
          id: string
          kind: Database["public"]["Enums"]["organization_kind"]
          name: string
          owner_id: string
          updated_at: string
          vertical: Database["public"]["Enums"]["vertical_kind"]
        }
        Insert: {
          country: string
          created_at?: string
          currency?: string
          id?: string
          kind: Database["public"]["Enums"]["organization_kind"]
          name: string
          owner_id: string
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical_kind"]
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string
          id?: string
          kind?: Database["public"]["Enums"]["organization_kind"]
          name?: string
          owner_id?: string
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical_kind"]
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          created_at: string
          created_by_membership_id: string
          id: string
          name: string
          primary_contact: string
          updated_at: string
          vertical: Database["public"]["Enums"]["vertical_kind"]
        }
        Insert: {
          created_at?: string
          created_by_membership_id: string
          id?: string
          name: string
          primary_contact: string
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical_kind"]
        }
        Update: {
          created_at?: string
          created_by_membership_id?: string
          id?: string
          name?: string
          primary_contact?: string
          updated_at?: string
          vertical?: Database["public"]["Enums"]["vertical_kind"]
        }
        Relationships: [
          {
            foreignKeyName: "people_created_by_membership_id_fkey"
            columns: ["created_by_membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_agencia: {
        Row: {
          canais_atuacao: string[] | null
          cnpj: string | null
          created_at: string | null
          id: string
          modelo_cobranca: string | null
          nome_agencia: string | null
          profile_id: string
          responsavel_nome: string | null
        }
        Insert: {
          canais_atuacao?: string[] | null
          cnpj?: string | null
          created_at?: string | null
          id?: string
          modelo_cobranca?: string | null
          nome_agencia?: string | null
          profile_id: string
          responsavel_nome?: string | null
        }
        Update: {
          canais_atuacao?: string[] | null
          cnpj?: string | null
          created_at?: string | null
          id?: string
          modelo_cobranca?: string | null
          nome_agencia?: string | null
          profile_id?: string
          responsavel_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_agencia_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_agencia_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_agente: {
        Row: {
          anos_experiencia: number | null
          bio_publica: string | null
          cpf: string | null
          created_at: string | null
          especialidades: string[] | null
          id: string
          profile_id: string
          valor_mensal: number | null
        }
        Insert: {
          anos_experiencia?: number | null
          bio_publica?: string | null
          cpf?: string | null
          created_at?: string | null
          especialidades?: string[] | null
          id?: string
          profile_id: string
          valor_mensal?: number | null
        }
        Update: {
          anos_experiencia?: number | null
          bio_publica?: string | null
          cpf?: string | null
          created_at?: string | null
          especialidades?: string[] | null
          id?: string
          profile_id?: string
          valor_mensal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_agente_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_agente_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_cliente: {
        Row: {
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          id: string
          profile_id: string
          score_longevidade: number | null
          sexo: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          profile_id: string
          score_longevidade?: number | null
          sexo?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          profile_id?: string
          score_longevidade?: number | null
          sexo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_cliente_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_cliente_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_clinica: {
        Row: {
          bio_publica: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          endereco: string | null
          estado: string | null
          id: string
          modalidades: string[] | null
          nome_clinica: string | null
          profile_id: string
          responsavel_cpf: string | null
          responsavel_nome: string | null
        }
        Insert: {
          bio_publica?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          modalidades?: string[] | null
          nome_clinica?: string | null
          profile_id: string
          responsavel_cpf?: string | null
          responsavel_nome?: string | null
        }
        Update: {
          bio_publica?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          modalidades?: string[] | null
          nome_clinica?: string | null
          profile_id?: string
          responsavel_cpf?: string | null
          responsavel_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_clinica_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_clinica_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_distribuidora: {
        Row: {
          cnpj: string | null
          created_at: string | null
          id: string
          profile_id: string
          regioes_cobertura: string[] | null
          responsavel_nome: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          profile_id: string
          regioes_cobertura?: string[] | null
          responsavel_nome?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string
          regioes_cobertura?: string[] | null
          responsavel_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_distribuidora_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_distribuidora_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_escritorio: {
        Row: {
          bio_publica: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          estado: string | null
          id: string
          nome_escritorio: string | null
          profile_id: string
          responsavel_cpf: string | null
          responsavel_nome: string | null
          site: string | null
        }
        Insert: {
          bio_publica?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          nome_escritorio?: string | null
          profile_id: string
          responsavel_cpf?: string | null
          responsavel_nome?: string | null
          site?: string | null
        }
        Update: {
          bio_publica?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          nome_escritorio?: string | null
          profile_id?: string
          responsavel_cpf?: string | null
          responsavel_nome?: string | null
          site?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_escritorio_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_escritorio_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_hub: {
        Row: {
          cnpj: string | null
          created_at: string | null
          id: string
          profile_id: string
          regioes_cobertura: string[] | null
          responsavel_nome: string | null
          tem_api: boolean | null
          tipo_operacao: string[] | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          profile_id: string
          regioes_cobertura?: string[] | null
          responsavel_nome?: string | null
          tem_api?: boolean | null
          tipo_operacao?: string[] | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string
          regioes_cobertura?: string[] | null
          responsavel_nome?: string | null
          tem_api?: boolean | null
          tipo_operacao?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_hub_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_hub_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_industria: {
        Row: {
          certificacoes_anvisa: string[] | null
          cnpj: string | null
          created_at: string | null
          id: string
          nome_industria: string | null
          produtos_principais: string | null
          profile_id: string
          responsavel_nome: string | null
        }
        Insert: {
          certificacoes_anvisa?: string[] | null
          cnpj?: string | null
          created_at?: string | null
          id?: string
          nome_industria?: string | null
          produtos_principais?: string | null
          profile_id: string
          responsavel_nome?: string | null
        }
        Update: {
          certificacoes_anvisa?: string[] | null
          cnpj?: string | null
          created_at?: string | null
          id?: string
          nome_industria?: string | null
          produtos_principais?: string | null
          profile_id?: string
          responsavel_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_industria_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_industria_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_labdiag: {
        Row: {
          cnpj: string | null
          coleta_domiciliar: boolean | null
          created_at: string | null
          exames_oferecidos: string[] | null
          id: string
          profile_id: string
          responsavel_nome: string | null
        }
        Insert: {
          cnpj?: string | null
          coleta_domiciliar?: boolean | null
          created_at?: string | null
          exames_oferecidos?: string[] | null
          id?: string
          profile_id: string
          responsavel_nome?: string | null
        }
        Update: {
          cnpj?: string | null
          coleta_domiciliar?: boolean | null
          created_at?: string | null
          exames_oferecidos?: string[] | null
          id?: string
          profile_id?: string
          responsavel_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_labdiag_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_labdiag_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_magistral: {
        Row: {
          cnpj: string | null
          created_at: string | null
          crf: string | null
          id: string
          profile_id: string
          responsavel_nome: string | null
          responsavel_tecnico: string | null
          uf_crf: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          crf?: string | null
          id?: string
          profile_id: string
          responsavel_nome?: string | null
          responsavel_tecnico?: string | null
          uf_crf?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          crf?: string | null
          id?: string
          profile_id?: string
          responsavel_nome?: string | null
          responsavel_tecnico?: string | null
          uf_crf?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_magistral_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_magistral_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_marca: {
        Row: {
          cnpj: string | null
          created_at: string | null
          id: string
          nome_marca: string | null
          produtos_principais: string | null
          profile_id: string
          responsavel_nome: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          nome_marca?: string | null
          produtos_principais?: string | null
          profile_id: string
          responsavel_nome?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          nome_marca?: string | null
          produtos_principais?: string | null
          profile_id?: string
          responsavel_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_marca_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_marca_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_pesquisador: {
        Row: {
          area_pesquisa: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string | null
          id: string
          instituicao: string | null
          lattes_url: string | null
          profile_id: string
          titulacao: string | null
        }
        Insert: {
          area_pesquisa?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          id?: string
          instituicao?: string | null
          lattes_url?: string | null
          profile_id: string
          titulacao?: string | null
        }
        Update: {
          area_pesquisa?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          id?: string
          instituicao?: string | null
          lattes_url?: string | null
          profile_id?: string
          titulacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_pesquisador_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_pesquisador_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_profissional: {
        Row: {
          autonomo: boolean | null
          bio_publica: string | null
          cpf: string | null
          created_at: string | null
          especialidade: string | null
          id: string
          modalidades: string[] | null
          numero_registro: string | null
          outras_especialidades: string[] | null
          profile_id: string
          tipo_registro: string | null
          uf_registro: string | null
          valor_consulta: number | null
        }
        Insert: {
          autonomo?: boolean | null
          bio_publica?: string | null
          cpf?: string | null
          created_at?: string | null
          especialidade?: string | null
          id?: string
          modalidades?: string[] | null
          numero_registro?: string | null
          outras_especialidades?: string[] | null
          profile_id: string
          tipo_registro?: string | null
          uf_registro?: string | null
          valor_consulta?: number | null
        }
        Update: {
          autonomo?: boolean | null
          bio_publica?: string | null
          cpf?: string | null
          created_at?: string | null
          especialidade?: string | null
          id?: string
          modalidades?: string[] | null
          numero_registro?: string | null
          outras_especialidades?: string[] | null
          profile_id?: string
          tipo_registro?: string | null
          uf_registro?: string | null
          valor_consulta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_profissional_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_profissional_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          lab_id: string
          name: string
          price_usd: number
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          lab_id: string
          name: string
          price_usd: number
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          lab_id?: string
          name?: string
          price_usd?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          cidade: string | null
          cnpj: string | null
          como_conheceu: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          estado: string | null
          id: string
          motivacao: string | null
          nome_completo: string | null
          nome_fantasia: string | null
          notas_admin: string | null
          onboarding_completo: boolean | null
          onboarding_completo_em: string | null
          pais: string | null
          recusado_motivo: string | null
          starkbank_account_id: string | null
          starkbank_pix_key: string | null
          status: Database["public"]["Enums"]["aprovacao_status"]
          telefone: string | null
          termos_aceitos: boolean | null
          termos_aceitos_em: string | null
          tipo: Database["public"]["Enums"]["ator_tipo"]
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          cidade?: string | null
          cnpj?: string | null
          como_conheceu?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          id: string
          motivacao?: string | null
          nome_completo?: string | null
          nome_fantasia?: string | null
          notas_admin?: string | null
          onboarding_completo?: boolean | null
          onboarding_completo_em?: string | null
          pais?: string | null
          recusado_motivo?: string | null
          starkbank_account_id?: string | null
          starkbank_pix_key?: string | null
          status?: Database["public"]["Enums"]["aprovacao_status"]
          telefone?: string | null
          termos_aceitos?: boolean | null
          termos_aceitos_em?: string | null
          tipo: Database["public"]["Enums"]["ator_tipo"]
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          cidade?: string | null
          cnpj?: string | null
          como_conheceu?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          motivacao?: string | null
          nome_completo?: string | null
          nome_fantasia?: string | null
          notas_admin?: string | null
          onboarding_completo?: boolean | null
          onboarding_completo_em?: string | null
          pais?: string | null
          recusado_motivo?: string | null
          starkbank_account_id?: string | null
          starkbank_pix_key?: string | null
          status?: Database["public"]["Enums"]["aprovacao_status"]
          telefone?: string | null
          termos_aceitos?: boolean | null
          termos_aceitos_em?: string | null
          tipo?: Database["public"]["Enums"]["ator_tipo"]
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vinculos: {
        Row: {
          created_at: string | null
          destinatario_id: string
          id: string
          mensagem: string | null
          respondido_em: string | null
          solicitante_id: string
          status: string | null
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          destinatario_id: string
          id?: string
          mensagem?: string | null
          respondido_em?: string | null
          solicitante_id: string
          status?: string | null
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          destinatario_id?: string
          id?: string
          mensagem?: string | null
          respondido_em?: string | null
          solicitante_id?: string
          status?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vinculos_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_profiles_view: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          auth_created_at: string | null
          auth_email: string | null
          cidade: string | null
          cnpj: string | null
          como_conheceu: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          estado: string | null
          id: string | null
          last_sign_in_at: string | null
          motivacao: string | null
          nome_completo: string | null
          nome_fantasia: string | null
          notas_admin: string | null
          onboarding_completo: boolean | null
          onboarding_completo_em: string | null
          pais: string | null
          recusado_motivo: string | null
          starkbank_account_id: string | null
          starkbank_pix_key: string | null
          status: Database["public"]["Enums"]["aprovacao_status"] | null
          telefone: string | null
          termos_aceitos: boolean | null
          termos_aceitos_em: string | null
          tipo: Database["public"]["Enums"]["ator_tipo"] | null
          updated_at: string | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "admin_profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["ator_tipo"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_approved: { Args: never; Returns: boolean }
      is_member_of: { Args: { org: string }; Returns: boolean }
    }
    Enums: {
      aprovacao_status: "pendente" | "aprovado" | "recusado" | "em_analise"
      ator_tipo:
        | "industria"
        | "marca"
        | "escritorio"
        | "agente"
        | "clinica"
        | "profissional"
        | "magistral"
        | "distribuidora"
        | "labdiag"
        | "hub"
        | "agencia"
        | "pesquisador"
        | "cliente"
        | "admin"
      invoice_status: "pending" | "paid"
      membership_role: "owner" | "member" | "agente"
      order_stage:
        | "rascunho"
        | "cotacao_aberta"
        | "documentacao"
        | "pagamento"
        | "producao_ou_importacao"
        | "logistica"
        | "entregue"
        | "liquidado"
        | "cancelado"
      order_status:
        | "created"
        | "approved"
        | "in_production"
        | "ready"
        | "shipped"
      organization_kind: "industria" | "brand"
      vertical_kind: "cannabis_medicinal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      aprovacao_status: ["pendente", "aprovado", "recusado", "em_analise"],
      ator_tipo: [
        "industria",
        "marca",
        "escritorio",
        "agente",
        "clinica",
        "profissional",
        "magistral",
        "distribuidora",
        "labdiag",
        "hub",
        "agencia",
        "pesquisador",
        "cliente",
        "admin",
      ],
      invoice_status: ["pending", "paid"],
      membership_role: ["owner", "member", "agente"],
      order_stage: [
        "rascunho",
        "cotacao_aberta",
        "documentacao",
        "pagamento",
        "producao_ou_importacao",
        "logistica",
        "entregue",
        "liquidado",
        "cancelado",
      ],
      order_status: [
        "created",
        "approved",
        "in_production",
        "ready",
        "shipped",
      ],
      organization_kind: ["industria", "brand"],
      vertical_kind: ["cannabis_medicinal"],
    },
  },
} as const
