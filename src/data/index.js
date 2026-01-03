// src/data/index.js

// O sufixo ?raw é essencial para o Vite ler o CSV como texto e não como código JS
import gabrielCsv from './EQUIPE_GABRIEL.csv?raw';
import kailayneCsv from './EQUIPE_KAILAYNE.csv?raw';
import nauallyCsv from './EQUIPE_NAUALLY.csv?raw';
import diegoCsv from './EQUIPE_DIEGO.csv?raw';
import kawanyCsv from './EQUIPE_KAWANY.csv?raw';

// Exportamos uma lista estruturada que o App.jsx vai consumir
export const TEAM_FILES = [
  { supervisor: 'NAUALLY', content: nauallyCsv },
  { supervisor: 'DIEGO', content: diegoCsv },
  { supervisor: 'KAWANY', content: kawanyCsv },
  { supervisor: 'KAILAYNE', content: kailayneCsv },
  { supervisor: 'GABRIEL', content: gabrielCsv }
];
