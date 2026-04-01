-- ============================================================
-- CoreClinic — Schema completo
-- Execute no Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- EXTENSÕES
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- HELPER: atualiza updated_at automaticamente
-- ────────────────────────────────────────────────────────────
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
  nome             TEXT NOT NULL,
  descricao        TEXT,
  categoria        TEXT,
  valor            NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
  duracao_minutos  INTEGER NOT NULL CHECK (duracao_minutos > 0),
  ativo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_procedimentos_updated_at
  BEFORE UPDATE ON procedimentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices
CREATE INDEX idx_procedimentos_ativo    ON procedimentos (ativo);
CREATE INDEX idx_procedimentos_categoria ON procedimentos (categoria);

-- ============================================================
-- TABELA 2: pacientes
-- ============================================================
CREATE TABLE IF NOT EXISTS pacientes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Índices
CREATE INDEX idx_pacientes_nome     ON pacientes (nome);
CREATE INDEX idx_pacientes_telefone ON pacientes (telefone);
CREATE INDEX idx_pacientes_cpf      ON pacientes (cpf);

-- ============================================================
-- TABELA 3: agendamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS agendamentos (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_calendar_event_id  TEXT,                          -- ID do evento no Google Calendar
  paciente_nome             TEXT NOT NULL,                 -- nome do paciente (obrigatório)
  paciente_telefone         TEXT,                          -- telefone de contato
  paciente_id               UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  procedimento_id           UUID REFERENCES procedimentos(id) ON DELETE SET NULL,
  procedimento_nome         TEXT,                          -- denormalizado p/ facilitar n8n
  inicio                    TIMESTAMPTZ NOT NULL,          -- ex: 2025-04-02 14:00:00-03
  fim                       TIMESTAMPTZ NOT NULL,          -- ex: 2025-04-02 15:30:00-03
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

-- Índices
CREATE INDEX idx_agendamentos_inicio                   ON agendamentos (inicio);
CREATE INDEX idx_agendamentos_fim                      ON agendamentos (fim);
CREATE INDEX idx_agendamentos_status                   ON agendamentos (status);
CREATE INDEX idx_agendamentos_paciente_id              ON agendamentos (paciente_id);
CREATE INDEX idx_agendamentos_procedimento_id          ON agendamentos (procedimento_id);
CREATE INDEX idx_agendamentos_google_calendar_event_id ON agendamentos (google_calendar_event_id);
CREATE INDEX idx_agendamentos_origem                   ON agendamentos (origem);

-- ============================================================
-- TABELA 4: pagamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Índices
CREATE INDEX idx_pagamentos_agendamento_id  ON pagamentos (agendamento_id);
CREATE INDEX idx_pagamentos_status          ON pagamentos (status);
CREATE INDEX idx_pagamentos_data_pagamento  ON pagamentos (data_pagamento);
CREATE INDEX idx_pagamentos_metodo          ON pagamentos (metodo_pagamento);

-- ============================================================
-- VIEWS para a Dashboard
-- ============================================================

-- Faturamento mensal
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT
  DATE_TRUNC('month', data_pagamento) AS mes,
  SUM(valor)                           AS total,
  COUNT(*)                             AS total_pagamentos
FROM pagamentos
WHERE status = 'pago'
GROUP BY mes
ORDER BY mes DESC;

-- Ticket médio por mês
CREATE OR REPLACE VIEW vw_ticket_medio AS
SELECT
  DATE_TRUNC('month', inicio) AS mes,
  AVG(valor_cobrado)           AS ticket_medio,
  COUNT(*)                     AS total_atendimentos
FROM agendamentos
WHERE status = 'concluido'
GROUP BY mes
ORDER BY mes DESC;

-- Agendamentos de hoje
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

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE procedimentos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos     ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados têm acesso total (ajuste conforme necessário)
CREATE POLICY "autenticados_procedimentos"  ON procedimentos  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "autenticados_pacientes"      ON pacientes      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "autenticados_agendamentos"   ON agendamentos   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "autenticados_pagamentos"     ON pagamentos     FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Acesso de service_role (n8n usará esta role)
CREATE POLICY "service_procedimentos"  ON procedimentos  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_pacientes"      ON pacientes      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_agendamentos"   ON agendamentos   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_pagamentos"     ON pagamentos     FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- DADOS INICIAIS: procedimentos de exemplo
-- ============================================================
INSERT INTO procedimentos (nome, descricao, categoria, valor, duracao_minutos) VALUES
  ('Limpeza Facial Profunda',  'Remoção de impurezas, cravos e células mortas',       'Estética Facial',  180.00,  60),
  ('Toxina Botulínica',        'Suavização de linhas de expressão',                   'Injetáveis',      1200.00,  30),
  ('Peeling Químico',          'Renovação celular para manchas e acne',               'Renovação',        350.00,  45),
  ('Preenchimento Labial',     'Volume labial com ácido hialurônico',                 'Harmonização',    1500.00,  40),
  ('Massagem Relaxante',       'Massagem corporal de relaxamento profundo',           'Corporal',         200.00,  60),
  ('Drenagem Linfática Facial','Redução de inchaço e melhora da circulação facial',  'Estética Facial',  280.00,  40),
  ('Bioestimulador',           'Estimulação de colágeno para rejuvenescimento',       'Injetáveis',       900.00,  50),
  ('Avaliação Inicial',        'Consulta de avaliação e planejamento de tratamento',  'Consulta',         200.00,  30);

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================