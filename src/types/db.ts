// Gerado a partir do Supabase (generate_typescript_types) em 06/11/2026 e compactado:
// Insert/Update derivados de Row. Regenerar quando o schema mudar.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GeneroT = "menino" | "menina";
type StatusCartinhaT = "disponivel" | "pendente" | "apadrinhada";
type StatusAdocaoT = "pendente" | "aprovada" | "recusada" | "expirada" | "cancelada";

/** Monta Row/Insert/Update: chaves em `Opcionais` são opcionais no Insert. */
type Tabela<Row, Opcionais extends keyof Row, Rel = []> = {
  Row: Row;
  Insert: Omit<Row, Opcionais> & Partial<Pick<Row, Opcionais>>;
  Update: Partial<Row>;
  Relationships: Rel;
};
type Visao<Row> = { Row: { [K in keyof Row]: Row[K] | null }; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

type CartinhaRow = {
  id: string;
  codigo: string;
  primeiro_nome: string;
  idade: number;
  genero: GeneroT;
  pedido: string;
  tamanho_roupa: string | null;
  tamanho_calcado: string | null;
  observacoes: string | null;
  imagem_path: string | null;
  status: StatusCartinhaT;
  teste: boolean;
  criado_em: string;
  atualizado_em: string;
};

type ConfiguracaoRow = {
  id: number;
  pix_chave: string | null;
  pix_tipo: string | null;
  pix_recebedor: string | null;
  pix_cidade: string | null;
  pix_banco: string | null;
  whatsapp_contato: string | null;
  evento_data_hora: string;
  prazo_entrega: string;
  video_url: string | null;
  video_capa_path: string | null;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      cartinhas: Tabela<
        CartinhaRow,
        "id" | "tamanho_roupa" | "tamanho_calcado" | "observacoes" | "imagem_path" | "status" | "teste" | "criado_em" | "atualizado_em"
      >;
      adocoes: Tabela<
        {
          id: string;
          cartinha_id: string;
          padrinho_nome: string;
          padrinho_whatsapp: string;
          padrinho_email: string;
          status: StatusAdocaoT;
          criado_em: string;
          expira_em: string;
          decidido_em: string | null;
          decidido_por: string | null;
          ip_hash: string | null;
        },
        "id" | "status" | "criado_em" | "expira_em" | "decidido_em" | "decidido_por" | "ip_hash",
        [
          { foreignKeyName: "adocoes_cartinha_id_fkey"; columns: ["cartinha_id"]; isOneToOne: false; referencedRelation: "cartinhas"; referencedColumns: ["id"] },
        ]
      >;
      historico: Tabela<
        { id: number; adocao_id: string | null; acao: string; voluntario_email: string | null; quando: string; detalhe: string | null },
        "id" | "adocao_id" | "voluntario_email" | "quando" | "detalhe",
        [
          { foreignKeyName: "historico_adocao_id_fkey"; columns: ["adocao_id"]; isOneToOne: false; referencedRelation: "adocoes"; referencedColumns: ["id"] },
        ]
      >;
      pontos_entrega: Tabela<
        { id: string; nome: string; endereco: string; horario: string | null; maps_url: string | null; ordem: number; ativo: boolean },
        "id" | "horario" | "maps_url" | "ordem" | "ativo"
      >;
      patrocinadores: Tabela<
        { id: string; nome: string; logo_path: string | null; link: string | null; ordem: number; ativo: boolean },
        "id" | "logo_path" | "link" | "ordem" | "ativo"
      >;
      edicoes: Tabela<
        {
          id: string;
          ano: number;
          edicao_numero: number | null;
          criancas_atendidas: number | null;
          presentes_entregues: number | null;
          texto: string | null;
          ordem: number;
        },
        "id" | "edicao_numero" | "criancas_atendidas" | "presentes_entregues" | "texto" | "ordem"
      >;
      edicao_fotos: Tabela<
        { id: string; edicao_id: string; foto_path: string; alt: string | null; ordem: number },
        "id" | "alt" | "ordem",
        [
          { foreignKeyName: "edicao_fotos_edicao_id_fkey"; columns: ["edicao_id"]; isOneToOne: false; referencedRelation: "edicoes"; referencedColumns: ["id"] },
        ]
      >;
      configuracoes: Tabela<ConfiguracaoRow, keyof ConfiguracaoRow>;
      voluntarios: Tabela<{ email: string; nome: string | null; ativo: boolean }, "nome" | "ativo">;
      tentativas_ip: Tabela<{ id: number; ip_hash: string; quando: string }, "id" | "quando">;
    };
    Views: {
      cartinhas_publicas: Visao<Omit<CartinhaRow, "observacoes" | "teste" | "criado_em" | "atualizado_em">>;
      configuracoes_publicas: Visao<Omit<ConfiguracaoRow, "id">>;
    };
    Functions: {
      adotar_cartinha: {
        Args: { p_codigo: string; p_nome: string; p_whatsapp: string; p_email: string; p_ip_hash: string };
        Returns: string;
      };
      decidir_adocao: { Args: { p_adocao_id: string; p_acao: string }; Returns: string };
      expirar_pendentes: { Args: never; Returns: number };
    };
    Enums: { genero_t: GeneroT; status_adocao_t: StatusAdocaoT; status_cartinha_t: StatusCartinhaT };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ResultadoAdocao = "ok" | "indisponivel" | "limite" | "nao_encontrada";
export type ResultadoDecisao = "ok" | "estado_invalido";
