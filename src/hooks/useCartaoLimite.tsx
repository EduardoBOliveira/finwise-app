
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LimiteCartao {
  cartaoId: string;
  limiteTotal: number;
  limiteEmUso: number;
  limiteDisponivel: number;
  percentualUso: number;
}

export const useCartaoLimite = () => {
  const { user } = useAuth();
  const [limitesCartoes, setLimitesCartoes] = useState<Record<string, LimiteCartao>>({});

  const calcularLimiteCartao = async (cartaoId: string, limiteTotal: number) => {
    if (!user || limiteTotal === 0) {
      return {
        cartaoId,
        limiteTotal,
        limiteEmUso: 0,
        limiteDisponivel: limiteTotal,
        percentualUso: 0
      };
    }

    // Buscar despesas pendentes do cartão
    const { data: despesas, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('cartao_id', cartaoId)
      .eq('modalidade', 'Cartão Crédito')
      .eq('status', 'Pendente');

    if (error) {
      console.error('Erro ao buscar despesas do cartão:', error);
      return {
        cartaoId,
        limiteTotal,
        limiteEmUso: 0,
        limiteDisponivel: limiteTotal,
        percentualUso: 0
      };
    }

    // Calcular limite em uso (soma das parcelas pendentes)
    const limiteEmUso = despesas?.reduce((total, despesa) => {
      return total + (despesa.valor_parcela || 0);
    }, 0) || 0;

    const limiteDisponivel = limiteTotal - limiteEmUso;
    const percentualUso = limiteTotal > 0 ? (limiteEmUso / limiteTotal) * 100 : 0;

    return {
      cartaoId,
      limiteTotal,
      limiteEmUso,
      limiteDisponivel,
      percentualUso
    };
  };

  const fetchLimitesCartoes = async () => {
    if (!user) return;

    // Buscar todos os cartões do usuário
    const { data: cartoes, error } = await supabase
      .from('cartoes')
      .select('*')
      .eq('usuario_id', user.id);

    if (error) {
      console.error('Erro ao buscar cartões:', error);
      return;
    }

    const limitesCalculados: Record<string, LimiteCartao> = {};

    // Calcular limite para cada cartão
    for (const cartao of cartoes || []) {
      const limite = await calcularLimiteCartao(cartao.id, cartao.limite_total || 0);
      limitesCalculados[cartao.id] = limite;
    }

    setLimitesCartoes(limitesCalculados);
  };

  useEffect(() => {
    fetchLimitesCartoes();
  }, [user]);

  return {
    limitesCartoes,
    calcularLimiteCartao,
    fetchLimitesCartoes
  };
};
