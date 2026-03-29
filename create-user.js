const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma/dev.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
    process.exit(1);
  }
  console.log('Conectado ao banco SQLite');
});

async function createUser() {
  const email = 'admin@corpusacademia.com.br';
  const password = 'corpus2025';
  const name = 'Administrador';

  const hashed = await bcrypt.hash(password, 10);

  db.serialize(() => {
    // Criar usuário
    db.run(
      `INSERT INTO "User" (id, email, password, name, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'user-' + Date.now(),
        email,
        hashed,
        name,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
      function(err) {
        if (err) {
          console.error('Erro ao criar usuário:', err.message);
          db.close();
          return;
        }
        console.log('✅ Usuário criado com sucesso!');
        console.log('   E-mail: admin@corpusacademia.com.br');
        console.log('   Senha: corpus2025');
        db.close();
      }
    );
  });
}

createUser();
