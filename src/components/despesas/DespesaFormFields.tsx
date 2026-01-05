import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DespesaFormFieldsProps {
  formData: {
    descricao: string;
    valorTotal: string;
    modalidade: string;
    cartaoId: string;
    valorParcela: string;
    numeroParcelas: string;
    categoria: string;
    data: string;
    despesaFixa: boolean;
  };
  setFormData: (data: any) => void;
  cartoes: any[];
}

export function DespesaFormFields({ formData, setFormData, cartoes }: DespesaFormFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="descricao" className="text-white/70 text-sm mb-1 block">Descrição</Label>
        <Input
          id="descricao"
          placeholder="Descrição"
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      
      <div>
        <Label htmlFor="valorTotal" className="text-white/70 text-sm mb-1 block">Valor Total</Label>
        <Input
          id="valorTotal"
          type="number"
          step="0.01"
          placeholder="Valor Total (R$)"
          value={formData.valorTotal}
          onChange={(e) => setFormData({...formData, valorTotal: e.target.value})}
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      
      <div>
        <Label className="text-white/70 text-sm mb-1 block">Modalidade</Label>
        <Select value={formData.modalidade} onValueChange={(value) => setFormData({...formData, modalidade: value, cartaoId: ""})}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Modalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
            <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(formData.modalidade === "Cartão Débito" || formData.modalidade === "Cartão Crédito") && (
        <div>
          <Label className="text-white/70 text-sm mb-1 block">Cartão</Label>
          <Select value={formData.cartaoId} onValueChange={(value) => setFormData({...formData, cartaoId: value})}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Selecione o cartão" />
            </SelectTrigger>
            <SelectContent>
              {cartoes.map((cartao) => (
                <SelectItem key={cartao.id} value={cartao.id}>
                  {cartao.apelido} ({cartao.bandeira})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.modalidade === "Cartão Crédito" && (
        <>
          <div>
            <Label htmlFor="valorParcela" className="text-white/70 text-sm mb-1 block">Valor da Parcela</Label>
            <Input
              id="valorParcela"
              type="number"
              step="0.01"
              placeholder="Valor da Parcela"
              value={formData.valorParcela}
              onChange={(e) => setFormData({...formData, valorParcela: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="numeroParcelas" className="text-white/70 text-sm mb-1 block">Número de Parcelas</Label>
            <Input
              id="numeroParcelas"
              type="number"
              placeholder="Número de Parcelas"
              value={formData.numeroParcelas}
              onChange={(e) => setFormData({...formData, numeroParcelas: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </>
      )}
      
      <div>
        <Label className="text-white/70 text-sm mb-1 block">Categoria</Label>
        <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alimentação">Alimentação</SelectItem>
            <SelectItem value="Transporte">Transporte</SelectItem>
            <SelectItem value="Saúde">Saúde</SelectItem>
            <SelectItem value="Educação">Educação</SelectItem>
            <SelectItem value="Lazer">Lazer</SelectItem>
            <SelectItem value="Presente">Presente</SelectItem>
            <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
            <SelectItem value="Vestuário">Vestuário</SelectItem>
            <SelectItem value="Streaming">Streaming</SelectItem>
            <SelectItem value="Contas">Contas</SelectItem>
            <SelectItem value="Mercado">Mercado</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="text-white/70 text-sm mb-1 block">Essa é uma despesa fixa?</Label>
        <RadioGroup 
          value={formData.despesaFixa ? "sim" : "nao"} 
          onValueChange={(value) => setFormData({...formData, despesaFixa: value === "sim"})}
          className="flex flex-row space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao" id="nao" className="border-white/20 text-white" />
            <Label htmlFor="nao" className="text-white/70 text-sm">Não</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sim" id="sim" className="border-white/20 text-white" />
            <Label htmlFor="sim" className="text-white/70 text-sm">Sim</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="data" className="text-white/70 text-sm mb-1 block">Data</Label>
        <Input
          id="data"
          type="date"
          value={formData.data}
          onChange={(e) => setFormData({...formData, data: e.target.value})}
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
    </>
  );
}
