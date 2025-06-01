// Este arquivo contém funções para comunicação com a API de ações

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "https://sistema-consultoria.onrender.com/api/acoes";

// Objeto que vai conter as funções do serviço de ações
const servicoAcoes = {
  // Função para buscar todas as ações com filtros opcionais
  buscarAcoes: async (filtros = {}) => {
    try {
      // Monta os parâmetros da URL com os filtros
      const parametros = new URLSearchParams();

      // Adiciona cada filtro se foi fornecido
      if (filtros.nome) parametros.append("nome", filtros.nome);
      if (filtros.ativa !== undefined && filtros.ativa !== "") {
        parametros.append("ativa", filtros.ativa);
      }

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
          mensagem: "Erro ao buscar ações",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar ações:", erro);

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

  // Função para buscar uma ação específica pelo ID
  buscarAcaoPorId: async (id) => {
    try {
      // Faz a requisição GET para buscar a ação
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
      console.error("Erro ao buscar ação:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao buscar ação.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para criar uma nova ação
  criarAcao: async (dadosAcao) => {
    try {
      // Faz a requisição POST para criar a ação
      const resposta = await axios.post(API_URL, dadosAcao);

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
      console.error("Erro ao criar ação:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao criar ação.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para atualizar uma ação existente
  atualizarAcao: async (id, dadosAcao) => {
    try {
      // Faz a requisição PUT para atualizar a ação
      const resposta = await axios.put(`${API_URL}/${id}`, dadosAcao);

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
      console.error("Erro ao atualizar ação:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao atualizar ação.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para excluir uma ação
  excluirAcao: async (id) => {
    try {
      // Faz a requisição DELETE para excluir a ação
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
      console.error("Erro ao excluir ação:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao excluir ação.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },
};

export default servicoAcoes;
