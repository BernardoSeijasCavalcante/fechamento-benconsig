import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useNavigate } from 'react-router-dom';
import TooltipInfo from './TooltipInfo';
import { User, Calendar, AlertCircle, Clock, X } from 'lucide-react';

// Componente customizado para tornar o nome clicável
const CustomYAxisTick = ({ x, y, payload, data, onClick }) => {
  const operator = data.find(d => d.nome === payload.value);
  
  // Função para encurtar nomes gigantes se necessário
  const truncateText = (text, maxLength) => {
      if (text.length > maxLength) {
          return text.substring(0, maxLength) + '...';
      }
      return text;
  };

  // Ajuste o 35 abaixo se ainda estiver vazando (número de caracteres)
  const displayName = truncateText(payload.value, 19); 

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-10} // Um pouco mais de espaço entre o nome e a barra
        y={4}
        textAnchor="end"
        fill="white"
        fontSize={12} // Reduzi levemente a fonte para caber mais texto
        fontWeight={500}
        cursor="pointer"
        onClick={() => operator && onClick(operator)}
        onMouseEnter={(e) => e.target.style.fill = '#D4AF37'}
        onMouseLeave={(e) => e.target.style.fill = 'white'}
      >
        {displayName}
      </text>
    </g>
  );
};

const RankingModal = ({ operator, onClose }) => {
    if (!operator) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <div className="card" style={{ 
                width: '500px', maxWidth: '95%', padding: '30px', 
                position: 'relative', border: '2px solid var(--gold)',
                background: '#151921'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '15px', right: '15px', 
                    background: 'none', border: 'none', color: '#fff', cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                {/* Cabeçalho do Modal */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'inline-block', position: 'relative', marginBottom: '15px' }}>
                        <img 
                            src={`/fotos/${operator.nome}.jpeg`} 
                            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/user_placeholder.png'; }}
                            alt={operator.nome} 
                            style={{ 
                                width: '100px', height: '100px', borderRadius: '50%', 
                                objectFit: 'cover', border: '3px solid var(--gold)' 
                            }} 
                        />
                    </div>
                    <h2 style={{ color: operator.despedido ? '#ff4d4f' : '#fff', fontSize: '1.4rem', margin: '0 0 5px 0' }}>
                        {operator.nome}
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', color: '#aaa' }}>
                        <span>{operator.periodo}</span>
                        <span>•</span>
                        <span style={{ color: operator.despedido ? '#ff4d4f' : '#00b96b', fontWeight: 'bold' }}>
                            {operator.despedido ? 'DESLIGADO' : 'ATIVO'}
                        </span>
                    </div>
                </div>

                {/* Grid de Informações */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <ModalInfoItem icon={<User size={16} />} label="Posição" value={`${operator.pos}º Lugar`} />
                    <ModalInfoItem icon={<Calendar size={16} />} label="Admissão" value={operator.dataAdmissao} />
                    
                    <div style={{ gridColumn: 'span 2', height: '1px', background: '#333', margin: '5px 0' }}></div>
                    
                    <ModalInfoItem label="Total Vendido" value={`R$ ${operator.totalVendido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} color="var(--gold)" bold />
                    <ModalInfoItem label="Atingimento" value={`${(operator.atingimento * 100).toFixed(1)}%`} />
                    
                    <ModalInfoItem icon={<Clock size={16} />} label="TMA" value={operator.tma} />
                    <ModalInfoItem icon={<Clock size={16} />} label="Leads" value={operator.leads} />
                    
                    <ModalInfoItem label="TTP (Pausa)" value={operator.ttp} size="0.85rem" />
                    <ModalInfoItem label="TTF (Falado)" value={operator.ttf} size="0.85rem" />

                    <div style={{ gridColumn: 'span 2', height: '1px', background: '#333', margin: '5px 0' }}></div>

                    <ModalInfoItem icon={<AlertCircle size={16} />} label="Atrasos" value={operator.atrasos} color={operator.atrasos !== '0' && operator.atrasos !== '-' ? '#ff4d4f' : '#fff'} />
                    <ModalInfoItem icon={<AlertCircle size={16} />} label="Ausências" value={operator.ausencia} color={operator.ausencia !== '0' && operator.ausencia !== '-' ? '#ff4d4f' : '#fff'} />
                </div>
            </div>
        </div>
    );
};

const ModalInfoItem = ({ icon, label, value, color = '#fff', bold = false, size = '1rem' }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#888', fontSize: '0.8rem', marginBottom: '2px' }}>
            {icon} {label}
        </div>
        <div style={{ color: color, fontWeight: bold ? 'bold' : 'normal', fontSize: size }}>
            {value}
        </div>
    </div>
);

const TeamSection = ({ supervisor, data, hideFired, rankingData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');
  const [selectedRankingOp, setSelectedRankingOp] = useState(null);

  const activeData = hideFired 
      ? data.filter(d => !d.despedido) 
      : data;

  const resumo = data.summary || {};

  const fmtMoney = (val) => `R$ ${(val || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  const fmtPct = (val) => `${((val || 0) * 100).toFixed(1)}%`;

  let kpiData = resumo[activeTab] || {};

  // Separação por períodos para os gráficos
  // Filtramos apenas quem tem valor > 0 ou não é nulo para limpar o gráfico visualmente, se desejar
  const manha = activeData
    .filter(d => (d.periodo === 'MANH�' || d.periodo === 'MANHÃ'))
    .sort((a,b) => b.vendaPortabilidade - a.vendaPortabilidade);
      
  const tarde = activeData
    .filter(d => d.periodo === 'TARDE')
    .sort((a,b) => b.vendaPortabilidade - a.vendaPortabilidade);

  const integral = activeData
    .filter(d => d.periodo === 'INTEGRAL')
    .sort((a,b) => b.vendaPortabilidade - a.vendaPortabilidade);

  const handleBarClick = (entry) => {
    navigate(`/operator/${entry.nome}`, { state: { operator: entry } });
  };

  // --- COMPONENTE DE GRÁFICO REUTILIZÁVEL ---
  const renderChart = (chartData, title) => {
    // Altura dinâmica: 80px por operador
    const dynamicHeight = Math.max(chartData.length * 80, 300);

    return (
      <div style={{ flex: 1, minHeight: '300px' }}>
        <h4 style={{textAlign: 'center', color: '#fff', marginBottom: '10px'}}>{title}</h4>
        
        {chartData.length === 0 ? (
          <div style={{textAlign: 'center', color: '#666', padding: '50px'}}>Sem dados para este período.</div>
        ) : (
          <ResponsiveContainer width="99%" height={dynamicHeight}>
            <BarChart 
                layout="vertical" 
                data={chartData} 
                margin={{ left: 0, right: 60, top: 0, bottom: 0 }}
                barCategoryGap={15}
            >
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                
                {/* --- MUDANÇA AQUI: Usando o CustomYAxisTick --- */}
                <YAxis 
                    type="category" 
                    dataKey="nome" 
                    width={180} 
                    interval={0}
                    // Passamos o componente customizado na propriedade 'tick'
                    // Ele recebe os dados e a função de clique
                    tick={<CustomYAxisTick data={chartData} onClick={handleBarClick} />}
                />
                {/* ---------------------------------------------- */}

                <Tooltip 
                    cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Venda']}
                    contentStyle={{backgroundColor: '#1c2029', borderColor: '#D4AF37', color: '#fff', borderRadius: '8px'}}
                />
                <Bar 
                    dataKey="vendaPortabilidade" 
                    onClick={handleBarClick} 
                    cursor="pointer" 
                    barSize={50}
                    radius={[0, 4, 4, 0]} 
                >
                    {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.despedido ? '#ff4d4f' : '#D4AF37'} 
                        /> 
                    ))}
                    <LabelList 
                        dataKey="vendaPortabilidade" 
                        position="right" 
                        fill="white" 
                        style={{fontSize: '13px', fontWeight: 'bold'}}
                        formatter={(val) => `R$ ${val.toLocaleString('pt-BR', {style:'decimal', maximumFractionDigits:0})}`}
                    />
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '40px', borderTop: '4px solid var(--gold)' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--gold)' }}>EQUIPE {supervisor} {hideFired && <span style={{fontSize: '0.6em', color: '#888', marginLeft: '10px'}}>(Apresentação - Time de Vendas)</span>}</h2>
          {kpiData.rankingPos && <span style={{ backgroundColor: '#D4AF37', color: '#000', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Ranking: {kpiData.rankingPos}</span>}
      </div>
      <div className="flex-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '50px' }}>
        
        {/* KPI Esquerda (Com Abas) */}
        <div style={{ flex: '0 0 280px', background: '#151921', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
           <div style={{ position: 'relative', display: 'inline-block', marginBottom: '15px' }}>
              <img 
                    src={`/fotos/${supervisor}.jpeg`} 
                    alt={supervisor} 
                    style={{ borderRadius: '50%', width: '130px', height: '130px', border: '3px solid var(--gold)', objectFit: 'cover' }} 
                />
           </div>
           <h3 style={{ color: '#fff', margin: '0 0 15px 0' }}>{supervisor}</h3>
           
           {/* ABAS DE SELEÇÃO */}
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', borderBottom: '1px solid #333' }}>
               {['geral', 'manha', 'tarde'].map(tab => (
                   <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    style={{
                        background: 'none', border: 'none', 
                        color: activeTab === tab ? 'var(--gold)' : '#666',
                        fontWeight: activeTab === tab ? 'bold' : 'normal',
                        borderBottom: activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
                        padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem'
                    }}
                   >
                       {tab === 'geral' ? 'Geral' : tab === 'manha' ? 'Manhã' : 'Tarde'}
                   </button>
               ))}
           </div>

           {/* LISTA DE KPI */}
           <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <KPIRow label="Total Vendido" value={fmtMoney(kpiData.totalVendido)} color="var(--gold)" bold />
             <KPIRow label="Atingimento" value={fmtPct(kpiData.atingimento)} />
             <KPIRow label="Total Vendido (Margem)" value={fmtMoney(kpiData.margemVendido)} />
             <KPIRow label="Margem (Qtd)" value={kpiData.margemQtd} />
             
             {!hideFired && (
                 <>
                    <div style={{borderTop: '1px solid #333', margin: '5px 0'}}></div>
                    <KPIRow label="Ticket Médio" value={fmtMoney(kpiData.ticketMedio)} size="0.85rem" />
                    <KPIRow label="TMA" value={kpiData.tma} size="0.85rem" />
                    <KPIRow label="TurnOver" value={kpiData.turnOver} size="0.85rem" />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{color:'#888', fontSize:'0.8rem'}}>Adm / Dem:</span>
                        <span style={{color:'#fff', fontSize:'0.8rem'}}>
                            <span style={{color:'#00b96b'}}>{kpiData.admissoes}</span> / <span style={{color:'#ff4d4f'}}>{kpiData.demissoes}</span>
                        </span>
                    </div>
                 </>
             )}
           </div>
        </div>

        {/* === ÁREA DIREITA: GRÁFICOS === */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px', minWidth: '800px' }}>
           {renderChart(manha, "MANHÃ")}
           <div style={{borderTop: '1px dashed #333'}}></div>
           {renderChart(tarde, "TARDE")}
           <div style={{borderTop: '1px dashed #333'}}></div>
           {(!hideFired) && (renderChart(integral, "INTEGRAL"))}
        </div>
        
      </div>

      {/* === RANKING GERAL (VISÃO DIRETOR) === */}
        {!hideFired && rankingData && rankingData.length > 0 && (
        <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid var(--gold)' }}>
            <h3 style={{color: 'var(--gold)', textAlign: 'center', marginBottom: '20px'}}>🏆 RANKING GERAL DA EMPRESA</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: '#151921', color: 'var(--gold)', textAlign: 'left' }}>
                            <th style={{padding: '10px'}}>Pos</th>
                            <th style={{padding: '10px'}}>Operador</th>
                            <th style={{padding: '10px'}}>Total Vendido</th>
                            <th style={{padding: '10px'}}>Ating.</th>
                            <th style={{padding: '10px'}}>Leads</th>
                            <th style={{padding: '10px'}}>TMA</th>
                            <th style={{padding: '10px'}}>TTP</th>
                            <th style={{padding: '10px'}}>TTF</th>
                            <th style={{padding: '10px'}}>Atrasos</th>
                            <th style={{padding: '10px'}}>Aus.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankingData.map((row, index) => {
                            const isTotal = row.isTotal;
                            const isFired = row.despedido;
                            const rowStyle = isTotal 
                                ? { background: 'var(--gold)', color: '#000', fontWeight: 'bold', borderTop: '2px solid #fff' }
                                : { borderBottom: '1px solid #333', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)' };

                            return (
                                <tr 
                                    key={index} 
                                    style={rowStyle}
                                    onClick={() => !isTotal && setSelectedRankingOp(row)} // Abre modal ao clicar (se não for total)
                                >
                                    <td style={{padding: '10px'}}>{row.pos}</td>
                                    <td style={{
                                        padding: '10px', 
                                        color: isTotal ? '#000' : (isFired ? '#ff4d4f' : '#fff'), 
                                        cursor: !isTotal ? 'pointer' : 'default',
                                        textDecoration: 'none'
                                    }}>
                                        {row.nome}
                                    </td>
                                    <td style={{padding: '10px', fontWeight: 'bold'}}>R$ {row.totalVendido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                    <td style={{padding: '10px'}}>{(row.atingimento * 100).toFixed(0)}%</td>
                                    <td style={{padding: '10px'}}>{row.leads}</td>
                                    <td style={{padding: '10px'}}>{row.tma}</td>
                                    <td style={{padding: '10px'}}>{row.ttp}</td>
                                    <td style={{padding: '10px'}}>{row.ttf}</td>
                                    <td style={{padding: '10px'}}>{row.atrasos}</td>
                                    <td style={{padding: '10px'}}>{row.ausencia}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {selectedRankingOp && (
          <RankingModal operator={selectedRankingOp} onClose={() => setSelectedRankingOp(null)} />
      )}
    </div>
  );
};

const KPIRow = ({ label, value, color = '#fff', bold = false, size = '0.9rem' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{color: '#888', fontSize: size}}>{label}</span>
        <span style={{color: color, fontWeight: bold ? 'bold' : 'normal', fontSize: size}}>{value}</span>
    </div>
);

export default TeamSection;