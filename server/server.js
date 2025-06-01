// Arquivo principal do servidor backend

// Importando as bibliotecas necessárias
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importando a configuração do banco de dados
const pool = require("./config/db");

// Importando as rotas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const incorporadoraRoutes = require("./routes/incorporadoraRoutes");
const empreendimentoRoutes = require("./routes/empreendimentoRoutes");
const acaoRoutes = require("./routes/acaoRoutes");
const imobiliariaRoutes = require("./routes/imobiliariaRoutes");
const corretorRoutes = require("./routes/corretorRoutes");
const registroAcaoRoutes = require("./routes/registroAcaoRoutes");
const historicoAcaoRoutes = require("./routes/historicoAcaoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const dashboardIncorporadoraRoutes = require("./routes/dashboardIncorporadoraRoutes");
const initDbRoutes = require("./routes/initDbRoutes");

// Criando a aplicação Express
const app = express();

// Configurando middlewares
app.use(cors()); // Permite requisições do frontend
app.use(express.json()); // Permite receber dados JSON

// Configurando as rotas
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/incorporadoras", incorporadoraRoutes);
app.use("/api/empreendimentos", empreendimentoRoutes);
app.use("/api/acoes", acaoRoutes);
app.use("/api/imobiliarias", imobiliariaRoutes);
app.use("/api/corretores", corretorRoutes);
app.use("/api/registro-acoes", registroAcaoRoutes);
app.use("/api/historico-acoes", historicoAcaoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard-incorporadora", dashboardIncorporadoraRoutes); // Nova rota
app.use("/api/init-db", initDbRoutes); // Nova rota para inicialização do banco

// Rota de teste para verificar se o servidor está funcionando
app.get("/", (req, res) => {
  res.json({ message: "Servidor do Sistema de Consultoria funcionando!" });
});

// Rota de teste para verificar conexão com o banco
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Conexão com banco funcionando!",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro na conexão com banco",
      error: error.message,
    });
  }
});

// Definindo a porta do servidor
const PORT = process.env.PORT || 5000;

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log("Rotas disponíveis:");

  // Rotas de autenticação
  console.log("- POST /api/auth/login           → Autenticar usuário");

  // Rotas de usuários
  console.log(
    "- GET /api/usuarios              → Listar todos os usuários com filtros"
  );
  console.log("- GET /api/usuarios/:id          → Buscar usuário por ID");
  console.log("- POST /api/usuarios             → Criar novo usuário");
  console.log("- PUT /api/usuarios/:id          → Atualizar usuário existente");
  console.log("- DELETE /api/usuarios/:id       → Excluir usuário");

  // Rotas de incorporadoras
  console.log(
    "- GET /api/incorporadoras        → Listar todas as incorporadoras com filtros"
  );
  console.log("- GET /api/incorporadoras/:id    → Buscar incorporadora por ID");
  console.log("- POST /api/incorporadoras       → Criar nova incorporadora");
  console.log(
    "- PUT /api/incorporadoras/:id    → Atualizar incorporadora existente"
  );
  console.log("- DELETE /api/incorporadoras/:id → Excluir incorporadora");

  // Rotas de empreendimentos
  console.log(
    "- GET /api/empreendimentos       → Listar todos os empreendimentos com filtros"
  );
  console.log(
    "- GET /api/empreendimentos/:id   → Buscar empreendimento por ID"
  );
  console.log("- POST /api/empreendimentos      → Criar novo empreendimento");
  console.log(
    "- PUT /api/empreendimentos/:id   → Atualizar empreendimento existente"
  );
  console.log("- DELETE /api/empreendimentos/:id → Excluir empreendimento");

  // Rotas de ações
  console.log(
    "- GET /api/acoes                 → Listar todas as ações com filtros"
  );
  console.log("- GET /api/acoes/:id             → Buscar ação por ID");
  console.log("- POST /api/acoes                → Criar nova ação");
  console.log("- PUT /api/acoes/:id             → Atualizar ação existente");
  console.log("- DELETE /api/acoes/:id          → Excluir ação");

  // Rotas de imobiliárias
  console.log(
    "- GET /api/imobiliarias          → Listar todas as imobiliárias com filtros"
  );
  console.log("- GET /api/imobiliarias/:id      → Buscar imobiliária por ID");
  console.log("- POST /api/imobiliarias         → Criar nova imobiliária");
  console.log(
    "- PUT /api/imobiliarias/:id      → Atualizar imobiliária existente"
  );
  console.log("- DELETE /api/imobiliarias/:id   → Excluir imobiliária");

  // Rotas de corretores
  console.log(
    "- GET /api/corretores            → Listar todos os corretores com filtros"
  );
  console.log("- GET /api/corretores/:id        → Buscar corretor por ID");
  console.log("- POST /api/corretores           → Criar novo corretor");
  console.log(
    "- PUT /api/corretores/:id        → Atualizar corretor existente"
  );
  console.log("- DELETE /api/corretores/:id     → Excluir corretor");

  // Rotas de registro de ações
  console.log(
    "- GET /api/registro-acoes        → Listar todos os registros de ações com filtros"
  );
  console.log(
    "- GET /api/registro-acoes/:id    → Buscar registro de ação por ID"
  );
  console.log("- POST /api/registro-acoes       → Criar novo registro de ação");
  console.log("- PUT /api/registro-acoes/:id    → Atualizar registro de ação");
  console.log("- DELETE /api/registro-acoes/:id → Excluir registro de ação");
  console.log(
    "- GET /api/registro-acoes/dados-formulario → Obter dados para o formulário de registro"
  );

  // Rotas de histórico de ações
  console.log(
    "- GET /api/historico-acoes          → Listar todo o histórico de ações com filtros"
  );
  console.log(
    "- GET /api/historico-acoes/dados-filtros → Obter dados para os filtros"
  );
  console.log(
    "- GET /api/historico-acoes/:id      → Buscar registro de ação por ID"
  );
  console.log(
    "- PUT /api/historico-acoes/:id      → Atualizar registro de ação"
  );
  console.log("- DELETE /api/historico-acoes/:id   → Excluir registro de ação");

  // Rotas de dashboard da consultoria
  console.log(
    "- GET /api/dashboard/consultoria       → Obter ranking para o Dashboard da Consultoria"
  );
  console.log(
    "- GET /api/dashboard/consultoria/filtros → Obter dados para os filtros do Dashboard da Consultoria"
  );

  // Rotas de dashboard da incorporadora
  console.log(
    "- GET /api/dashboard-incorporadora       → Obter ranking para o Dashboard da Incorporadora"
  );
  console.log(
    "- GET /api/dashboard-incorporadora/filtros → Obter dados para os filtros do Dashboard da Incorporadora"
  );

  // Rota de inicialização do banco de dados
  console.log(
    "- GET /api/init-db/init-db       → Inicializar o banco de dados"
  );
});
