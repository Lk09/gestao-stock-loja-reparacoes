require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Boa prática para evitar erros de ligação no futuro

const app = express();

// --- MIDDLEWARES (Configurações) ---
app.use(cors());
app.use(express.json()); // <--- ISTO É VITAL para o app.post funcionar!

// --- LIGAÇÃO À BASE DE DADOS ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- ROTAS (Endereços da API) ---

// ---CRUD DE STOCK---

// 1. Rota para VER o stock
app.get('/stock', async (req, res) => {
  try {
    const resBD = await pool.query('SELECT * FROM pecas');
    res.json(resBD.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao ler a base de dados");
  }
});

// 2. Rota para ADICIONAR uma nova peça
app.post('/stock', async (req, res) => {
  const { nome, quantidade, preco_venda } = req.body; 
  try {
    const novaPeca = await pool.query(
      'INSERT INTO pecas (nome, quantidade, preco_venda) VALUES ($1, $2, $3) RETURNING *',
      [nome, quantidade, preco_venda]
    );
    res.json(novaPeca.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao inserir na base de dados");
  }
});

// 3. Rota para atualizar dados de uma peça
app.put('/stock/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, quantidade, preco_venda } = req.body;
  try {
    const query = 'UPDATE pecas SET nome = $1, quantidade = $2, preco_venda = $3 WHERE id = $4 RETURNING *';
    const values = [nome, quantidade, preco_venda, id];
    const resultado = await pool.query(query, values);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Peça não encontrada" });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar peça");
  }
});

// 4. Rota para remover uma peça do stock
app.delete('/stock/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM pecas WHERE id = $1', [id]);
    
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: "Peça não encontrada" });
    }

    res.json({ mensagem: "Peça removida com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao eliminar peça");
  }
});

// ---CRUD DE CLIENTES---

// 1. Rota para VER todos os clientes
app.get('/clientes', async (req, res) => {
  try {
    const resBD = await pool.query('SELECT * FROM clientes');
    res.json(resBD.rows);
  } catch (err) {
    res.status(500).send("Erro ao ler clientes");
  }
});

// 2. Rota para ADICIONAR um cliente
app.post('/clientes', async (req, res) => {
  const { nome, telemovel, nif, email } = req.body;
  try {
    const novoCliente = await pool.query(
      'INSERT INTO clientes (nome, telemovel, nif, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, telemovel, nif, email]
    );
    res.json(novoCliente.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao registar cliente (Verifica se o NIF já existe)");
  }
});

// 3. Rota para ATUALIZAR dados de um cliente
app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, telemovel, nif, email } = req.body;
  
  try {
    const query = `
      UPDATE clientes 
      SET nome = $1, telemovel = $2, nif = $3, email = $4 
      WHERE id = $5 
      RETURNING *`;
    
    const valores = [nome, telemovel, nif, email, id];
    const resultado = await pool.query(query, valores);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar cliente (Pode ser NIF duplicado)");
  }
});

// 4. Rota para APAGAR um cliente
app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    res.json({ mensagem: "Cliente removido!" });
  } catch (err) {
    res.status(500).send("Erro ao remover cliente");
  }
});

// --- CRUD DE REPARAÇÕES ---

// 1. Rota Criar uma nova reparação
app.post('/reparacoes', async (req, res) => {
  const { equipamento, descricao_avaria, cliente_id, peca_id } = req.body;
  try {
    const novaReparacao = await pool.query(
      `INSERT INTO reparacoes (equipamento, descricao_avaria, cliente_id, peca_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [equipamento, descricao_avaria, cliente_id, peca_id]
    );
    res.json(novaReparacao.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao registar reparação. Verifica se os IDs existem.");
  }
});

// 2. Rota para Ver todas as reparações (Com o nome do cliente e da peça)
app.get('/reparacoes', async (req, res) => {
  try {
    const query = `
      SELECT r.*, c.nome AS nome_cliente, p.nome AS nome_peca 
      FROM reparacoes r
      JOIN clientes c ON r.cliente_id = c.id
      JOIN pecas p ON r.peca_id = p.id
    `;
    const resBD = await pool.query(query);
    res.json(resBD.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao ler reparações");
  }
});

// 3. Rota para ATUALIZAR uma reparação (Status, Preço, etc.)
app.put('/reparacoes/:id', async (req, res) => {
  const { id } = req.params;
  const { status, descricao_avaria, equipamento } = req.body;
  try {
    const query = `
      UPDATE reparacoes 
      SET status = $1, descricao_avaria = $2, equipamento = $3 
      WHERE id = $4 
      RETURNING *`;
    const valores = [status, descricao_avaria, equipamento, id];
    const resultado = await pool.query(query, valores);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Reparação não encontrada" });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar reparação");
  }
});

// 4. Rota para ELIMINAR uma reparação
app.delete('/reparacoes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM reparacoes WHERE id = $1', [id]);
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: "Reparação não encontrada" });
    }
    res.json({ mensagem: "Reparação eliminada com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao eliminar reparação");
  }
});
// --- ARRANCAR O SERVIDOR ---
// Esta parte fica sempre no fim do ficheiro
app.listen(3000, () => {
  console.log("-----------------------------------------");
  console.log("API a correr em http://localhost:3000");
  console.log("-----------------------------------------");
});