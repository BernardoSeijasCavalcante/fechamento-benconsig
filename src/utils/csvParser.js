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
    
    // Padrão do Rodapé TOTAL: "8 4 19:32:47" (Núm Núm Tempo)
    // Interpretação solicitada: 1º Núm = Dias (d), 2º Núm = Meses (m)
    const totalMatch = str.match(/^(\d+)\s+(\d+)\s+(\d{2}:\d{2}:\d{2})$/);
    if (totalMatch) {
         return `${totalMatch[1]}d ${totalMatch[2]}m ${totalMatch[3]}`;
    }

    // Padrão Excel Duração: "3 08:35:00" (Dias Tempo)
    const durationMatch = str.match(/^(\d+)\s+(\d{2}:\d{2}:\d{2})$/);
    if (durationMatch) {
        const days = parseInt(durationMatch[1], 10);
        const time = durationMatch[2];
        // Se tiver dias, mostra "3d ...", senão só o tempo
        if (days > 0) return `${days}d ${time}`; 
        else return time;
    }
    
    // Padrão simples "hh:mm:ss" ou texto puro
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
        const createSummaryObj = (baseIndex) => {
            if (!footerValuesRow) return {};
            return {
                totalVendido: parseNumber(footerValuesRow[baseIndex]),
                atingimento: parseNumber(footerValuesRow[baseIndex + 1]),
                margemQtd: parseInt(footerValuesRow[baseIndex + 2]) || 0,
                ticketMedio: parseNumber(footerValuesRow[baseIndex + 3]),
                tma: parseTime(footerValuesRow[baseIndex + 4]),
                // Campos extras que variam (Ranking só tem no Geral, mas mantemos estrutura similar)
                turnOver: (baseIndex === 0) ? (footerValuesRow[baseIndex + 6] || "-") : (footerValuesRow[baseIndex + 5] || "-"),
                demissoes: (baseIndex === 0) ? parseInt(footerValuesRow[baseIndex + 7]) || 0 : parseInt(footerValuesRow[baseIndex + 6]) || 0,
                admissoes: (baseIndex === 0) ? parseInt(footerValuesRow[baseIndex + 8]) || 0 : parseInt(footerValuesRow[baseIndex + 7]) || 0,
                margemVendido: (baseIndex === 0) ? parseNumber(footerValuesRow[baseIndex + 9] || 0.0) : parseNumber(footerValuesRow[baseIndex + 8] || 0.0),
                rankingPos: `${parseInt(footerValuesRow[5])}º`,
            };
        };

        const summary = {
            geral: createSummaryObj(0),    // Colunas 0 a 9
            manha: createSummaryObj(10),   // Colunas 10 a 18
            tarde: createSummaryObj(19)    // Colunas 19 a 27
        };
        
        // Fallback simples se não tiver rodapé
        if (!footerValuesRow) {
            const total = operators.reduce((acc, op) => acc + op.vendaPortabilidade, 0);
            summary.geral = { totalVendido: total, atingimento: 0, margemQtd: 0 };
            summary.manha = { totalVendido: 0 };
            summary.tarde = { totalVendido: 0 };
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
      header: false,
      skipEmptyLines: 'greedy',
      delimiter: ";", 
      
      complete: (results) => {
        const rows = results.data;
        if (!rows || rows.length < 2) { resolve([]); return; }

        // Remove o cabeçalho (Linha 0: Pos.; Nome do Operador...)
        const dataRows = rows.slice(1);

        const rankingData = dataRows.map((row) => {
            // Verifica se é a linha de TOTAL (Geralmente Pos é vazio e Nome é TOTAL)
            const isTotalRow = (row[1] && row[1].toString().toUpperCase() === 'TOTAL');

            if (!row[1] && !isTotalRow) return null;

            return {
                isTotal: isTotalRow, // Flag para destacar no front-end
                pos: isTotalRow ? "" : (parseInt(row[0]) || "-"),
                nome: row[1],
                totalVendido: parseNumber(row[2]),
                atingimento: parseNumber(row[3]),
                leads: parseInt(row[4]) || 0,
                tma: parseTime(row[5]), // No Total pode vir formato diferente, mantemos string
                ttp: parseTime(row[6]),
                ttf: parseTime(row[7]),
                
                // Dados Extras para o Modal
                periodo: row[8] || "-",
                despedido: row[9] ? row[9].toString().toUpperCase().trim() === 'TRUE' : false,
                atrasos: row[10] || "-",
                ausencia: row[11] || "-",
                dataAdmissao: row[12] || "-"
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