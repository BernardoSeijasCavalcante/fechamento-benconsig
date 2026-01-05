import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useNavigate } from 'react-router-dom';
import TooltipInfo from './TooltipInfo';

const TeamSection = ({ supervisor, data, hideFired, rankingData }) => {
  const navigate = useNavigate();

  const activeData = hideFired 
      ? data.filter(d => !d.despedido) 
      : data;

  const resumo = data.summary || {};
  
  const totalVendido = resumo.totalVendido || data.reduce((acc, curr) => acc + curr.vendaPortabilidade, 0);
  
  // O atingimento no rodapé geralmente vem decimal (ex: 0.075), multiplicamos por 100.
  const mediaAtingimento = resumo.atingimentoMedio 
      ? (resumo.atingimentoMedio * 100) 
      : (data.length > 0 ? (data.reduce((acc, curr) => acc + curr.atingimento, 0) / data.length) * 100 : 0);
      
  const totalMargem = resumo.margemTotal || data.reduce((acc, curr) => acc + curr.margemQtd, 0);
  
  const ticketMedio = resumo.ticketMedio || '0.0'

  const tmaMedio = resumo.tmaGeral || '00:00:00?'

  // Ranking da equipe (se disponível no rodapé)
  const rankingEquipe = resumo.posicaoRanking ? `${resumo.posicaoRanking}º` : "-";

  // Separação por períodos para os gráficos
  // Filtramos apenas quem tem valor > 0 ou não é nulo para limpar o gráfico visualmente, se desejar
  const manha = activeData
    .filter(d => (d.periodo === 'MANH�' || d.periodo === 'MANHÃ'))
    .sort((a,b) => b.vendaPortabilidade - a.vendaPortabilidade);
      
  const tarde = activeData
    .filter(d => d.periodo === 'TARDE')
    .sort((a,b) => b.vendaPortabilidade - a.vendaPortabilidade);

  const handleBarClick = (entry) => {
    navigate(`/operator/${entry.nome}`, { state: { operator: entry } });
  };

  // --- COMPONENTE DE GRÁFICO REUTILIZÁVEL ---
  const renderChart = (chartData, title) => (
    <div style={{ flex: 1, minHeight: '300px' }}>
      <h4 style={{textAlign: 'center', color: '#fff', marginBottom: '10px'}}>{title}</h4>
      
      {chartData.length === 0 ? (
        <div style={{textAlign: 'center', color: '#666', marginTop: '50px'}}>Sem dados para este período.</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 50, 300)}>
            {/* Altura dinâmica baseada no nº de operadores para não espremer as barras */}
          <BarChart layout="vertical" data={chartData} margin={{ left: 10, right: 50, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
                type="category" 
                dataKey="nome" 
                width={150} 
                tick={{fill: 'white', fontSize: 11}} 
                interval={0}
            />
            <Tooltip 
              cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
              formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Venda']}
              contentStyle={{backgroundColor: '#1c2029', borderColor: '#D4AF37', color: '#fff'}}
              itemStyle={{color: '#D4AF37'}}
            />
            <Bar dataKey="vendaPortabilidade" onClick={handleBarClick} cursor="pointer" barSize={30}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  // Vermelho se despedido, Dourado padrão
                  fill={entry.despedido ? '#ff4d4f' : '#D4AF37'} 
                /> 
              ))}
              <LabelList 
                dataKey="vendaPortabilidade" 
                position="right" 
                formatter={(val) => `R$ ${val.toLocaleString('pt-BR', {style:'decimal', maximumFractionDigits:0})}`}
                fill="white"
                style={{fontSize: '11px', fontWeight: 'bold'}}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <div className="card" style={{ marginBottom: '40px', borderTop: '4px solid var(--gold)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--gold)' }}>EQUIPE {supervisor}</h2>
          {rankingEquipe !== "-" && (
              <span style={{ backgroundColor: '#D4AF37', color: '#000', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                  Ranking: {rankingEquipe}
              </span>
          )}
      </div>
      
      <div className="flex-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px' }}>
        
        {/* === CARD ESQUERDA: SUPERVISOR & KPI === */}
        <div style={{ flex: '0 0 280px', background: '#151921', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
           {/* Foto Supervisor */}
           <div style={{ position: 'relative', display: 'inline-block', marginBottom: '15px' }}>
                <img 
                    src={`/fotos/${supervisor}.jpeg`}
                    alt={supervisor}
                    style={{ borderRadius: '50%', width: '130px', height: '130px', border: '3px solid var(--gold)', objectFit: 'cover' }} 
                />
           </div>
           
           <h3 style={{ color: '#fff', margin: '0 0 20px 0' }}>{supervisor}</h3>
          
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                <span style={{color: '#888', fontSize: '0.9rem'}}>Total Vendido <TooltipInfo text="Total vendido no período"/></span>
                <div style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                    R$ {(totalVendido + totalMargem).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
            </div>

            <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                <span style={{color: '#888', fontSize: '0.9rem'}}>Atingimento Médio <TooltipInfo text="% Média da meta da equipe" /></span>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 'bold' }}>
                    {mediaAtingimento.toFixed(1)}%
                </div>
            </div>

            <div>
                <span style={{color: '#888', fontSize: '0.9rem'}}>Margem/Cartão <TooltipInfo text="Quantidade Total vendida em Margem/Cartão" /></span>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 'bold' }}>
                    R$ {totalMargem.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
            </div>
            
            <div>
                <span style={{color: '#888', fontSize: '0.9rem'}}>Ticket Médio <TooltipInfo text="Total vendido por operador" /></span>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 'bold' }}>
                    R$ {ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
            </div>

            <div>
                <span style={{color: '#888', fontSize: '0.9rem'}}>TMA <TooltipInfo text="Tempo médio em que cada operador da equipe permanece em atendimento" /></span>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 'bold' }}>
                    {tmaMedio}
                </div>
            </div>

          </div>
        </div>

        {/* === ÁREA DIREITA: GRÁFICOS === */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px', minWidth: '800px' }}>
           {renderChart(manha, "MANHÃ")}
           <div style={{borderTop: '1px dashed #333'}}></div>
           {renderChart(tarde, "TARDE")}
        </div>
        
      </div>

      {/* === RANKING GERAL (VISÃO DIRETOR) === */}
      {!hideFired && rankingData && rankingData.length > 0 && (
        <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid var(--gold)' }}>
            <h3 style={{color: 'var(--gold)', textAlign: 'center', marginBottom: '20px'}}>🏆 RANKING GERAL DA EMPRESA</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#151921', color: 'var(--gold)', textAlign: 'left' }}>
                            <th style={{padding: '12px'}}>Pos</th>
                            <th style={{padding: '12px'}}>Operador</th>
                            <th style={{padding: '12px'}}>Total Vendido</th>
                            <th style={{padding: '12px'}}>Leads</th>
                            <th style={{padding: '12px'}}>TMA</th>
                            <th style={{padding: '12px'}}>TTP (Pausa)</th>
                            <th style={{padding: '12px'}}>TTF (Falado)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankingData.map((row, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #333', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)' }}>
                                <td style={{padding: '12px', fontWeight: 'bold'}}>{index + 1}º</td>
                                <td style={{padding: '12px'}}>{row.nome}</td>
                                <td style={{padding: '12px', color: 'var(--gold)', fontWeight: 'bold'}}>R$ {row.totalVendido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                <td style={{padding: '12px'}}>{row.leads}</td>
                                <td style={{padding: '12px'}}>{row.tma}</td>
                                <td style={{padding: '12px'}}>{row.ttp}</td>
                                <td style={{padding: '12px'}}>{row.ttf}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default TeamSection;