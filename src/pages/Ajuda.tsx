
import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, HelpCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const helpSections = [
  {
    id: "dashboard",
    title: "🧠 Dashboard (Resumo Financeiro)",
    content: {
      description: "A Dashboard é a sua central de visão financeira, onde você acompanha os principais indicadores do sistema com base em tudo o que você cadastrou nas outras páginas (Receitas, Despesas, VR/VA, Investimentos, Objetivos).",
      features: [
        "💳 Cartões de Métricas - Visualize o saldo total, receitas mensais, gastos e investimentos consolidados.",
        "📊 Gráficos Interativos - Acompanhe a evolução das suas finanças com gráficos de despesas por categoria, comparativo receitas x despesas, e muito mais.",
        "📈 Ranking de Gastos - Descubra suas principais categorias de gasto e identifique oportunidades de economia.",
        "🍽️ Controle de VR & VA - Monitore o uso dos seus benefícios de vale-refeição e vale-alimentação, com total rastreabilidade.",
        "🎯 Progresso de Objetivos - Veja como está o andamento de suas metas financeiras com indicadores visuais e atualizações automáticas."
      ],
      howToUse: "Aqui você não cadastra nada diretamente. Os dados são calculados automaticamente a partir dos lançamentos feitos nas páginas de Receitas, Despesas, VR/VA e Investimentos. Os cards e gráficos servem para te ajudar a tomar decisões, mostrando onde você mais gasta, quanto recebe, se investe ou não, entre outros pontos.",
      avoid: "Não tente usar a dashboard como ferramenta de cadastro. Se algo estiver 'zerado', é porque ainda não há lançamentos na origem (ex: nenhuma despesa lançada → o gráfico de gastos ficará vazio).",
      tips: [
        "Analise os gráficos com filtros mensais para identificar padrões de comportamento financeiro.",
        "Utilize o ranking de gastos para criar planos de economia personalizados.",
        "Acompanhe seu saldo geral para tomar decisões mais conscientes ao gastar."
      ]
    }
  },
  {
    id: "receitas",
    title: "💰 Receitas",
    content: {
      description: "Página para registrar todas as entradas de dinheiro que você teve no mês (ex: salário, freela, vendas, bônus).",
      features: [
        "➕ Cadastro de Receitas - Lance qualquer valor recebido: salário, freela, venda ou outros.",
        "🛠️ Edição e Exclusão - Corrija erros com facilidade a qualquer momento.",
        "📦 Cards Informativos - Tenha uma visão rápida do Total de Receitas, Maior Receita, Última Receita e Receita Frequente."
      ],
      howToUse: "Cadastre cada entrada de forma individual, informando valor, data e tipo. Apenas valores que realmente entraram no seu bolso devem ser cadastrados aqui.",
      avoid: "Não cadastre promessas de pagamento ou previsões futuras como receita. Não use a aba de receitas para registrar rendimentos de investimentos. Eles têm uma aba própria.",
      tips: [
        "Registre imediatamente toda entrada de dinheiro para manter a consistência do controle financeiro.",
        "Use os cards de análise para ter total ciência de seus ganhos.",
        "Utilize estrategicamente os dados de receita e as metas financeiras para acelerar o alcance dos seus objetivos."
      ]
    }
  },
  {
    id: "despesas",
    title: "💸 Despesas",
    content: {
      description: "Página para registrar todos os seus gastos, incluindo pagamentos no débito, PIX e no crédito (à vista ou parcelado).",
      features: [
        "➖ Cadastro de Despesas - Inclua gastos via PIX, Débito ou Crédito com todos os detalhes necessários.",
        "💳 Integração com Cartões - Vincule despesas a cartões cadastrados para controle automático de datas e parcelas.",
        "🔗 Acesso ao Controle de Parcelas - Acesse rapidamente a gestão de parcelas futuras.",
        "🧾 Cards Analíticos - Visualize Total de Despesas, Maior Despesa, Última Despesa e Despesa Frequente."
      ],
      howToUse: "Ao cadastrar uma despesa, selecione corretamente a forma de pagamento: PIX/Débito (a despesa entra no dia escolhido), Crédito à vista (entra na fatura do mês escolhido), Crédito parcelado (o sistema gera as parcelas automaticamente). É preciso cadastrar os cartões de crédito na aba CONFIGURAÇÕES para que eles apareçam no formulário. Sempre vincule o cartão de crédito correto para controle da fatura e do limite.",
      avoid: "Não use a aba de despesas para registrar investimentos ou transferências entre contas. Não crie lançamentos aleatórios sem especificar forma de pagamento.",
      tips: [
        "Sempre registre as despesas no momento que elas acontecem para evitar esquecimentos.",
        "Cadastre seus cartões antes de lançar despesas no crédito para manter o controle eficiente.",
        "Use os cards para revisar comportamentos de consumo excessivo."
      ]
    }
  },
  {
    id: "parcelas",
    title: "🧮 Parcelas",
    content: {
      description: "Área onde você visualiza e controla as parcelas geradas a partir de compras feitas no crédito. Ideal para quem compra em várias vezes e precisa acompanhar o que ainda está por vir.",
      features: [
        "📆 Visualização por Cartão - Veja as despesas parceladas organizadas por cartão de crédito.",
        "🔁 Geração Automática de Parcelas - Ao lançar uma despesa parcelada, o sistema gera todas as parcelas automaticamente.",
        "✅ Gestão de Status - Marque como paga ou pendente com apenas um clique.",
        "🔍 Filtros e Busca - Encontre rapidamente parcelas por nome, data, status ou valor."
      ],
      howToUse: "Todas as parcelas são geradas automaticamente quando você cadastra uma despesa no crédito parcelado. Aqui você marca parcelas como pagas à medida que o vencimento acontece. Você pode expandir o card de uma compra para ver todas as suas parcelas.",
      avoid: "Não tente adicionar parcelas manualmente — elas só nascem de uma despesa no crédito. Lembre-se: marcar como paga é manual e precisa ser feito por você mês a mês.",
      tips: [
        "Revise as parcelas futuras para não ser surpreendido por vencimentos.",
        "Marque as parcelas como pagas conforme realiza os pagamentos reais."
      ]
    }
  },
  {
    id: "vrva",
    title: "🥗 VR & VA (Vale Refeição / Alimentação)",
    content: {
      description: "Página exclusiva para registrar os gastos com seus cartões de benefício (VR e VA). Isso permite entender se o saldo está durando o mês todo.",
      features: [
        "🍛 Lançamento de Gastos com VR e VA - Registre tudo o que for pago com os benefícios corporativos.",
        "📅 Histórico Detalhado - Consulte todos os gastos anteriores pelos cards lançados.",
        "🧾 Separação por Categoria - Entenda melhor como você utiliza seus vouchers com base no tipo de consumo (VR ou VA)."
      ],
      howToUse: "Sempre que pagar algo com seu VR ou VA, registre aqui o valor e o tipo. Use os campos corretamente para separar o que foi gasto no cartão refeição (restaurante, marmita) do que foi gasto no cartão alimentação (supermercado, feira).",
      avoid: "Não misture compras feitas com dinheiro ou cartão de crédito aqui — só gastos com VR ou VA. Não registre transferências entre os cartões.",
      tips: [
        "Registre os valores diariamente para evitar perder o controle dos saldos dos seus benefícios.",
        "Use o histórico para saber se o vale está sendo suficiente para o mês.",
        "Crie metas de economia para seus benefícios."
      ]
    }
  },
  {
    id: "investimentos",
    title: "📈 Investimentos",
    content: {
      description: "Página para registrar os aportes e resgates financeiros que você fez em corretoras, bancos ou plataformas de investimento.",
      features: [
        "📊 Gestão de Aportes e Resgates - Lance valores investidos ou retirados rapidamente.",
        "🧠 Análise Macro dos Investimentos - Tenha visão clara sobre quanto tem investido, quantas apólices possui e valor da reserva.",
        "🔐 Histórico de Movimentações - Consulte os registros de investimentos anteriores."
      ],
      howToUse: "Lance sempre que fizer um aporte (investir) ou um resgate (retirar). O sistema calcula automaticamente seu saldo total investido e mostra sua evolução. Use a categoria correta para o tipo de operação (aporte ou resgate).",
      avoid: "Não use essa aba para registrar rendimentos recebidos (isso ainda não é calculado aqui). Não confunda investimento com transferência de conta. Procure não adicionar valores fictícios, mas caso queira 'ver como ficaria', lembre-se de exclui-los para manter a fidelidade dos dados com a realidade.",
      tips: [
        "Atualize sempre que fizer novos aportes ou retiradas.",
        "Compare seus dados com os objetivos financeiros traçados.",
        "Use a visualização macro para manter o foco no crescimento patrimonial."
      ]
    }
  },
  {
    id: "faturas",
    title: "💳 Faturas",
    content: {
      description: "Espelho mensal da fatura dos seus cartões, com todos os lançamentos feitos no crédito, separados por cartão e mês.",
      features: [
        "🗓️ Organização por Cartão e Mês - Veja o total da fatura de cada cartão, mês a mês.",
        "📦 Centralização de Lançamentos - Tenha uma visão unificada de todos os gastos registrados por cartão.",
        "✅ Simulação de Fatura Real - Use a página como apoio para revisar seus gastos antes de pagar sua fatura real."
      ],
      howToUse: "Todos os lançamentos feitos no modo crédito (à vista ou parcelado) aparecem aqui. Serve para você conferir sua fatura do mês antes de pagar — como uma prévia do que virá no app do seu banco. Mostra o total da fatura e os lançamentos vinculados a ela.",
      avoid: "Não é possível lançar valores aqui diretamente. Essa tela é apenas para visualização. Se algum gasto não apareceu, revise se foi lançado com forma de pagamento 'crédito' e se está vinculado ao cartão correto. Só aparecem faturas de cartões que foram cadastrados corretamente.",
      tips: [
        "Use a página de faturas para detectar gastos indevidos ou esquecidos.",
        "Combine com a página de parcelas para ter uma visão completa dos seus compromissos pagos e pendentes.",
        "Faça um fechamento mensal e use essa página como apoio."
      ]
    }
  },
  {
    id: "objetivos",
    title: "🎯 Objetivos e Metas",
    content: {
      description: "A página de Objetivos e Metas é o espaço onde você pode definir sonhos financeiros ou metas específicas, como comprar algo, guardar um valor para uma viagem, formar uma reserva de emergência ou alcançar um valor investido. Essa funcionalidade te ajuda a acompanhar o progresso de forma visual e motivadora, com base nos aportes que você mesmo adiciona.",
      features: [
        "🚀 Criação de Objetivos Personalizados - Defina nome, valor, prazos e vincule metas.",
        "📈 Monitoramento de Progresso - Veja como está avançando rumo aos seus sonhos.",
        "🧩 Metas Interligadas - Divida grandes objetivos em metas menores para facilitar o acompanhamento."
      ],
      howToUse: "Crie um objetivo informando: Nome do objetivo, Valor total desejado, Data meta (previsão de quando quer alcançar). Faça aportes manuais sempre que destinar um valor a esse objetivo. Isso representa o quanto você separou para ele naquele momento. A barra de progresso irá aumentar automaticamente conforme você adiciona os aportes. Você pode editar ou excluir objetivos caso algo mude nos seus planos.",
      avoid: "Não cadastre objetivos sem um valor ou data definidos — isso pode atrapalhar sua própria visão de progresso. Não use essa página para registrar despesas ou investimentos comuns — aqui é só para metas específicas com um propósito claro. Evite criar objetivos com valores irreais que você não pretende de fato perseguir. Não registre aportes fictícios — o sistema não faz validação cruzada com contas ou saldo, então depende da sua disciplina e consistência.",
      tips: [
        "Sempre que guardar dinheiro para um objetivo, registre no sistema.",
        "Use a divisão por metas para manter sua motivação ativa.",
        "Visualize o progresso regularmente para ajustar prazos e valores, se necessário."
      ]
    }
  },
  {
    id: "configuracoes",
    title: "⚙️ Configurações",
    content: {
      description: "Área para ajustar configurações essenciais, como cadastro de cartões, saldos iniciais e dados pessoais.",
      features: [
        "👤 Configuração de Perfil e Dados - Atualize suas informações pessoais e preferências.",
        "💼 Cadastro de Cartões - Insira dados reais dos cartões para controlar limite, vencimentos e lançamentos.",
        "💵 Definição de Saldos Iniciais - Comece o uso do app com os valores corretos que você já possui em conta."
      ],
      howToUse: "Cadastre todos os cartões de crédito que você usar, informando: Nome, Vencimento da fatura, Limite total. Defina saldos iniciais nas áreas apropriadas antes de começar a usar o sistema. Atualize dados pessoais como nome e e-mail, se necessário.",
      avoid: "Não deixe de cadastrar seus cartões antes de lançar despesas no crédito. Não invente cartões fictícios apenas para 'testar' — isso impacta diretamente a fatura e o limite. Não mude vencimentos ou limites sem revisar os impactos nas faturas e parcelas futuras.",
      tips: [
        "Cadastre todos os seus cartões antes de lançar despesas no crédito.",
        "Utilize os saldos iniciais para começar o controle a partir de um ponto real da sua vida financeira.",
        "Mantenha os dados sempre atualizados para relatórios e gráficos mais precisos."
      ]
    }
  }
];

export default function Ajuda() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");
  const [option, setOption] = useState("ajuda");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const handleSubmitMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ajuda')
        .insert({
          opcao: option,
          mensagem: message.trim()
        });

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso. Nossa equipe entrará em contato em breve.",
      });

      setMessage("");
      setShowContactForm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="finwise-icon-container finwise-icon-blue">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="finwise-page-title">Central de Ajuda</h1>
          </div>
          <p className="finwise-page-subtitle mb-4">Tire todas as suas dúvidas sobre o sistema</p>
          <div className="inline-block bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold text-lg">
              📚 Guia Completo do Sistema
            </span>
          </div>
        </div>

        {/* Help Sections */}
        <div className="space-y-6 mb-8">
          {helpSections.map((section) => (
            <Card key={section.id} className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-xl">
              <Collapsible 
                open={openSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors rounded-lg">
                    <h3 className="text-xl font-bold text-white text-left">{section.title}</h3>
                    {openSections.has(section.id) ? (
                      <ChevronDown className="w-5 h-5 text-white/70" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-white/70" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-6">
                    {/* Descrição */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        📝 O que é?
                      </h4>
                      <p className="text-white/80">{section.content.description}</p>
                    </div>

                    {/* Funcionalidades */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        ⭐ Funcionalidades Principais
                      </h4>
                      <ul className="space-y-2">
                        {section.content.features.map((feature, index) => (
                          <li key={index} className="text-white/80 text-sm">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Como usar */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        ✅ Como usar corretamente
                      </h4>
                      <p className="text-white/80 text-sm">{section.content.howToUse}</p>
                    </div>

                    {/* Evitar */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        ⚠️ Evite
                      </h4>
                      <p className="text-white/80 text-sm">{section.content.avoid}</p>
                    </div>

                    {/* Dicas */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        💡 Dicas de Uso
                      </h4>
                      <ul className="space-y-1">
                        {section.content.tips.map((tip, index) => (
                          <li key={index} className="text-white/80 text-sm">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="p-8 text-center">
            <div className="finwise-icon-container finwise-icon-blue mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Precisa de Mais Ajuda? Deseja enviar um Feedback?</h3>
            <p className="text-white/70 mb-6">
              Não encontrou o que procurava? Ou deseja incluir uma sugestão? Nossa equipe está sempre pronta para ajudar!
            </p>
            
            {!showContactForm ? (
              <Button 
                className="finwise-gradient-button"
                onClick={() => setShowContactForm(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Entrar em Contato
              </Button>
            ) : (
              <div className="space-y-4 max-w-md mx-auto">
                <Textarea
                  placeholder="Digite sua mensagem aqui..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  rows={4}
                />
                
                <RadioGroup value={option} onValueChange={setOption} className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ajuda" id="ajuda" className="border-white/30 text-white" />
                    <Label htmlFor="ajuda" className="text-white">Ajuda</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="feedback" id="feedback" className="border-white/30 text-white" />
                    <Label htmlFor="feedback" className="text-white">Feedback</Label>
                  </div>
                </RadioGroup>

                <div className="flex space-x-3 justify-center">
                  <Button 
                    onClick={handleSubmitMessage}
                    disabled={isSubmitting}
                    className="finwise-gradient-button"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowContactForm(false);
                      setMessage("");
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
