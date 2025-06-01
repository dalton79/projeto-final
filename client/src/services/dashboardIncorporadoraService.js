// Este arquivo contém funções para comunicação com a API de dashboard da incorporadora
// Implementa os serviços para UC-013: Dashboard da Incorporadora

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "http://localhost:5000/api/dashboard-incorporadora";

// Objeto que vai conter as funções do serviço de dashboard da incorporadora
const servicoDashboardIncorporadora = {
  // Função para buscar dados do ranking de imobiliárias para o Dashboard da Incorporadora

  buscarRankingIncorporadora: async (incorporadora_id, filtros = {}) => {
    try {
      // Verifica se o ID da incorporadora foi fornecido
      if (!incorporadora_id) {
        return {
          sucesso: false,
          mensagem: "ID da incorporadora é obrigatório",
        };
      }

      // Monta os parâmetros da URL com os filtros
      const parametros = new URLSearchParams();

      // Adiciona o ID da incorporadora (obrigatório)
      parametros.append("incorporadora_id", incorporadora_id);

      // Adiciona os demais filtros se foram fornecidos
      if (filtros.data_inicio)
        parametros.append("data_inicio", filtros.data_inicio);
      if (filtros.data_fim) parametros.append("data_fim", filtros.data_fim);
      if (filtros.empreendimento_id)
        parametros.append("empreendimento_id", filtros.empreendimento_id);

      // Faz a requisição GET para a API
      const resposta = await axios.get(`${API_URL}?${parametros.toString()}`);

      // Verifica se a resposta tem status de sucesso
      if (resposta.data.sucesso) {
        return {
          sucesso: true,
          dados: resposta.data.dados,
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.data.mensagem || "Erro ao buscar dados do ranking",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar dados do ranking da incorporadora:", erro);

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

  // Função para buscar os dados dos filtros disponíveis para o Dashboard da Incorporadora
  // Retorna a lista de empreendimentos da incorporadora
  buscarDadosFiltrosIncorporadora: async (incorporadora_id) => {
    try {
      // Verifica se o ID da incorporadora foi fornecido
      if (!incorporadora_id) {
        return {
          sucesso: false,
          mensagem: "ID da incorporadora é obrigatório",
        };
      }

      // Faz a requisição GET para a API
      const resposta = await axios.get(
        `${API_URL}/filtros?incorporadora_id=${incorporadora_id}`
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
          mensagem:
            resposta.data.mensagem || "Erro ao buscar dados dos filtros",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar dados dos filtros da incorporadora:", erro);

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

  // Função auxiliar para formatar a data no formato brasileiro (DD/MM/AAAA)
  formatarData: (data) => {
    if (!data) return "";

    // Se a data já for um objeto Date, converte para string ISO
    const dataString = data instanceof Date ? data.toISOString() : data;

    // Tenta converter para o formato brasileiro
    try {
      // Verifica se a data está no formato ISO (AAAA-MM-DDTHH:mm:ss.sssZ)
      if (dataString.includes("T")) {
        const dataObj = new Date(dataString);
        return dataObj.toLocaleDateString("pt-BR");
      }

      // Se for apenas a data (AAAA-MM-DD)
      const partes = dataString.split("-");
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }

      // Se não conseguir formatar, retorna a string original
      return dataString;
    } catch (erro) {
      console.error("Erro ao formatar data:", erro);
      return dataString;
    }
  },

  // Função auxiliar para converter a data do formato brasileiro (DD/MM/AAAA) para o formato ISO (AAAA-MM-DD)
  converterDataParaISO: (dataString) => {
    if (!dataString) return "";

    try {
      // Verifica se a data está no formato brasileiro (DD/MM/AAAA)
      if (dataString.includes("/")) {
        const partes = dataString.split("/");
        if (partes.length === 3) {
          return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
      }

      // Se não conseguir converter, retorna a string original
      return dataString;
    } catch (erro) {
      console.error("Erro ao converter data:", erro);
      return dataString;
    }
  },
};

export default servicoDashboardIncorporadora;
