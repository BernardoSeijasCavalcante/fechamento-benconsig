const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getEquipes = async () => {
  const response = await fetch(`${API_BASE_URL}/api/fechamento/equipes`);
  if (!response.ok) throw new Error('Erro ao buscar dados das equipes');
  return response.json();
};

export const getRanking = async () => {
  const response = await fetch(`${API_BASE_URL}/api/fechamento/ranking`);
  if (!response.ok) throw new Error('Erro ao buscar ranking');
  return response.json();
};
