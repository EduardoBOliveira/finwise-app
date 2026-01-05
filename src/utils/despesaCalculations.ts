
// Função corrigida para calcular a data de pagamento baseada em períodos de fatura
export const calcularDataPagamento = (dataCompra: string, vencimento: number, fechamento: number): Date => {
  // Garantir que dataCompra seja uma data válida no formato ISO com o fuso Brasil
  const dataCompraDate = new Date(dataCompra + 'T12:00:00-03:00');
  const ano = dataCompraDate.getFullYear();
  const mes = dataCompraDate.getMonth();
  const diaCompra = dataCompraDate.getDate();
  
  // Determinar o período da fatura baseado nos fechamentos
  // Período atual: do dia (fechamento + 1) do mês anterior até o dia fechamento do mês atual
  
  // Data do fechamento do mês atual
  const fechamentoAtual = new Date(ano, mes, fechamento, 12, 0, 0);
  
  // Data do fechamento do mês anterior
  const fechamentoAnterior = new Date(ano, mes - 1, fechamento, 12, 0, 0);
  
  // Se a compra foi feita APÓS o fechamento do mês atual (ou no mesmo dia)
  if (diaCompra >= fechamento) {
    // A compra entra no período da próxima fatura
    // Vencimento será no mês + 2 em relação ao mês da compra
    return new Date(ano, mes + 2, vencimento, 12, 0, 0);
  } else {
    // A compra foi feita ANTES do fechamento do mês atual
    // A compra entra no período da fatura atual
    // Vencimento será no mês + 1 em relação ao mês da compra
    return new Date(ano, mes + 1, vencimento, 12, 0, 0);
  }
};

// Função para calcular a data de cada parcela subsequente
export const calcularDataParcela = (dataPagamento: Date, numeroParcela: number): Date => {
  const dataParcela = new Date(dataPagamento);
  dataParcela.setMonth(dataPagamento.getMonth() + numeroParcela - 1);
  return dataParcela;
};

export const generateIdCompra = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
