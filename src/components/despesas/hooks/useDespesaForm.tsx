
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calcularDataPagamento, calcularDataParcela, generateIdCompra } from "@/utils/despesaCalculations";

export const useDespesaForm = (editingDespesa: any, onSuccess: () => void, onClose: () => void) => {
  const { user } = useAuth();
  const [cartoes, setCartoes] = useState([]);
  const [formData, setFormData] = useState({
    descricao: "",
    valorTotal: "",
    modalidade: "",
    cartaoId: "",
    valorParcela: "",
    numeroParcelas: "",
    categoria: "",
    data: "",
    despesaFixa: false
  });

  const fetchCartoes = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('apelido', { ascending: true });

      if (!error) {
        setCartoes(data || []);
      }
    }
  };

  useEffect(() => {
    fetchCartoes();
  }, [user]);

  useEffect(() => {
    if (editingDespesa) {
      setFormData({
        descricao: editingDespesa.descricao || "",
        valorTotal: editingDespesa.modalidade === 'Cartão Crédito' ? 
          (editingDespesa.valor_parcela * editingDespesa.parcelas_total).toString() : 
          editingDespesa.valor?.toString() || "",
        modalidade: editingDespesa.modalidade || "",
        cartaoId: editingDespesa.cartao_id || "",
        valorParcela: editingDespesa.valor_parcela?.toString() || "",
        numeroParcelas: editingDespesa.parcelas_total?.toString() || "",
        categoria: editingDespesa.categoria || "",
        data: editingDespesa.data_compra || editingDespesa.data || "",
        despesaFixa: editingDespesa.despesa_fixa || false
      });
    } else {
      setFormData({
        descricao: "",
        valorTotal: "",
        modalidade: "",
        cartaoId: "",
        valorParcela: "",
        numeroParcelas: "",
        categoria: "",
        data: "",
        despesaFixa: false
      });
    }
  }, [editingDespesa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const valorTotal = parseFloat(formData.valorTotal);
    const numeroParcelas = formData.modalidade === "Cartão Crédito" ? parseInt(formData.numeroParcelas) : 1;
    const valorParcela = formData.modalidade === "Cartão Crédito" ? parseFloat(formData.valorParcela) : valorTotal;
    const idCompra = editingDespesa?.id_compra || generateIdCompra();

    // Buscar dados do cartão se necessário
    let cartaoSelecionado = null;
    if ((formData.modalidade === "Cartão Crédito" || formData.modalidade === "Cartão Débito") && formData.cartaoId) {
      const { data: cartaoData } = await supabase
        .from('cartoes')
        .select('*')
        .eq('id', formData.cartaoId)
        .single();
      cartaoSelecionado = cartaoData;
    }

    if (formData.modalidade === "Cartão Crédito" && numeroParcelas > 0 && cartaoSelecionado) {
      try {
        if (editingDespesa) {
          // Primeiro, excluir todas as parcelas existentes
          await supabase
            .from('despesas')
            .delete()
            .eq('id_compra', editingDespesa.id_compra);
        }

        // Calcular data de pagamento inicial com a lógica corrigida
        const dataPagamentoInicial = calcularDataPagamento(
          formData.data, 
          cartaoSelecionado.vencimento_fatura, 
          cartaoSelecionado.fechamento_fatura
        );
        
        // Criar novas parcelas com as datas corretas
        const despesas = [];
        for (let i = 1; i <= numeroParcelas; i++) {
          const dataPagamentoParcela = calcularDataParcela(dataPagamentoInicial, i);
          
          despesas.push({
            descricao: formData.descricao,
            valor: valorParcela,
            categoria: formData.categoria,
            data: formData.data,
            data_compra: formData.data,
            data_pagamento: dataPagamentoParcela.toISOString().split('T')[0],
            modalidade: formData.modalidade,
            cartao_id: formData.cartaoId,
            parcelas_total: numeroParcelas,
            parcela_atual: i,
            id_compra: idCompra,
            valor_parcela: valorParcela,
            status: 'Pendente',
            usuario_id: user.id,
            despesa_fixa: formData.despesaFixa
          });
        }

        const { error } = await supabase
          .from('despesas')
          .insert(despesas);
        
        if (error) throw error;
      } catch (error) {
        console.error('Erro ao salvar despesa:', error);
      }
    } else {
      // Para outras modalidades ou compra à vista
      const despesaData = {
        descricao: formData.descricao,
        valor: valorTotal,
        categoria: formData.categoria,
        data: formData.data,
        data_compra: formData.data,
        data_pagamento: formData.data,
        modalidade: formData.modalidade,
        cartao_id: (formData.modalidade === "Cartão Débito" || formData.modalidade === "Cartão Crédito") ? formData.cartaoId : null,
        parcelas_total: 1,
        parcela_atual: 1,
        id_compra: idCompra,
        valor_parcela: valorTotal,
        status: 'Pago',
        usuario_id: user.id,
        despesa_fixa: formData.despesaFixa
      };

      try {
        if (editingDespesa) {
          const { error } = await supabase
            .from('despesas')
            .update(despesaData)
            .eq('id', editingDespesa.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('despesas')
            .insert([despesaData]);
          
          if (error) throw error;
        }
      } catch (error) {
        console.error('Erro ao salvar despesa:', error);
      }
    }
    
    onSuccess();
    onClose();
  };

  return {
    formData,
    setFormData,
    cartoes,
    handleSubmit
  };
};
