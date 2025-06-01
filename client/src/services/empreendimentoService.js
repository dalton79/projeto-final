// Este arquivo contém funções para comunicação com a API de empreendimentos

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "https://sistema-consultoria.onrender.com/api/empreendimentos";

// Objeto que vai conter as funções do serviço de empreendimentos
const servicoEmpreendimentos = {
  // Função para buscar todos os empreendimentos com filtros opcionais
  buscarEmpreendimentos: async (filtros = {}) => {
    try {
      // Monta os parâmetros da URL com os filtros
      const parametros = new URLSearchParams();

      // Adiciona cada filtro se foi fornecido
      if (filtros.nome) parametros.append("nome", filtros.nome);
      if (filtros.cidade) parametros.append("cidade", filtros.cidade);
      if (filtros.uf) parametros.append("uf", filtros.uf);
      if (filtros.incorporadora_id)
        parametros.append("incorporadora_id", filtros.incorporadora_id);

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
          mensagem: "Erro ao buscar empreendimentos",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar empreendimentos:", erro);

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

  // Função para buscar um empreendimento específico pelo ID
  buscarEmpreendimentoPorId: async (id) => {
    try {
      // Faz a requisição GET para buscar o empreendimento
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
      console.error("Erro ao buscar empreendimento:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao buscar empreendimento.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para criar um novo empreendimento
  criarEmpreendimento: async (dadosEmpreendimento) => {
    try {
      // Faz a requisição POST para criar o empreendimento
      const resposta = await axios.post(API_URL, dadosEmpreendimento);

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
      console.error("Erro ao criar empreendimento:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao criar empreendimento.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para atualizar um empreendimento existente
  atualizarEmpreendimento: async (id, dadosEmpreendimento) => {
    try {
      // Faz a requisição PUT para atualizar o empreendimento
      const resposta = await axios.put(`${API_URL}/${id}`, dadosEmpreendimento);

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
      console.error("Erro ao atualizar empreendimento:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao atualizar empreendimento.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para excluir um empreendimento
  excluirEmpreendimento: async (id) => {
    try {
      // Faz a requisição DELETE para excluir o empreendimento
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
      console.error("Erro ao excluir empreendimento:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao excluir empreendimento.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para buscar todas as incorporadoras (para uso nos formulários)
  buscarIncorporadoras: async () => {
    try {
      // Faz a requisição GET para buscar incorporadoras
      const resposta = await axios.get(
        "http://localhost:5000/api/incorporadoras"
      );

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
        };
      } else {
        return {
          sucesso: false,
          mensagem: "Erro ao buscar incorporadoras",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar incorporadoras:", erro);

      return {
        sucesso: false,
        mensagem: "Erro ao buscar incorporadoras. Tente novamente.",
      };
    }
  },
};

export default servicoEmpreendimentos;
