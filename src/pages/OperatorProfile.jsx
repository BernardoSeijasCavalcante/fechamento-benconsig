import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react'; // Certifique-se de ter lucide-react instalado
import TooltipInfo from '../components/TooltipInfo';
import '../styles/OperatorProfile.css'

const OperatorProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { operator } = location.state || {};

  if (!operator) return <div className="container">Operador não encontrado.</div>;

  const StatusBadge = ({ isFired }) => (
    <span style={{ 
      backgroundColor: isFired ? 'rgba(255, 77, 79, 0.2)' : 'rgba(0, 185, 107, 0.2)', 
      color: isFired ? 'var(--danger)' : 'var(--success)',
      padding: '5px 10px', borderRadius: '4px', border: `1px solid ${isFired ? 'var(--danger)' : 'var(--success)'}`,
      fontWeight: 'bold', fontSize: '0.8rem'
    }}>
      {isFired ? 'DESLIGADO' : 'ATIVO'}
    </span>
  );

  return (
    <div className="container">
      {/* Botão Voltar */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '20px', fontSize: '1rem' }}
      >
        <ArrowLeft size={20} style={{marginRight: '5px'}} /> Voltar
      </button>

      <div className="card">
        {/* --- CABEÇALHO DO PERFIL --- */}
        <div className="flex-row" style={{ alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', borderBottom: '1px solid #333', paddingBottom: '30px' }}>
          {/* Foto */}
          <div style={{ position: 'relative' }}>
             <img 
                src={`/fotos/${operator.nome}.jpeg`} 
                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/user_placeholder.png'; }}
                alt={operator.nome} 
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold)' }}
              />
          </div>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{operator.nome}</h1>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', color: '#aaa', flexWrap: 'wrap' }}>
                <span>Equipe: <b style={{color: '#fff'}}>{operator.supervisor}</b></span>
                <span>•</span>
                <span>Período: <b style={{color: '#fff'}}>{operator.periodo === "MANH�" ? "MANHÃ" : operator.periodo}</b></span>
                <span>•</span>
                <StatusBadge isFired={operator.despedido} />
            </div>
            {/* Destaque para Data de Admissão */}
            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)' }}>
                <Calendar size={18} />
                <span style={{ fontSize: '1rem' }}>Admissão: <b>{operator.dataAdmissao}</b></span>
            </div>
          </div>
        </div>

        {/* --- GRID DE VENDAS --- */}
        <h3 className="text-gold" style={{marginBottom: '20px'}}>Performance de Vendas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
           <div className="stat-box" style={{ background: '#151921', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <span className="label" style={{color: '#888'}}>Ranking Geral</span>
              <div className="value" style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#fff'}}>{operator.posRanking}º</div>
           </div>
           <div className="stat-box" style={{ background: '#151921', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <span className="label" style={{color: '#888'}}>Portabilidade</span>
              <div className="value" style={{fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--gold)'}}>
                  R$ {operator.vendaPortabilidade.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
           </div>
           <div className="stat-box" style={{ background: '#151921', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <span className="label" style={{color: '#888'}}>Atingimento</span>
              <div className="value" style={{fontSize: '1.8rem', fontWeight: 'bold', color: operator.atingimento >= 1 ? '#00b96b' : '#fff'}}>
                  {(operator.atingimento * 100).toFixed(1)}%
              </div>
           </div>

          <div className="stat-box" style={{ background: '#151921', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <span className="label" style={{color: '#888'}}>Margem/Cartão</span>
              <div className="value" style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#fff'}}>
                 R$ {operator.margemValor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
           </div>

           <div className="stat-box" style={{ background: '#151921', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <span className="label" style={{color: '#888'}}>Quant. Margem/Cartão</span>
              <div className="value" style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#fff'}}>
                 {operator.margemQtd} <span style={{fontSize: '1rem', fontWeight: 'normal'}}>un.</span>
              </div>
           </div>
        </div>

        <div className="flex-row" style={{ flexWrap: 'wrap', gap: '20px' }}>
            
            {/* --- BLOCO RECEPTIVO --- */}
            <div style={{ flex: 2, background: '#1c2029', padding: '25px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 className="text-gold" style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Clock size={20} /> Desempenho Operacional
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    <div>
                        <span style={{color: '#888', fontSize: '0.9rem'}}>Leads Atendidos - URA</span>
                        <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>{operator.recLeads}</div>
                    </div>
                    <div>
                        <span style={{color: '#888', fontSize: '0.9rem'}}>TMA <TooltipInfo text="Tempo Médio de Atendimento" /></span>
                        <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>{operator.recTMA}</div>
                    </div>
                    <div>
                        <span style={{color: '#888', fontSize: '0.9rem'}}>TTP <TooltipInfo text="Tempo Total em Pausa" /></span>
                        {/* Se houver dias, o tamanho da fonte ajusta um pouco se necessário, mas o layout fluido deve segurar */}
                        <div style={{fontSize: '1.4rem', fontWeight: 'bold', wordBreak: 'break-word'}}>{operator.recTMP}</div>
                    </div>
                    <div>
                        <span style={{color: '#888', fontSize: '0.9rem'}}>TTF <TooltipInfo text="Tempo Total em Atendimento" /></span>
                        <div style={{fontSize: '1.4rem', fontWeight: 'bold', wordBreak: 'break-word'}}>{operator.recHoras}</div>
                    </div>
                </div>
            </div>

            {/* --- BLOCO ASSIDUIDADE (Novo) --- */}
            <div style={{ flex: 1, minWidth: '250px', background: '#1c2029', padding: '25px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 className="text-gold" style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <AlertCircle size={20} /> Assiduidade
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                        <span style={{color: '#888'}}>Atrasos (Mês)</span>
                        <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: operator.atrasos !== '0' && operator.atrasos !== '-' && operator.atrasos !== 'X' ? '#ff4d4f' : '#fff'}}>
                            {operator.atrasos}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{color: '#888'}}>Ausências (Mês)</span>
                        <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: operator.ausencia !== '0' && operator.ausencia !== '-' && operator.ausencia !== 'X' ? '#ff4d4f' : '#fff'}}>
                            {operator.ausencia}
                        </span>
                    </div>
                    
                    <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '6px', fontSize: '0.85rem', color: '#ccc' }}>
                        <strong style={{color: 'var(--gold)'}}>Observação:</strong> <br/>
                        Dados referentes ao fechamento da folha de Dezembro/2025.
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default OperatorProfile;