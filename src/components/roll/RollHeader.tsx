import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { OptionStructure } from '../../types/trading';

interface RollHeaderProps {
  structure: OptionStructure;
  onCancel: () => void;
}

export default function RollHeader({ structure, onCancel }: RollHeaderProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <RotateCcw className="w-8 h-8 mr-3" />
          <div>
            <h2 className="text-2xl font-bold">Rolagem de Posições</h2>
            <p className="text-orange-100">{structure.nome}</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-orange-200">Pernas: </span>
          <span className="font-medium">{structure.legs.length}</span>
        </div>
        <div>
          <span className="text-orange-200">Prêmio Atual: </span>
          <span className="font-medium">{formatCurrency(structure.premioLiquido)}</span>
        </div>
      </div>
    </div>
  );
}