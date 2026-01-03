// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', // Garante que o fundo cubra 100% da tela
      backgroundColor: 'var(--bg-color)', // Puxa do App.css
      color: 'var(--text-primary)'
    }}>
      {/* O Outlet renderiza a página atual (Home ou OperatorProfile) */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        <Outlet />
      </main>

      {/* Rodapé Fixo da Identidade Visual */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px', 
        borderTop: '1px solid #333', 
        backgroundColor: '#0e1117',
        marginTop: 'auto' // Empurra o footer para o final
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
          {/* Pode inserir a logo pequena aqui também se quiser */}
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
             BenConsig © 2009 - Tecnologia e Resultado
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;