
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDespesaForm } from "@/components/despesas/hooks/useDespesaForm";
import { DespesaFormFields } from "@/components/despesas/DespesaFormFields";

interface FormularioDespesaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingDespesa?: any;
}

export function FormularioDespesa({ isOpen, onClose, onSuccess, editingDespesa }: FormularioDespesaProps) {
  const { formData, setFormData, cartoes, handleSubmit } = useDespesaForm(editingDespesa, onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">
            {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <DespesaFormFields 
            formData={formData}
            setFormData={setFormData}
            cartoes={cartoes}
          />
          
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
              {editingDespesa ? 'Confirmar Edição' : 'Salvar'}
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
