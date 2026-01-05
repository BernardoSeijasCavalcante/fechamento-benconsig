import Papa from 'papaparse';

// Função para limpar e converter números
const parseNumber = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  
  let str = val.toString().trim();
  
  // Tratamento para "R$ -" ou "-" (zero no Excel)
  if (str === '-' || str === 'R$ -' || str.match(/^R\$\s+-\s*$/)) return 0;
  if (str === '') return 0;

  const isPercentage = str.includes('%');
  
  // Remove caracteres não numéricos, exceto vírgula, ponto e sinal de menos
  str = str.replace(/[R$\s%]/g, '');

  // Lógica BR: 1.500,00 -> remove ponto, troca vírgula por ponto
  if (str.includes(',') && (!str.includes('.') || str.indexOf('.') < str.indexOf(','))) {
      str = str.replace(/\./g, '').replace(',', '.');
  }

  const num = parseFloat(str);
  
  if (isNaN(num)) return 0;

  return isPercentage ? num / 100 : num;
};

// Função para tratar tempo preservando dias (ex: "2 00:14:22" -> "2d 00:14:22")
const parseTime = (val) => {
    if (!val || val === '0' || val === 0 || val === '-') return '00:00:00';
    let str = val.toString().trim();
    
    // Regex para capturar padrão Excel: "DIAS HORAS:MIN:SEG" (ex: "2 04:27:48")
    const durationMatch = str.match(/^(\d+)\s+(\d{2}:\d{2}:\d{2})$/);
    
    if (durationMatch) {
        const days = parseInt(durationMatch[1], 10);
        const time = durationMatch[2];
        
        // Se tiver dias (> 0), formata como "2d 04:27:48"
        // Se for 0 dias (ex: "0 16:39:54"), retorna apenas "16:39:54"
        if (days > 0) {
            return `${days}d ${time}`; 
        } else {
            return time;
        }
    }

    return str;
};

export const parseCSV = (csvText, supervisorName) => {
  return new Promise((resolve) => {
    
    // Proteção contra HTML (Erro 404)
    if (!csvText || csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
        console.error(`[ERRO CRÍTICO] Arquivo HTML detectado em vez de CSV para ${supervisorName}.`);
        resolve([]);
        return;
    }

    Papa.parse(csvText, {
      header: false,
      skipEmptyLines: 'greedy',
      delimiter: ";", // Força ponto e vírgula conforme novo padrão
      
      complete: (results) => {
        const rows = results.data;
        
        if (!rows || rows.length < 3) {
            console.warn(`[${supervisorName}] Arquivo inválido.`);
            resolve([]);
            return;
        }

        // 1. Localizar onde começam os dados
        let headerRowIndex = rows.findIndex(r => r.some(c => c && c.toString().includes('Pos. Ranking')));
        if (headerRowIndex === -1) headerRowIndex = 1; 
        const dataStartIndex = headerRowIndex + 1;

        // 2. Separar Operadores do Rodapé
        const operatorsRaw = [];
        let footerValuesRow = null;

        for (let i = dataStartIndex; i < rows.length; i++) {
            const row = rows[i];
            const firstCol = row[0] ? row[0].toString() : "";

            if (firstCol.includes("RESULTADO GERAL")) {
                if (rows[i+2]) footerValuesRow = rows[i+2];
                break; 
            }
            
            if (row[0] && row[0].trim().length > 2) {
                operatorsRaw.push(row);
            }
        }

        // 3. Processar Operadores (NOVO MAPEAMENTO)
        const operators = operatorsRaw.map((row) => {
            return {
              supervisor: supervisorName,
              nome: row[0],
              
              // Vendas
              posRanking: parseInt(row[1]) || 999,
              vendaPortabilidade: parseNumber(row[2]),
              atingimento: parseNumber(row[3]),
              margemValor: parseNumber(row[4]),
              margemQtd: parseInt(row[5]) || 0,
              vendaMedia: parseNumber(row[6]),

              // Receptivo
              recLeads: parseInt(row[7]) || 0,
              recTMA: parseTime(row[8]),
              recTMP: parseTime(row[9]),     // Agora suporta dias (ex: "2d 10:24:37")
              recHoras: parseTime(row[10]),  // Agora suporta dias

              // Min. Data (Índice 11)
              recDataMin: row[11] || "-",

              // Detalhes do Regime (Índices 12 e 13)
              periodo: row[12] ? row[12].toString().toUpperCase().trim() : 'INDEFINIDO',
              despedido: row[13] ? row[13].toString().toUpperCase().trim() === 'TRUE' : false,
              
              // Assiduidade (Índices 14, 15, 16 - NOVOS)
              atrasos: row[14] || "-",
              ausencia: row[15] || "-",
              dataAdmissao: row[16] || "-"
            };
        });

        // 4. Processar Resumo (Rodapé)
        const summary = {
            totalVendido: footerValuesRow ? parseNumber(footerValuesRow[0]) : 0,
            atingimentoMedio: footerValuesRow ? parseNumber(footerValuesRow[1]) : 0,
            margemTotal: footerValuesRow ? parseNumber(footerValuesRow[2]) : 0, // Fallback se vier no índice 2
            ticketMedio: footerValuesRow ? parseNumber(footerValuesRow[3]) : 0,
            tmaGeral: footerValuesRow ? parseTime(footerValuesRow[4]) : "00:00:00",
            posicaoRanking: footerValuesRow ? (parseInt(footerValuesRow[5]) || "-") : "-"
        };
        
        // Fallback de soma manual se o rodapé estiver zerado ou ausente
        if (!footerValuesRow || summary.totalVendido === 0) {
            summary.totalVendido = operators.reduce((acc, op) => acc + op.vendaPortabilidade, 0);
            summary.margemTotal = operators.reduce((acc, op) => acc + op.margemQtd, 0);
            summary.atingimentoMedio = operators.length ? operators.reduce((acc, op) => acc + op.atingimento, 0) / operators.length : 0;
        }

        operators.summary = summary;
        resolve(operators);
      },
      error: (err) => {
          console.error(`Erro ao ler ${supervisorName}:`, err);
          resolve([]);
      }
    });
  });
};

export const parseRankingCSV = (csvText) => {
  return new Promise((resolve) => {
    if (!csvText) { resolve([]); return; }

    Papa.parse(csvText, {
      header: false, // Vamos mapear manualmente para garantir
      skipEmptyLines: 'greedy',
      delimiter: ";", 
      
      complete: (results) => {
        const rows = results.data;
        if (!rows || rows.length < 2) { resolve([]); return; }

        // Remove o cabeçalho (Linha 0: Nome do Operador; Total Vendido...)
        const dataRows = rows.slice(1);

        const rankingData = dataRows.map((row) => {
            // Mapeamento baseado no RANKING_GERAL.CSV
            // [0] Nome, [1] Total Vendido, [2] Leads, [3] TMA, [4] TTP, [5] TTF
            if (!row[0]) return null;
            return {
                nome: row[0],
                totalVendido: parseNumber(row[1]),
                leads: parseInt(row[2]) || 0,
                tma: parseTime(row[3]),
                ttp: parseTime(row[4]),
                ttf: parseTime(row[5])
            };
        }).filter(item => item !== null);

        resolve(rankingData);
      },
      error: (err) => {
          console.error("Erro ao ler Ranking Geral:", err);
          resolve([]);
      }
    });
  });
};