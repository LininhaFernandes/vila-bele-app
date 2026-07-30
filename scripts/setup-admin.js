const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupAdmin() {
  try {
    console.log('Setupando usuário admin...');

    // Hash da senha "senha123"
    const hashedPassword = await bcrypt.hash('senha123', 10);

    // Criar tabela se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabela criada/verificada');

    // Inserir admin se não existir
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING *',
      ['admin@vila-bele.com', hashedPassword, 'Administrador', 'admin']
    );

    if (result.rows.length > 0) {
      console.log('✓ Usuário admin criado com sucesso!');
      console.log('Email: admin@vila-bele.com');
      console.log('Senha: senha123');
      console.log('ID:', result.rows[0].id);
    } else {
      console.log('✓ Usuário admin já existe');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

setupAdmin();
