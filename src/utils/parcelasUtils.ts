
export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T12:00:00-03:00');
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
};

export const getCategoriaIcon = (categoria: string) => {
  const icons: { [key: string]: string } = {
    'Alimentação': '🍕',
    'Saúde': '🏥',
    'Educação': '📚',
    'Lazer': '🎮',
    'Presente': '🎁',
    'Eletrônicos': '📱',
    'Vestuário': '👕',
    'Streaming': '📺',
    'Contas': '📄',
    'Outros': '💼'
  };
  return icons[categoria] || '💼';
};
