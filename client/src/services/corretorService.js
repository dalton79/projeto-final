// Este arquivo contém funções para comunicação com a API de corretores

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "https://sistema-consultoria.onrender.com/api/corretores";

// Objeto que vai conter as funções do serviço de corretores
const servicoCorretores = {
  // Função para buscar todos os corretores com filtros opcionais
  buscarCorretores: async (filtros = {}) => {
    try {
      // Monta os parâmetros da URL com os filtros
      const parametros = new URLSearchParams();

      // Adiciona cada filtro se foi fornecido
      if (filtros.nome) parametros.append("nome", filtros.nome);
      if (filtros.sobrenome) parametros.append("sobrenome", filtros.sobrenome);

      // Monta a URL completa com os parâmetros
      const urlCompleta = parametros.toString()
        ? `${API_URL}?${parametros.toString()}`
        : API_URL;

      // Faz a requisição GET para a API
      const resposta = await axios.get(urlCompleta);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
          total: resposta.data.total,
        };
      } else {
        return {
          sucesso: false,
          mensagem: "Erro ao buscar corretores",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar corretores:", erro);

      // Verifica se tem uma mensagem de erro específica na resposta
      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao conectar com o servidor. Tente novamente.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para buscar um corretor específico pelo ID
  buscarCorretorPorId: async (id) => {
    try {
      // Faz a requisição GET para buscar o corretor
      const resposta = await axios.get(`${API_URL}/${id}`);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar corretor:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao buscar corretor.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para criar um novo corretor
  criarCorretor: async (dadosCorretor) => {
    try {
      // Faz a requisição POST para criar o corretor
      const resposta = await axios.post(API_URL, dadosCorretor);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
          mensagem: resposta.data.mensagem,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      console.error("Erro ao criar corretor:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao criar corretor.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para atualizar um corretor existente
  atualizarCorretor: async (id, dadosCorretor) => {
    try {
      // Faz a requisição PUT para atualizar o corretor
      const resposta = await axios.put(`${API_URL}/${id}`, dadosCorretor);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
          mensagem: resposta.data.mensagem,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      console.error("Erro ao atualizar corretor:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao atualizar corretor.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para excluir um corretor
  excluirCorretor: async (id) => {
    try {
      // Faz a requisição DELETE para excluir o corretor
      const resposta = await axios.delete(`${API_URL}/${id}`);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
          mensagem: resposta.data.mensagem,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem,
        };
      }
    } catch (erro) {
      console.error("Erro ao excluir corretor:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao excluir corretor.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },
};

export default servicoCorretores;
