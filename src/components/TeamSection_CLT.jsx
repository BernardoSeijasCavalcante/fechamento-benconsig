import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useNavigate } from 'react-router-dom';
import TooltipInfo from './TooltipInfo';

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

const fmtMoney = (val) => `R$ ${(val || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
const fmtPct = (val) => `${((val || 0) * 100).toFixed(1)}%`;

const TeamSection = ({ supervisor, data, hideFired, rankingData }) => {
  const navigate = useNavigate();

  const activeData = hideFired 
      ? data.filter(d => !d.despedido) 
      : data;

  const resumo = data.summary || {};

  let kpiData = resumo["geral"] || {};
  
  // Separação por períodos para os gráficos
  // Filtramos apenas quem tem valor > 0 ou não é nulo para limpar o gráfico visualmente, se desejar
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
           {renderChart(integral, "INTEGRAL")}
        </div>
        
      </div>

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