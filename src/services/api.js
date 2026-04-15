const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getEquipes = async (periodo = 'mes_passado') => {
  const response = await fetch(`${API_BASE_URL}/api/fechamento/equipes?periodo=${periodo}`);
  if (!response.ok) throw new Error('Erro ao buscar dados das equipes');
  return response.json();
};

export const getRanking = async (periodo = 'mes_passado') => {
  const response = await fetch(`${API_BASE_URL}/api/fechamento/ranking?periodo=${periodo}`);
  if (!response.ok) throw new Error('Erro ao buscar ranking');
  return response.json();
};
