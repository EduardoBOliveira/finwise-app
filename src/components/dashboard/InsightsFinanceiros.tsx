
export function InsightsFinanceiros() {
  const insights = [
    {
      tipo: 'Economia Detectada',
      titulo: 'Economia detectada!',
      descricao: 'Você economizou R$ 400,00 este mês usando os vales de forma inteligente.',
      cor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icone: '💡'
    },
    {
      tipo: 'Atenção',
      titulo: 'Atenção',
      descricao: 'Gastos com entretenimento aumentaram 12% este mês. Considere revisar o orçamento desta categoria.',
      cor: 'bg-gradient-to-r from-orange-500 to-yellow-500',
      icone: '⚠️'
    },
    {
      tipo: 'Meta Alcançada',
      titulo: 'Meta Alcançada',
      descricao: 'Parabéns! Você atingiu sua meta de economia mensal com 5 dias de antecedência.',
      cor: 'bg-gradient-to-r from-blue-500 to-purple-500',
      icone: '🎯'
    }
  ];

  return (
    <div className="finwise-glass-card hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center mb-6">
        <div className="finwise-icon-container finwise-icon-purple mr-3">
          📊
        </div>
        <h3 className="text-white text-xl font-bold">Insights Financeiros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg ${insight.cor} hover:scale-105 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2 animate-pulse">{insight.icone}</span>
              <span className="text-white font-medium text-sm">{insight.tipo}</span>
            </div>
            <h4 className="text-white font-bold mb-2">{insight.titulo}</h4>
            <p className="text-white/90 text-sm">{insight.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
