import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeamSection from './components/TeamSection';
import TeamSection_CLT from './components/TeamSection_CLT';
import OperatorProfile from './pages/OperatorProfile';
import { parseCSV } from './utils/csvParser';
import './styles/App.css';
import Layout from './components/Layout';
import Meme from './assets/meme.png';
import Logo from './assets/logo.png';
import { TEAM_FILES } from './data';

const Home = ({ allData }) => {
  return (
    <div className="container">
      {/* Cabeçalho e Intro [cite: 6, 7] */}
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <img src={Logo} alt="BC Logo" style={{ height: '300px', marginBottom: '20px' }} />
        <h1>Relatório de Fechamento <span className="text-gold">Dezembro 2026</span></h1>
        
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{fontStyle: 'italic'}}>"O futuro pertence àqueles que acreditam na beleza de seus sonhos."</h3>
            <p>
                Estamos encerrando 2026 com chave de ouro. A BenConsig espera um futuro grandioso para todos os seus vendedores.
            </p>
        </div>
      </header>

      {/* Seções das Equipes */}
      {Object.keys(allData).map(supervisor => (
        supervisor === "KAWANY" ? (
          <TeamSection_CLT 
            key={supervisor} 
            supervisor={supervisor} 
            data={allData[supervisor]} 
          />
        ) : (
          <TeamSection 
            key={supervisor} 
            supervisor={supervisor} 
            data={allData[supervisor]} 
          />
        )
      ))}

      {/* Seção do Meme [cite: 8, 9] */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
         <div style={{ maxWidth: '500px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                "Esse será um GRAAAAAANDE ANO, REPLETO DE GRAAAANDES CONQUISTAS!"
            </p>
            <img 
                src={Meme}
                alt="Meme WhatsApp" 
                style={{ width: '70%', borderRadius: '10px', border: '2px solid var(--gold)' }} 
            />
         </div>
      </div>

    </div>
  );
};

function App() {
  const [dataByTeam, setDataByTeam] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      const teamsData = {};
      
      for (const item of TEAM_FILES) {
        try {
          const parsed = await parseCSV(item.content, item.supervisor);
          teamsData[item.supervisor] = parsed;
          
        } catch (error) {
          console.error("Erro ao processar " + item.supervisor, error);
        }
      }
      
      setDataByTeam(teamsData);
      setLoading(false);
    };

    loadAllData();
  }, []);

  if (loading) return <div className="container">Carregando dados tecnológicos...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Envolvemos tudo na rota do Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home allData={dataByTeam} />} />
          <Route path="/operator/:name" element={<OperatorProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;