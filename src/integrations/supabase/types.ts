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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ajuda: {
        Row: {
          created_at: string
          id: string
          mensagem: string
          opcao: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem: string
          opcao: string
          usuario_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          mensagem?: string
          opcao?: string
          usuario_id?: string
        }
        Relationships: []
      }
      cartoes: {
        Row: {
          apelido: string
          bandeira: string
          created_at: string
          fechamento_fatura: number
          id: string
          limite_total: number | null
          updated_at: string
          usuario_id: string
          vencimento_fatura: number
        }
        Insert: {
          apelido: string
          bandeira: string
          created_at?: string
          fechamento_fatura: number
          id?: string
          limite_total?: number | null
          updated_at?: string
          usuario_id: string
          vencimento_fatura: number
        }
        Update: {
          apelido?: string
          bandeira?: string
          created_at?: string
          fechamento_fatura?: number
          id?: string
          limite_total?: number | null
          updated_at?: string
          usuario_id?: string
          vencimento_fatura?: number
        }
        Relationships: []
      }
      despesas: {
        Row: {
          bandeira: string | null
          cartao_id: string | null
          categoria: string | null
          data: string | null
          data_compra: string | null
          data_pagamento: string | null
          descricao: string | null
          despesa_fixa: boolean | null
          id: string
          id_compra: string
          modalidade: string | null
          parcela_atual: number | null
          parcelas_total: number | null
          status: string | null
          usuario_id: string | null
          valor: number | null
          valor_parcela: number | null
        }
        Insert: {
          bandeira?: string | null
          cartao_id?: string | null
          categoria?: string | null
          data?: string | null
          data_compra?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          despesa_fixa?: boolean | null
          id?: string
          id_compra: string
          modalidade?: string | null
          parcela_atual?: number | null
          parcelas_total?: number | null
          status?: string | null
          usuario_id?: string | null
          valor?: number | null
          valor_parcela?: number | null
        }
        Update: {
          bandeira?: string | null
          cartao_id?: string | null
          categoria?: string | null
          data?: string | null
          data_compra?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          despesa_fixa?: boolean | null
          id?: string
          id_compra?: string
          modalidade?: string | null
          parcela_atual?: number | null
          parcelas_total?: number | null
          status?: string | null
          usuario_id?: string | null
          valor?: number | null
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "despesas_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id"]
          },
        ]
      }
      investimentos: {
        Row: {
          categoria: string | null
          data: string
          descricao: string | null
          id: string
          tipo: string | null
          usuario_id: string | null
          valor: number | null
        }
        Insert: {
          categoria?: string | null
          data: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          usuario_id?: string | null
          valor?: number | null
        }
        Update: {
          categoria?: string | null
          data?: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          usuario_id?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      objetivo_checklists: {
        Row: {
          concluido: boolean | null
          created_at: string | null
          id: string
          objetivo_id: string
          titulo: string
        }
        Insert: {
          concluido?: boolean | null
          created_at?: string | null
          id?: string
          objetivo_id: string
          titulo: string
        }
        Update: {
          concluido?: boolean | null
          created_at?: string | null
          id?: string
          objetivo_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "objetivo_checklists_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos"
            referencedColumns: ["id"]
          },
        ]
      }
      objetivos: {
        Row: {
          categoria: string
          created_at: string | null
          data_objetivo: string
          descricao: string | null
          id: string
          prioridade: string
          titulo: string
          updated_at: string | null
          usuario_id: string
          valor_atual: number
          valor_objetivo: number
        }
        Insert: {
          categoria: string
          created_at?: string | null
          data_objetivo: string
          descricao?: string | null
          id?: string
          prioridade: string
          titulo: string
          updated_at?: string | null
          usuario_id: string
          valor_atual?: number
          valor_objetivo: number
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data_objetivo?: string
          descricao?: string | null
          id?: string
          prioridade?: string
          titulo?: string
          updated_at?: string | null
          usuario_id?: string
          valor_atual?: number
          valor_objetivo?: number
        }
        Relationships: []
      }
      planejamento_despesas_fixas: {
        Row: {
          categoria: string | null
          created_at: string | null
          descricao: string
          id: string
          usuario_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          usuario_id?: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          usuario_id?: string
          valor?: number
        }
        Relationships: []
      }
      planejamento_tetos: {
        Row: {
          categoria: string
          created_at: string | null
          id: string
          teto: number
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          id?: string
          teto: number
          updated_at?: string | null
          usuario_id?: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: string
          teto?: number
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          celular: string | null
          created_at: string | null
          data_nascimento: string | null
          id: string
          nome: string | null
          sobrenome: string | null
          updated_at: string | null
        }
        Insert: {
          celular?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          id: string
          nome?: string | null
          sobrenome?: string | null
          updated_at?: string | null
        }
        Update: {
          celular?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          nome?: string | null
          sobrenome?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      receitas: {
        Row: {
          categoria: string | null
          data: string | null
          descricao: string | null
          forma: string | null
          id: string
          usuario_id: string | null
          valor: number | null
        }
        Insert: {
          categoria?: string | null
          data?: string | null
          descricao?: string | null
          forma?: string | null
          id?: string
          usuario_id?: string | null
          valor?: number | null
        }
        Update: {
          categoria?: string | null
          data?: string | null
          descricao?: string | null
          forma?: string | null
          id?: string
          usuario_id?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      saldos_iniciais: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          usuario_id: string
          valor_investimentos: number | null
          valor_reserva_financeira: number | null
          valor_va: number | null
          valor_vr: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          usuario_id: string
          valor_investimentos?: number | null
          valor_reserva_financeira?: number | null
          valor_va?: number | null
          valor_vr?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          usuario_id?: string
          valor_investimentos?: number | null
          valor_reserva_financeira?: number | null
          valor_va?: number | null
          valor_vr?: number | null
        }
        Relationships: []
      }
      totais_financeiros: {
        Row: {
          id: string
          total_geral_investimentos: number | null
          total_geral_vrva: number | null
          total_investimentos: number | null
          total_reserva_emergencia: number | null
          total_va: number | null
          total_vr: number | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          id?: string
          total_geral_investimentos?: number | null
          total_geral_vrva?: number | null
          total_investimentos?: number | null
          total_reserva_emergencia?: number | null
          total_va?: number | null
          total_vr?: number | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          id?: string
          total_geral_investimentos?: number | null
          total_geral_vrva?: number | null
          total_investimentos?: number | null
          total_reserva_emergencia?: number | null
          total_va?: number | null
          total_vr?: number | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      vr_va: {
        Row: {
          data: string | null
          descricao: string | null
          id: string
          movimentacao: string | null
          tipo: string | null
          usuario_id: string
          valor: number | null
        }
        Insert: {
          data?: string | null
          descricao?: string | null
          id?: string
          movimentacao?: string | null
          tipo?: string | null
          usuario_id?: string
          valor?: number | null
        }
        Update: {
          data?: string | null
          descricao?: string | null
          id?: string
          movimentacao?: string | null
          tipo?: string | null
          usuario_id?: string
          valor?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_totais_financeiros: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
