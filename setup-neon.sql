-- ========================================
-- VILA BELE - Setup Banco de Dados
-- ========================================
-- Copie TODO este arquivo e cole no Neon SQL Editor
-- https://console.neon.tech -> SQL Editor
-- ========================================

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INSERIR USUÁRIO ADMIN
-- ========================================
-- Email: admin@vila-bele.com
-- Senha: senha123
-- ========================================

INSERT INTO users (email, password, full_name, role)
VALUES (
  'admin@vila-bele.com',
  '$2b$10$.8Rgnd2SqGD2PKYBsj9DC.aoFfbboJEe7poFj3bfLcw/84/PMNsYu',
  'Administrador',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- VERIFICAR DADOS INSERIDOS
-- ========================================

SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM users
ORDER BY created_at DESC;
