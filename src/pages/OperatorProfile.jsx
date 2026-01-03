import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TooltipInfo from '../components/TooltipInfo';

const OperatorProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { operator } = location.state || {};

  if (!operator) return <div className="container">Operador não encontrado.</div>;

  const StatusBadge = ({ isFired }) => (
    <span style={{ 
      backgroundColor: isFired ? 'rgba(255, 77, 79, 0.2)' : 'rgba(0, 185, 107, 0.2)', 
      color: isFired ? 'var(--danger)' : 'var(--success)',
      padding: '5px 10px', borderRadius: '4px', border: `1px solid ${isFired ? 'var(--danger)' : 'var(--success)'}`
    }}>
      {isFired ? 'DESLIGADO' : 'ATIVO'}
    </span>
  );

  return (
    <div className="container">
      <button 
        onClick={() => navigate('/')} 
        style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '20px' }}
      >
        <ArrowLeft size={20} /> Voltar ao Ranking
      </button>

      <div className="card">
        <div className="flex-row" style={{ alignItems: 'center', marginBottom: '40px' }}>
          {/* Foto Operador [cite: 28] */}
          <img 
            src={`/assets/fotos/${operator.nome}.jpeg`} 
            onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=Foto+Indisponivel'}
            alt={operator.nome} 
            style={{ width: '150px', height: '150px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--gold)' }}
          />
          <div>
            <h1 style={{ margin: 0 }}>{operator.nome}</h1>
            <p style={{ color: '#aaa' }}>Equipe: {operator.supervisor} | Período: {operator.periodo}</p>
            <StatusBadge isFired={operator.despedido} />
          </div>
        </div>

        {/* Grid de Dados de Vendas [cite: 41] */}
        <h3 className="text-gold">Performance de Vendas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
           <div className="stat-box">
              <span className="label">Ranking Geral <TooltipInfo text="Posição global na empresa" /></span>
              <div className="value">{operator.posRanking}º</div>
           </div>
           <div className="stat-box">
              <span className="label">Portabilidade <TooltipInfo text="Total vendido em R$" /></span>
              <div className="value">R$ {operator.vendaPortabilidade.toLocaleString('pt-BR')}</div>
           </div>
           <div className="stat-box">
              <span className="label">Atingimento <TooltipInfo text="% da meta batida" /></span>
              <div className="value">{(operator.atingimento * 100).toFixed(2)}%</div>
           </div>
           <div className="stat-box">
              <span className="label">Margem/Cartão <TooltipInfo text="Valor em R$ Margem" /></span>
              <div className="value">R$ {operator.margemValor.toLocaleString('pt-BR')}</div>
           </div>
        </div>

        {/* Detalhes de Atendimento (Discadora) [cite: 48, 56] */}
        <h3 className="text-gold">Métricas de Discadora</h3>
        <div className="flex-row" style={{ flexWrap: 'wrap' }}>
            
            {/* Receptivo */}
            <div style={{ flex: 1, background: '#151921', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{textAlign: 'center', color: '#888'}}>RECEPTIVO (URA)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>Leads: <b className="text-gold">{operator.recLeads}</b></div>
                    <div>TMA <TooltipInfo text="Tempo Médio Atendimento" />: <b>{operator.recTMA}</b></div>
                    <div>TMP <TooltipInfo text="Tempo Médio Pós" />: <b>{operator.recTMP}</b></div>
                    <div>Falado: <b>{operator.recHoras}</b></div>
                </div>
            </div>

            {/* Ativo */}
            <div style={{ flex: 1, background: '#151921', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{textAlign: 'center', color: '#888'}}>ATIVO</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>Leads: <b className="text-gold">{operator.ativLeads}</b></div>
                    <div>TMA <TooltipInfo text="Tempo Médio Atendimento" />: <b>{operator.ativTMA}</b></div>
                    <div>TMP <TooltipInfo text="Tempo Médio Pós" />: <b>{operator.ativTMP}</b></div>
                    <div>Falado: <b>{operator.ativHoras}</b></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorProfile;