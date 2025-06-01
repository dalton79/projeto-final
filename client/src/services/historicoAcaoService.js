// Este arquivo contém funções para comunicação com a API de histórico geral das ações
// Implementa os serviços para o UC-006: Consultar Histórico Geral das Ações

// Importando axios para fazer requisições HTTP
import axios from "axios";

// URL base da API
const API_URL = "http://localhost:5000/api/historico-acoes";

// Objeto que vai conter as funções do serviço de histórico de ações
const servicoHistoricoAcoes = {
  // Função para buscar todos os registros de ações com filtros opcionais
  buscarHistoricoAcoes: async (filtros = {}) => {
    try {
      // Monta os parâmetros da URL com os filtros
      const parametros = new URLSearchParams();

      // Adiciona cada filtro se foi fornecido
      if (filtros.data_inicio)
        parametros.append("data_inicio", filtros.data_inicio);
      if (filtros.data_fim) parametros.append("data_fim", filtros.data_fim);
      if (filtros.incorporadora_id)
        parametros.append("incorporadora_id", filtros.incorporadora_id);
      if (filtros.empreendimento_id)
        parametros.append("empreendimento_id", filtros.empreendimento_id);
      if (filtros.imobiliaria_id)
        parametros.append("imobiliaria_id", filtros.imobiliaria_id);
      if (filtros.corretor_id)
        parametros.append("corretor_id", filtros.corretor_id);
      if (filtros.acao_id) parametros.append("acao_id", filtros.acao_id);

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
          mensagem:
            resposta.data.mensagem || "Erro ao buscar histórico de ações",
        };
      }
    } catch (erro) {
      console.error("Erro ao buscar histórico de ações:", erro);

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

  // Função para buscar um registro de ação específico pelo ID
  buscarHistoricoAcaoPorId: async (id) => {
    try {
      // Faz a requisição GET para buscar o registro de ação
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
      console.error("Erro ao buscar registro de ação:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao buscar registro de ação.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para atualizar um registro de ação existente
  atualizarHistoricoAcao: async (id, dadosRegistro) => {
    try {
      // Faz a requisição PUT para atualizar o registro de ação
      const resposta = await axios.put(`${API_URL}/${id}`, dadosRegistro);

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
      console.error("Erro ao atualizar registro de ação:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao atualizar registro de ação.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para excluir um registro de ação
  excluirHistoricoAcao: async (id) => {
    try {
      // Faz a requisição DELETE para excluir o registro de ação
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
      console.error("Erro ao excluir registro de ação:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao excluir registro de ação.";

      return {
        sucesso: false,
        mensagem: mensagemErro,
      };
    }
  },

  // Função para obter dados para os filtros
  obterDadosFiltros: async () => {
    try {
      // Faz a requisição GET para obter os dados dos filtros
      const resposta = await axios.get(`${API_URL}/dados-filtros`);

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
      console.error("Erro ao obter dados para filtros:", erro);

      const mensagemErro =
        erro.response && erro.response.data.mensagem
          ? erro.response.data.mensagem
          : "Erro ao obter dados para filtros.";

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

  // Função auxiliar para formatar o valor monetário (VGV) no formato brasileiro (R$ 1.234,56)
  formatarVGV: (valor) => {
    if (valor === undefined || valor === null) return "R$ 0,00";

    try {
      // Converte para número caso seja string
      const numero = typeof valor === "string" ? parseFloat(valor) : valor;

      // Formata como moeda brasileira
      return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    } catch (erro) {
      console.error("Erro ao formatar VGV:", erro);
      return `R$ ${valor}`;
    }
  },
};

export default servicoHistoricoAcoes;
