// Componente principal da aplicação que configura as rotas

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PaginaLogin from "./pages/PaginaLogin";
import PortalConsultoria from "./pages/PortalConsultoria";
import PortalIncorporadora from "./pages/PortalIncorporadora";
import servicoAutenticacao from "./services/authService";
import "./App.css";

// Componente de rota protegida que verifica se o usuário está logado
function RotaProtegida({ children, perfisPermitidos }) {
  // Verifica se o usuário está logado
  const estaLogado = servicoAutenticacao.estaLogado();

  if (!estaLogado) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  // Se estiver logado, verifica se o perfil é permitido (se especificado)
  if (perfisPermitidos) {
    const usuarioLogado = servicoAutenticacao.obterUsuarioLogado();
    const temPerfilPermitido = perfisPermitidos.includes(usuarioLogado.perfil);

    if (!temPerfilPermitido) {
      // Se o perfil não for permitido, redireciona para a página inicial apropriada
      if (
        usuarioLogado.perfil === "Administrador" ||
        usuarioLogado.perfil === "Gestor Consultoria"
      ) {
        return <Navigate to="/consultoria" />;
      } else {
        return <Navigate to="/incorporadora" />;
      }
    }
  }

  // Se passou pelas verificações, renderiza o conteúdo protegido
  return children;
}

// Componente de redirecionamento baseado no perfil do usuário
function RedirecionamentoInicial() {
  // Verifica se o usuário está logado
  const estaLogado = servicoAutenticacao.estaLogado();

  if (!estaLogado) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  // Se estiver logado, redireciona com base no perfil
  const usuarioLogado = servicoAutenticacao.obterUsuarioLogado();

  if (
    usuarioLogado.perfil === "Administrador" ||
    usuarioLogado.perfil === "Gestor Consultoria"
  ) {
    return <Navigate to="/consultoria" />;
  } else {
    return <Navigate to="/incorporadora" />;
  }
}

// Componente principal da aplicação
function App() {
  return (
    <Router>
      <Routes>
        {/* Rota inicial - redireciona com base no perfil */}
        <Route path="/" element={<RedirecionamentoInicial />} />

        {/* Rota de login - acessível para todos */}
        <Route path="/login" element={<PaginaLogin />} />

        {/* Rota do Portal da Consultoria - protegida para Administrador e Gestor Consultoria */}
        <Route
          path="/consultoria/*"
          element={
            <RotaProtegida
              perfisPermitidos={["Administrador", "Gestor Consultoria"]}
            >
              <PortalConsultoria />
            </RotaProtegida>
          }
        />

        {/* Rota do Portal da Incorporadora - protegida para Colaborador Incorporadora */}
        <Route
          path="/incorporadora/*"
          element={
            <RotaProtegida perfisPermitidos={["Colaborador Incorporadora"]}>
              <PortalIncorporadora />
            </RotaProtegida>
          }
        />

        {/* Rota para qualquer outro caminho - redireciona para a página inicial */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
