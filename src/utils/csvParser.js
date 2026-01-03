import Papa from 'papaparse';

// Função para limpar e converter números
const parseNumber = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  
  let str = val.toString().trim();
  
  // Tratamento específico do Excel para zero: "R$ -" ou apenas "-"
  if (str === '-' || str === 'R$ -' || str.match(/^R\$\s+-\s*$/)) return 0;
  if (str === '') return 0;

  // Detecta se é porcentagem (ex: "3%")
  const isPercentage = str.includes('%');
  
  // Remove caracteres não numéricos, exceto vírgula e ponto e sinal de menos
  // Removemos R%, espaços e o símbolo %
  str = str.replace(/[R$\s%]/g, '');

  // Lógica BR: 1.500,00 -> remove ponto, troca vírgula por ponto
  if (str.includes(',') && (!str.includes('.') || str.indexOf('.') < str.indexOf(','))) {
      str = str.replace(/\./g, '').replace(',', '.');
  }

  const num = parseFloat(str);
  
  if (isNaN(num)) return 0;

  // Se era porcentagem (ex: 3), retornamos 0.03 para manter consistência com cálculos matemáticos
  return isPercentage ? num / 100 : num;
};

// Função para tratar tempo
const parseTime = (val) => {
    if (!val || val === '0' || val === 0 || val === '-') return '00:00:00';
    return val.toString().trim();
};

export const parseCSV = (csvText, supervisorName) => {
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: false,
      skipEmptyLines: 'greedy',
      delimiter: ";", // <--- FORÇADO: Ponto e vírgula (Padrão do seu arquivo)
      
      complete: (results) => {
        const rows = results.data;
        
        if (!rows || rows.length < 3) {
            console.warn(`[${supervisorName}] Arquivo inválido.`);
            resolve([]);
            return;
        }

        // 1. Localizar onde começam os dados (linha "Pos. Ranking")
        let headerRowIndex = rows.findIndex(r => r.some(c => c && c.toString().includes('Pos. Ranking')));
        if (headerRowIndex === -1) headerRowIndex = 1; 
        const dataStartIndex = headerRowIndex + 1;

        // 2. Separar Operadores do Rodapé
        const operatorsRaw = [];
        let footerValuesRow = null;

        for (let i = dataStartIndex; i < rows.length; i++) {
            const row = rows[i];
            const firstCol = row[0] ? row[0].toString() : "";

            // Detecta Rodapé: "RESULTADO GERAL DA EQUIPE"
            if (firstCol.includes("RESULTADO GERAL")) {
                // No seu arquivo, os valores estão 2 linhas abaixo do título "RESULTADO..."
                // Linha i = RESULTADO...
                // Linha i+1 = Total Venda; Atingimento... (Headers)
                // Linha i+2 = R$ 209... (Valores)
                if (rows[i+2]) footerValuesRow = rows[i+2];
                break; 
            }
            
            // Valida se é operador (tem nome na coluna 0 e não é linha vazia)
            // Verificamos se row[0] tem texto válido
            if (row[0] && row[0].trim().length > 2) {
                operatorsRaw.push(row);
            }
        }

        // 3. Processar Operadores
        const operators = operatorsRaw.map((row) => {
            console.log(row[17].toString().toUpperCase());
            return {
              supervisor: supervisorName,
              nome: row[0],
              
              // Índices baseados no seu "Copy Paste" do bloco de notas:
              // 0: Nome, 1: Pos, 2: Portab, 3: Ating, 4: MargemR$, 5: MargemQtd, 6: VendaMedia
              posRanking: parseInt(row[1]) || 999,
              vendaPortabilidade: parseNumber(row[2]),
              atingimento: parseNumber(row[3]), // Vai virar 0.03 se for "3%"
              margemValor: parseNumber(row[4]),
              margemQtd: parseInt(row[5]) || 0,
              vendaMedia: parseNumber(row[6]),

              // Receptivo (coluna 7 em diante)
              recLeads: parseInt(row[7]) || 0,
              recTMA: parseTime(row[8]),
              recTMP: parseTime(row[9]),
              recHoras: parseTime(row[10]),
              
              // Ativo (coluna 12 em diante)
              ativLeads: parseInt(row[12]) || 0,
              ativTMA: parseTime(row[13]),
              ativTMP: parseTime(row[14]),
              ativHoras: parseTime(row[15]),
              
              

              periodo: row[17] ? row[17].toString().toUpperCase().trim() : 'INDEFINIDO',
              
              despedido: row[18] ? row[18].toString().toUpperCase().trim() === 'TRUE' : false
            };
        });

        // 4. Processar Resumo (Rodapé)
        const summary = {
            totalVendido: footerValuesRow ? parseNumber(footerValuesRow[0]) : 0,
            atingimentoMedio: footerValuesRow ? parseNumber(footerValuesRow[1]) : 0, // ex: "7%" -> 0.07
            margemTotal: footerValuesRow ? parseNumber(footerValuesRow[2]) : 0,
            ticketMedio: footerValuesRow ? parseNumber(footerValuesRow[3]) : 0,
            tmaGeral: footerValuesRow ? parseTime(footerValuesRow[4]) : "00:00:00",
            posicaoRanking: footerValuesRow ? (parseInt(footerValuesRow[5]) || "-") : "-"
        };
        
        // Fallback se não achar rodapé
        if (!footerValuesRow) {
            summary.totalVendido = operators.reduce((acc, op) => acc + op.vendaPortabilidade, 0);
            summary.margemTotal = operators.reduce((acc, op) => acc + op.margemQtd, 0);
        }

        operators.summary = summary;
        console.log(`[${supervisorName}] Dados carregados: ${operators.length} operadores.`);
        resolve(operators);
      },
      error: (err) => {
          console.error(`Erro ao ler ${supervisorName}:`, err);
          resolve([]);
      }
    });
  });
};