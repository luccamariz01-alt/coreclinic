-- ============================================================
-- CoreClinic - Schema completo e RLS seguro (owner-based)
-- Execute no Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABELA 1: procedimentos
-- ============================================================
CREATE TABLE IF NOT EXISTS procedimentos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  nome             TEXT NOT NULL,
  descricao        TEXT,
  categoria        TEXT,
  valor            NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
  duracao_minutos  INTEGER NOT NULL CHECK (duracao_minutos > 0),
  ativo            BOOLEAN NOT NULL DEFAULT TRUE,
  imagem_url       TEXT,
  caracteristicas  TEXT,
  preparacao       TEXT,
  cuidados_pos     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_procedimentos_updated_at
  BEFORE UPDATE ON procedimentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_procedimentos_ativo      ON procedimentos (ativo);
CREATE INDEX IF NOT EXISTS idx_procedimentos_categoria  ON procedimentos (categoria);
CREATE INDEX IF NOT EXISTS idx_procedimentos_owner_id   ON procedimentos (owner_id);

-- ============================================================
-- TABELA 2: pacientes
-- ============================================================
CREATE TABLE IF NOT EXISTS pacientes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  nome             TEXT NOT NULL,
  telefone         TEXT,
  email            TEXT,
  data_nascimento  DATE,
  cpf              TEXT UNIQUE,
  observacoes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_pacientes_nome       ON pacientes (nome);
CREATE INDEX IF NOT EXISTS idx_pacientes_telefone   ON pacientes (telefone);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf        ON pacientes (cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_owner_id   ON pacientes (owner_id);

-- ============================================================
-- TABELA 3: agendamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS agendamentos (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  google_calendar_event_id  TEXT,
  paciente_nome             TEXT NOT NULL,
  paciente_telefone         TEXT,
  paciente_id               UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  procedimento_id           UUID REFERENCES procedimentos(id) ON DELETE SET NULL,
  procedimento_nome         TEXT,
  inicio                    TIMESTAMPTZ NOT NULL,
  fim                       TIMESTAMPTZ NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'agendado'
                              CHECK (status IN (
                                'agendado', 'confirmado', 'em_atendimento',
                                'concluido', 'cancelado', 'falta'
                              )),
  valor_cobrado             NUMERIC(10, 2) CHECK (valor_cobrado >= 0),
  observacoes               TEXT,
  origem                    TEXT NOT NULL DEFAULT 'manual'
                              CHECK (origem IN ('manual', 'n8n', 'google_calendar')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fim_apos_inicio CHECK (fim > inicio)
);

CREATE TRIGGER trg_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_agendamentos_inicio                     ON agendamentos (inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_fim                        ON agendamentos (fim);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status                     ON agendamentos (status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_id                ON agendamentos (paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_procedimento_id            ON agendamentos (procedimento_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_google_calendar_event_id   ON agendamentos (google_calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_origem                     ON agendamentos (origem);
CREATE INDEX IF NOT EXISTS idx_agendamentos_owner_id                   ON agendamentos (owner_id);

-- ============================================================
-- TABELA 4: pagamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  agendamento_id    UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  valor             NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
  metodo_pagamento  TEXT NOT NULL DEFAULT 'pix'
                      CHECK (metodo_pagamento IN (
                        'pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'outro'
                      )),
  status            TEXT NOT NULL DEFAULT 'pendente'
                      CHECK (status IN ('pendente', 'pago', 'cancelado', 'estornado')),
  data_pagamento    TIMESTAMPTZ,
  observacoes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_agendamento_id  ON pagamentos (agendamento_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status          ON pagamentos (status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_pagamento  ON pagamentos (data_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_metodo          ON pagamentos (metodo_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_owner_id        ON pagamentos (owner_id);

-- Backfill de estrutura para bancos existentes (quando tabelas ja existem).
ALTER TABLE procedimentos ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE procedimentos ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE procedimentos ADD COLUMN IF NOT EXISTS caracteristicas TEXT;
ALTER TABLE procedimentos ADD COLUMN IF NOT EXISTS preparacao TEXT;
ALTER TABLE procedimentos ADD COLUMN IF NOT EXISTS cuidados_pos TEXT;
ALTER TABLE pacientes     ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE agendamentos  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE pagamentos    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE procedimentos ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE pacientes     ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE agendamentos  ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE pagamentos    ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- ============================================================
-- VIEWS para dashboard (respeitando RLS)
-- ============================================================
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT
  DATE_TRUNC('month', data_pagamento) AS mes,
  SUM(valor)                           AS total,
  COUNT(*)                             AS total_pagamentos
FROM pagamentos
WHERE status = 'pago'
GROUP BY mes
ORDER BY mes DESC;

CREATE OR REPLACE VIEW vw_ticket_medio AS
SELECT
  DATE_TRUNC('month', inicio) AS mes,
  AVG(valor_cobrado)          AS ticket_medio,
  COUNT(*)                    AS total_atendimentos
FROM agendamentos
WHERE status = 'concluido'
GROUP BY mes
ORDER BY mes DESC;

CREATE OR REPLACE VIEW vw_agenda_hoje AS
SELECT
  a.id,
  a.paciente_nome,
  a.paciente_telefone,
  a.procedimento_nome,
  a.inicio,
  a.fim,
  a.status,
  a.observacoes
FROM agendamentos a
WHERE DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') = CURRENT_DATE
ORDER BY a.inicio;

ALTER VIEW vw_faturamento_mensal SET (security_invoker = true);
ALTER VIEW vw_ticket_medio       SET (security_invoker = true);
ALTER VIEW vw_agenda_hoje        SET (security_invoker = true);

-- ============================================================
-- RLS (deny by default + isolamento por owner_id)
-- ============================================================
ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos    ENABLE ROW LEVEL SECURITY;

ALTER TABLE procedimentos FORCE ROW LEVEL SECURITY;
ALTER TABLE pacientes     FORCE ROW LEVEL SECURITY;
ALTER TABLE agendamentos  FORCE ROW LEVEL SECURITY;
ALTER TABLE pagamentos    FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "autenticados_procedimentos" ON procedimentos;
DROP POLICY IF EXISTS "autenticados_pacientes" ON pacientes;
DROP POLICY IF EXISTS "autenticados_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "autenticados_pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "service_procedimentos" ON procedimentos;
DROP POLICY IF EXISTS "service_pacientes" ON pacientes;
DROP POLICY IF EXISTS "service_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "service_pagamentos" ON pagamentos;

DROP POLICY IF EXISTS "procedimentos_select_auth" ON procedimentos;
DROP POLICY IF EXISTS "procedimentos_insert_auth" ON procedimentos;
DROP POLICY IF EXISTS "procedimentos_update_auth" ON procedimentos;
DROP POLICY IF EXISTS "procedimentos_delete_auth" ON procedimentos;
DROP POLICY IF EXISTS "pacientes_select_auth" ON pacientes;
DROP POLICY IF EXISTS "pacientes_insert_auth" ON pacientes;
DROP POLICY IF EXISTS "pacientes_update_auth" ON pacientes;
DROP POLICY IF EXISTS "pacientes_delete_auth" ON pacientes;
DROP POLICY IF EXISTS "agendamentos_select_auth" ON agendamentos;
DROP POLICY IF EXISTS "agendamentos_insert_auth" ON agendamentos;
DROP POLICY IF EXISTS "agendamentos_update_auth" ON agendamentos;
DROP POLICY IF EXISTS "agendamentos_delete_auth" ON agendamentos;
DROP POLICY IF EXISTS "pagamentos_select_auth" ON pagamentos;
DROP POLICY IF EXISTS "pagamentos_insert_auth" ON pagamentos;
DROP POLICY IF EXISTS "pagamentos_update_auth" ON pagamentos;
DROP POLICY IF EXISTS "pagamentos_delete_auth" ON pagamentos;

CREATE POLICY "procedimentos_select_auth"
  ON procedimentos FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR owner_id IS NULL);
CREATE POLICY "procedimentos_insert_auth"
  ON procedimentos FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "procedimentos_update_auth"
  ON procedimentos FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "procedimentos_delete_auth"
  ON procedimentos FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "pacientes_select_auth"
  ON pacientes FOR SELECT TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "pacientes_insert_auth"
  ON pacientes FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "pacientes_update_auth"
  ON pacientes FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "pacientes_delete_auth"
  ON pacientes FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "agendamentos_select_auth"
  ON agendamentos FOR SELECT TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "agendamentos_insert_auth"
  ON agendamentos FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      paciente_id IS NULL
      OR EXISTS (
        SELECT 1 FROM pacientes p
        WHERE p.id = agendamentos.paciente_id
          AND p.owner_id = auth.uid()
      )
    )
    AND (
      procedimento_id IS NULL
      OR EXISTS (
        SELECT 1 FROM procedimentos pr
        WHERE pr.id = agendamentos.procedimento_id
          AND (pr.owner_id = auth.uid() OR pr.owner_id IS NULL)
      )
    )
  );
CREATE POLICY "agendamentos_update_auth"
  ON agendamentos FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      paciente_id IS NULL
      OR EXISTS (
        SELECT 1 FROM pacientes p
        WHERE p.id = agendamentos.paciente_id
          AND p.owner_id = auth.uid()
      )
    )
    AND (
      procedimento_id IS NULL
      OR EXISTS (
        SELECT 1 FROM procedimentos pr
        WHERE pr.id = agendamentos.procedimento_id
          AND (pr.owner_id = auth.uid() OR pr.owner_id IS NULL)
      )
    )
  );
CREATE POLICY "agendamentos_delete_auth"
  ON agendamentos FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "pagamentos_select_auth"
  ON pagamentos FOR SELECT TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "pagamentos_insert_auth"
  ON pagamentos FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM agendamentos a
      WHERE a.id = pagamentos.agendamento_id
        AND a.owner_id = auth.uid()
    )
  );
CREATE POLICY "pagamentos_update_auth"
  ON pagamentos FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM agendamentos a
      WHERE a.id = pagamentos.agendamento_id
        AND a.owner_id = auth.uid()
    )
  );
CREATE POLICY "pagamentos_delete_auth"
  ON pagamentos FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Integracoes server-side apenas.
CREATE POLICY "service_procedimentos" ON procedimentos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_pacientes" ON pacientes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_agendamentos" ON agendamentos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_pagamentos" ON pagamentos FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Grants explicitos para evitar bloqueios por privilegios em bancos existentes.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON TABLE procedimentos, pacientes, agendamentos, pagamentos TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE procedimentos, pacientes, agendamentos, pagamentos TO authenticated;
GRANT SELECT ON TABLE procedimentos, pacientes, agendamentos, pagamentos TO anon;

-- ============================================================
-- DADOS INICIAIS
-- ============================================================
INSERT INTO procedimentos (nome, descricao, categoria, valor, duracao_minutos) VALUES
  ('Limpeza Facial Profunda',  'Remocao de impurezas, cravos e celulas mortas',      'Estetica Facial', 180.00, 60),
  ('Toxina Botulinica',        'Suavizacao de linhas de expressao',                   'Injetaveis',     1200.00, 30),
  ('Peeling Quimico',          'Renovacao celular para manchas e acne',               'Renovacao',       350.00, 45),
  ('Preenchimento Labial',     'Volume labial com acido hialuronico',                 'Harmonizacao',   1500.00, 40),
  ('Massagem Relaxante',       'Massagem corporal de relaxamento profundo',           'Corporal',        200.00, 60),
  ('Drenagem Linfatica Facial','Reducao de inchaco e melhora da circulacao facial',  'Estetica Facial', 280.00, 40),
  ('Bioestimulador',           'Estimulacao de colageno para rejuvenescimento',       'Injetaveis',      900.00, 50),
  ('Avaliacao Inicial',        'Consulta de avaliacao e planejamento de tratamento',  'Consulta',        200.00, 30);
