// Este arquivo contém as funções relacionadas à autenticação de usuários

// Importando a conexão com o banco de dados
const pool = require("../config/db");

// Objeto que vai conter as funções do controller
const authController = {
  // Função para realizar o login do usuário
  login: async (req, res) => {
    try {
      // Obtém email e senha enviados pelo cliente
      const { email, senha } = req.body;

      // Verifica se email e senha foram fornecidos
      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Email e senha são obrigatórios",
        });
      }

      // Consulta o banco para encontrar o usuário com o email fornecido
      const resultado = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
      );

      // Verifica se encontrou algum usuário
      if (resultado.rows.length === 0) {
        return res.status(401).json({
          sucesso: false,
          mensagem: "Email ou senha incorretos",
        });
      }

      // Obtém o usuário encontrado
      const usuario = resultado.rows[0];

      // Verifica se a senha está correta

      if (usuario.senha !== senha) {
        return res.status(401).json({
          sucesso: false,
          mensagem: "Email ou senha incorretos",
        });
      }

      // Verifica se o usuário está ativo
      if (!usuario.ativo) {
        return res.status(401).json({
          sucesso: false,
          mensagem: "Usuário inativo no sistema",
        });
      }

      // Se chegou até aqui, o login foi bem-sucedido
      // Preparando os dados do usuário para retornar (sem a senha)
      const dadosUsuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        incorporadora_id: usuario.incorporadora_id,
      };

      // Retorna sucesso com os dados do usuário
      return res.status(200).json({
        sucesso: true,
        mensagem: "Login realizado com sucesso",
        usuario: dadosUsuario,
      });
    } catch (erro) {
      console.error("Erro no login:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao realizar login",
      });
    }
  },
};

module.exports = authController;
