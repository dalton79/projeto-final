// Este arquivo contém funções para comunicação com a API de incorporadoras

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "https://sistema-consultoria.onrender.com/api/incorporadoras";

// Objeto que vai conter as funções do serviço de incorporadoras
const servicoIncorporadoras = {
  // Função para buscar todas as incorporadoras com filtros opcionais
  buscarIncorporadoras: async (filtros = {}) => {
    try {
      // Monta os parâmetros da URL com os filtros
      const parametros = new URLSearchParams();

      // Adiciona cada filtro se foi fornecido
      if (filtros.razaoSocial)
        parametros.append("razaoSocial", filtros.razaoSocial);
      if (filtros.cnpj) parametros.append("cnpj", filtros.cnpj);
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
          mensagem: "Erro ao buscar incorporadoras",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar incorporadoras:", erro);

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

  // Função para buscar uma incorporadora específica pelo ID
  buscarIncorporadoraPorId: async (id) => {
    try {
      // Faz a requisição GET para buscar a incorporadora
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
      console.error("Erro ao buscar incorporadora:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao buscar incorporadora.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para criar uma nova incorporadora
  criarIncorporadora: async (dadosIncorporadora) => {
    try {
      // Faz a requisição POST para criar a incorporadora
      const resposta = await axios.post(API_URL, dadosIncorporadora);

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
      console.error("Erro ao criar incorporadora:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao criar incorporadora.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para atualizar uma incorporadora existente
  atualizarIncorporadora: async (id, dadosIncorporadora) => {
    try {
      // Faz a requisição PUT para atualizar a incorporadora
      const resposta = await axios.put(`${API_URL}/${id}`, dadosIncorporadora);

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
      console.error("Erro ao atualizar incorporadora:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao atualizar incorporadora.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para excluir uma incorporadora
  excluirIncorporadora: async (id) => {
    try {
      // Faz a requisição DELETE para excluir a incorporadora
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
      console.error("Erro ao excluir incorporadora:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao excluir incorporadora.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },
};

export default servicoIncorporadoras;
