import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useParams, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import TeamSection from './components/TeamSection';
import TeamSection_CLT from './components/TeamSection_CLT';
import OperatorProfile from './pages/OperatorProfile';
import { parseCSV, parseRankingCSV } from './utils/csvParser';
import { TEAM_FILES, RANKING_CONTENT } from './data';
import Logo from './assets/logo.png';
import './App.css'
import './styles/App.css';

// --- COMPONENTE HOME (Menu de Seleção) ---
const Home = ({ allData }) => {
  const navigate = useNavigate();
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  const handleSelectMode = (mode) => {
    if (selectedSupervisor) {
      // Navega para a rota da equipe passando o modo (director/collaborator) no state
      navigate(`/team/${selectedSupervisor}`, { state: { mode } });
      setSelectedSupervisor(null);
    }
  };

  return (
    <div className="container" style={{textAlign: 'center', paddingTop: '50px'}}>
      <img src={Logo} alt="BC Logo" style={{ height: '150px', marginBottom: '20px' }} />
      <h1 style={{marginBottom: '40px'}}>Selecione a <span className="text-gold">Equipe</span></h1>

      {/* Grid de Botões */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {Object.keys(allData).map(sup => (
          <button 
            key={sup}
            onClick={() => setSelectedSupervisor(sup)}
            className="card"
            style={{ 
              cursor: 'pointer', 
              padding: '30px', 
              fontSize: '1.2rem', 
              fontWeight: 'bold',
              color: '#fff',
              border: '2px solid var(--gold)',
              background: 'linear-gradient(145deg, #1c2029, #151921)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {sup}
          </button>
        ))}
      </div>

      {/* Modal de Seleção (Aparece quando clica no supervisor) */}
      {selectedSupervisor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px', padding: '40px', textAlign: 'center', border: '2px solid var(--gold)' }}>
            <h2 style={{color: 'var(--gold)', marginBottom: '30px'}}>{selectedSupervisor}</h2>
            <p style={{marginBottom: '30px', color: '#aaa'}}>Selecione o modo de visualização:</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <button 
                onClick={() => handleSelectMode('collaborator')}
                style={{ padding: '15px', background: '#0074D9', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
              >
                👤 Visão Colaborador
              </button>
              
              <button 
                onClick={() => handleSelectMode('director')}
                style={{ padding: '15px', background: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
              >
                🕶️ Visão Diretor
              </button>
            </div>
            
            <button 
              onClick={() => setSelectedSupervisor(null)}
              style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TeamPage = ({ allData, rankingData }) => { 
  const { supervisor } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const mode = location.state?.mode || 'collaborator';
  const data = allData[supervisor];

  if (!data) return <div className="container">Equipe não encontrada.</div>;

  return (
    <div className="container">
      <button 
        onClick={() => navigate('/')} 
        style={{ marginTop: '20px', background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '1rem' }}
      >
        ← Voltar ao Menu
      </button>

      {supervisor === "KAWANY" ? (
        <TeamSection_CLT 
           supervisor={supervisor} 
           data={data} 
           hideFired={mode === 'collaborator'} 
        />
      ) : (
        <TeamSection 
           supervisor={supervisor} 
           data={data} 
           hideFired={mode === 'collaborator'} 
           rankingData={supervisor === 'DIEGO' ? rankingData : null} 
        />
      )}
    </div>
  );
};

// --- APP PRINCIPAL ---
function App() {
  const [dataByTeam, setDataByTeam] = useState({});
  const [rankingData, setRankingData] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      const teamsData = {};
      
      // Carrega Equipes
      for (const item of TEAM_FILES) {
        try {
          const parsed = await parseCSV(item.content, item.supervisor);
          teamsData[item.supervisor] = parsed;
        } catch (error) { console.error("Erro " + item.supervisor, error); }
      }

      // Carrega Ranking Geral
      try {
          const parsedRanking = await parseRankingCSV(RANKING_CONTENT);
          setRankingData(parsedRanking);
      } catch (err) { console.error("Erro Ranking", err); }
      
      setDataByTeam(teamsData);
      setLoading(false);
    };
    loadAllData();
  }, []);

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home allData={dataByTeam} />} />
          <Route path="/team/:supervisor" element={<TeamPage allData={dataByTeam} rankingData={rankingData} />} />
          <Route path="/operator/:name" element={<OperatorProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;