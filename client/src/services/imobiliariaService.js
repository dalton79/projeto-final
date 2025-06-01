// Este arquivo contém funções para comunicação com a API de imobiliárias

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "http://localhost:5000/api/imobiliarias";

// Objeto que vai conter as funções do serviço de imobiliárias
const servicoImobiliarias = {
  // Função para buscar todas as imobiliárias com filtros opcionais
  buscarImobiliarias: async (filtros = {}) => {
    try {
      // Monta os parâmetros da URL com os filtros
      const parametros = new URLSearchParams();

      // Adiciona cada filtro se foi fornecido
      if (filtros.nome) parametros.append("nome", filtros.nome);
      if (filtros.cidade) parametros.append("cidade", filtros.cidade);
      if (filtros.uf) parametros.append("uf", filtros.uf);

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
          mensagem: "Erro ao buscar imobiliárias",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar imobiliárias:", erro);

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

  // Função para buscar uma imobiliária específica pelo ID
  buscarImobiliariaPorId: async (id) => {
    try {
      // Faz a requisição GET para buscar a imobiliária
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
      console.error("Erro ao buscar imobiliária:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao buscar imobiliária.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para criar uma nova imobiliária
  criarImobiliaria: async (dadosImobiliaria) => {
    try {
      // Faz a requisição POST para criar a imobiliária
      const resposta = await axios.post(API_URL, dadosImobiliaria);

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
      console.error("Erro ao criar imobiliária:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao criar imobiliária.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para atualizar uma imobiliária existente
  atualizarImobiliaria: async (id, dadosImobiliaria) => {
    try {
      // Faz a requisição PUT para atualizar a imobiliária
      const resposta = await axios.put(`${API_URL}/${id}`, dadosImobiliaria);

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
      console.error("Erro ao atualizar imobiliária:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao atualizar imobiliária.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para excluir uma imobiliária
  excluirImobiliaria: async (id) => {
    try {
      // Faz a requisição DELETE para excluir a imobiliária
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
      console.error("Erro ao excluir imobiliária:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao excluir imobiliária.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },
};

export default servicoImobiliarias;
